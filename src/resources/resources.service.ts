import {
  Injectable,
  NotFoundException
} from '@nestjs/common'

import { PrismaService } from 'src/prisma/prisma.service'

import { CreateResourceDto } from './dto/create-resource.dto'
import { UpdateResourceDto } from './dto/update-resource.dto'
import { FilterResourceDto } from './dto/filter-resource.dto'

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateResourceDto, userId: string) {
    return this.prisma.resource.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        url: dto.url,

        category: {
          connect: {
            id: dto.categoryId
          }
        },

        createdBy: {
          connect: {
            id: userId
          }
        },

        tags: {
          create: dto.tags.map(tag => ({
            tag: {
              connectOrCreate: {
                where: {
                  name: tag
                },

                create: {
                  name: tag
                }
              }
            }
          }))
        }
      },

      include: {
        category: true,

        tags: {
          include: {
            tag: true
          }
        }
      }
    })
  }

  async findAll(filters: FilterResourceDto) {
    return this.prisma.resource.findMany({
      where: {
        AND: [
          filters.category
            ? {
                category: {
                  slug: filters.category
                }
              }
            : {},

          filters.search
            ? {
                OR: [
                  {
                    title: {
                      contains: filters.search,
                      mode: 'insensitive'
                    }
                  },

                  {
                    description: {
                      contains: filters.search,
                      mode: 'insensitive'
                    }
                  },

                  {
                    tags: {
                      some: {
                        tag: {
                          name: {
                            contains: filters.search,
                            mode: 'insensitive'
                          }
                        }
                      }
                    }
                  }
                ]
              }
            : {}
        ]
      },

      include: {
        category: true,

        tags: {
          include: {
            tag: true
          }
        }
      },

      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },

      include: {
        category: true,

        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!resource) {
      throw new NotFoundException('Recurso não encontrado')
    }

    return resource
  }

  async update(
    id: string,
    dto: UpdateResourceDto
  ) {
    await this.findOne(id)

    return this.prisma.resource.update({
      where: { id },

      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        url: dto.url,

        ...(dto.categoryId && {
          category: {
            connect: {
              id: dto.categoryId
            }
          }
        })
      },

      include: {
        category: true,

        tags: {
          include: {
            tag: true
          }
        }
      }
    })
  }

  async remove(id: string) {
    await this.findOne(id)

    return this.prisma.resource.delete({
      where: { id }
    })
  }
}