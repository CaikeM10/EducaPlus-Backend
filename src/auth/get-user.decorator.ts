import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from './types/authenticated-user.type';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);
