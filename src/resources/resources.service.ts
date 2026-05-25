import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';

import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import {
  createPaginatedResponse,
  getPagination,
} from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';

import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { FilterResourceDto } from './dto/filter-resource.dto';

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
        thumbnail: dto.thumbnail,

        category: {
          connect: {
            id: dto.categoryId,
          },
        },

        createdBy: {
          connect: {
            id: userId,
          },
        },

        tags: dto.tags?.length
          ? {
              create: dto.tags.map((tag) => {
                const normalizedTag = tag.trim().toLowerCase();

                return {
                  tag: {
                    connectOrCreate: {
                      where: {
                        name: normalizedTag,
                      },

                      create: {
                        name: normalizedTag,
                      },
                    },
                  },
                };
              }),
            }
          : undefined,
      },

      include: {
        category: true,

        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async findAllPaginated(filters: FilterResourceDto) {
    const { page, limit, skip, take } = getPagination(filters);
    const where = this.buildWhere(filters);
    const orderBy = this.buildOrderBy(filters.sort, filters.order);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.resource.findMany({
        where,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.resource.count({ where }),
    ]);

    return createPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },

      include: {
        category: true,

        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException('Recurso não encontrado');
    }

    return resource;
  }

  async recordDownload(id: string, userId: string) {
    await this.findOne(id);

    return this.prisma.resourceDownload.create({
      data: {
        resourceId: id,
        userId,
      },
    });
  }

  async update(id: string, dto: UpdateResourceDto, user: AuthenticatedUser) {
    const resource = await this.findOne(id);
    this.assertCanManage(resource.createdById, user);

    return this.prisma.resource.update({
      where: { id },

      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        url: dto.url,
        thumbnail: dto.thumbnail,

        ...(dto.categoryId && {
          category: {
            connect: {
              id: dto.categoryId,
            },
          },
        }),
      },

      include: {
        category: true,

        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const resource = await this.findOne(id);
    this.assertCanManage(resource.createdById, user);

    return this.prisma.resource.delete({
      where: { id },
    });
  }

  private assertCanManage(createdById: string, user: AuthenticatedUser) {
    if (createdById !== user.id && user.role !== RoleType.ADMIN) {
      throw new ForbiddenException('Acesso negado ao recurso');
    }
  }

  private buildWhere(filters: FilterResourceDto) {
    const tags = filters.tags
      ?.split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    return {
      AND: [
        filters.category
          ? {
              category: {
                slug: filters.category,
              },
            }
          : {},
        filters.type ? { type: filters.type as never } : {},
        filters.userId ? { createdById: filters.userId } : {},
        filters.from || filters.to
          ? {
              createdAt: {
                ...(filters.from && { gte: new Date(filters.from) }),
                ...(filters.to && { lte: new Date(filters.to) }),
              },
            }
          : {},
        tags?.length
          ? {
              tags: {
                some: {
                  tag: {
                    name: {
                      in: tags,
                    },
                  },
                },
              },
            }
          : {},
        filters.search
          ? {
              OR: [
                {
                  title: {
                    contains: filters.search,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  description: {
                    contains: filters.search,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  tags: {
                    some: {
                      tag: {
                        name: {
                          contains: filters.search,
                          mode: 'insensitive' as const,
                        },
                      },
                    },
                  },
                },
              ],
            }
          : {},
      ],
    };
  }

  private buildOrderBy(sort: string, order: 'asc' | 'desc') {
    const allowed = ['createdAt', 'updatedAt', 'title', 'type'];
    const field = allowed.includes(sort) ? sort : 'createdAt';

    return { [field]: order };
  }
}
