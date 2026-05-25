import { createPaginatedResponse, getPagination } from './pagination.util';

describe('pagination utils', () => {
  it('calculates skip and take from page and limit', () => {
    expect(getPagination({ page: 3, limit: 20 })).toEqual({
      page: 3,
      limit: 20,
      skip: 40,
      take: 20,
    });
  });

  it('builds pagination metadata', () => {
    const response = createPaginatedResponse([1, 2], 12, 2, 5);

    expect(response.meta).toEqual({
      page: 2,
      limit: 5,
      total: 12,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});
