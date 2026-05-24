import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginatedResponse } from '../responses/paginated-response.type';

export function getPagination(query: PaginationQueryDto) {
  const page = query.page || 1;
  const limit = query.limit || 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
