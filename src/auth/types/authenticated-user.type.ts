import { RoleType } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: RoleType;
};
