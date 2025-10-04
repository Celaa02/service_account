import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export type AuthUser = { id: string; email: string };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.user as AuthUser;
  },
);
