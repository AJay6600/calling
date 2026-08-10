import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequestType } from './zitadel-auth.guard';

/**
 * Use inside any controller method protected by ZitadelAuthGuard to pull
 * the verified userId/orgId without touching the raw request.
 *
 * Example: getMe(@CurrentAuth() auth: AuthenticatedRequestType['auth']) { ... }
 */
export const CurrentAuth = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequestType>();

  return request.auth;
});
