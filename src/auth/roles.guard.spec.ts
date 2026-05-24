import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  it('allows users with a required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([RoleType.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user-id', email: 'admin@test.com', role: RoleType.ADMIN },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('blocks users without a required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([RoleType.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-id',
            email: 'teacher@test.com',
            role: RoleType.TEACHER,
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(false);
  });
});
