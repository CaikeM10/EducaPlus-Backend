import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateLearningPathDto } from './dto/create-learning-path.dto'
import { UpdateProgressDto } from './dto/progress.dto'

@Injectable()
export class LearningPathService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // CREATE
  // =========================
  async create(dto: CreateLearningPathDto, userId: string) {
    return this.prisma.learningPath.create({
      data: {
        title: dto.title,
        description: dto.description,
        level: dto.level,
        category: dto.category,
        duration: dto.duration,

        createdBy: {
          connect: { id: userId }
        },

        steps: {
          create: dto.steps.map(step => ({
            title: step.title,
            description: step.description,
            position: step.position,

            resources: {
              create: step.resources.map(resource => ({
                title: resource.title,
                description: resource.description,
                type: resource.type,
                url: resource.url,

                category: {
                  connect: {
                    id: resource.categoryId
                  }
                },

                createdBy: {
                  connect: { id: userId }
                }
              }))
            }
          }))
        }
      },

      include: {
        steps: {
          include: {
            resources: {
              include: {
                category: true,
                tags: {
                  include: {
                    tag: true
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  // =========================
  // FIND ALL (BASIC)
  // =========================
  async findAll(userId?: string) {
    const learningPaths = await this.prisma.learningPath.findMany({
      include: {
        steps: {
          include: {
            progress: userId
              ? {
                  where: { userId }
                }
              : false
          }
        }
      }
    })

    return learningPaths.map(path => {
      const steps = path.steps.map(step => ({
        id: step.id,
        title: step.title,
        completed: step.progress?.some(p => p.completed) || false
      }))

      const progress =
        steps.length === 0
          ? 0
          : Math.round(
              (steps.filter(s => s.completed).length / steps.length) * 100
            )

      return {
        id: path.id,
        title: path.title,
        description: path.description,
        level: path.level,
        category: path.category,
        duration: path.duration,
        progress,
        steps
      }
    })
  }

  // =========================
  // FIND ONE
  // =========================
  async findOne(id: string, userId?: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id },
      include: {
        steps: {
          include: {
            progress: userId
              ? {
                  where: { userId }
                }
              : false
          }
        }
      }
    })

    if (!path) return null

    const steps = path.steps.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      completed: step.progress?.some(p => p.completed) || false
    }))

    const progress =
      steps.length === 0
        ? 0
        : Math.round(
            (steps.filter(s => s.completed).length / steps.length) * 100
          )

    return {
      id: path.id,
      title: path.title,
      description: path.description,
      level: path.level,
      category: path.category,
      duration: path.duration,
      progress,
      steps
    }
  }

  // =========================
  // UPDATE PROGRESS
  // =========================
  async updateProgress(userId: string, dto: UpdateProgressDto) {
    return this.prisma.userProgress.upsert({
      where: {
        userId_stepId: {
          userId,
          stepId: dto.stepId
        }
      },
      update: {
        completed: dto.completed
      },
      create: {
        userId,
        stepId: dto.stepId,
        completed: dto.completed
      }
    })
  }

  // =========================
  // WITH PROGRESS (DASHBOARD READY)
  // =========================
  async getLearningPathsWithProgress(userId: string) {
    const learningPaths = await this.prisma.learningPath.findMany({
      include: {
        steps: {
          include: {
            progress: {
              where: { userId }
            }
          }
        }
      }
    })

    return learningPaths.map(path => {
      const steps = path.steps.map(step => ({
        id: step.id,
        title: step.title,
        completed: step.progress.some(p => p.completed)
      }))

      const progress =
        steps.length === 0
          ? 0
          : Math.round(
              (steps.filter(s => s.completed).length / steps.length) * 100
            )

      return {
        id: path.id,
        title: path.title,
        description: path.description,
        level: path.level,
        category: path.category,
        duration: path.duration,
        progress,
        steps
      }
    })
  }
}