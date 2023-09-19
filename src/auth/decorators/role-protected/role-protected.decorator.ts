import { SetMetadata } from '@nestjs/common';

export const RoleProtected = (...args: string[]) => {
  return SetMetadata('role-protected', args);
};
