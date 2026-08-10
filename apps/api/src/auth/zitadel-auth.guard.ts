import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Request } from 'express';

export type AuthenticatedRequestType = Request & {
  auth: {
    userId: string;
    orgId: string | null;
    rawClaims: Record<string, unknown>;
  };
};

const rawZitadelIssuer = process.env['ZITADEL_ISSUER'];

const zitadelAudience = process.env['ZITADEL_AUDIENCE'];

const zitadelIssuer = rawZitadelIssuer !== undefined ? rawZitadelIssuer.replace(/\/+$/, '') : '';

const jwksUri = zitadelIssuer !== '' ? `${zitadelIssuer}/oauth/v2/keys` : '';

/**
 * Lazily created once and reused across requests - createRemoteJWKSet
 * internally caches the fetched public keys, so we don't want to
 * re-create this on every request.
 */
const jwks = createRemoteJWKSet(new URL(jwksUri));

@Injectable()
export class ZitadelAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequestType>();

    const authHeader = request.headers.authorization;

    const isMissingAuthHeader = authHeader === undefined;

    if (isMissingAuthHeader) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const isBearerToken = authHeader.startsWith('Bearer ');

    if (!isBearerToken) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const accessToken = authHeader.replace('Bearer ', '');

    try {
      const { payload } = await jwtVerify(accessToken, jwks, {
        issuer: zitadelIssuer,
        audience: zitadelAudience,
      });

      const userId = payload.sub;

      const isMissingSubject = userId === undefined;

      if (isMissingSubject) {
        throw new UnauthorizedException('Token missing subject claim');
      }

      /**
       * Zitadel includes org info under a namespaced claim following the
       * urn:zitadel:iam:org:id pattern when organization context is set.
       */
      const rawOrgId = payload['urn:zitadel:iam:org:id'];

      const isOrgIdString = typeof rawOrgId === 'string';

      const orgId = isOrgIdString ? rawOrgId : null;

      request.auth = {
        userId,
        orgId,
        rawClaims: payload,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
