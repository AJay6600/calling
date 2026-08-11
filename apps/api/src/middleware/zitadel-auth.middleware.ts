import type { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export type AuthenticatedRequestType = Request & {
  auth?: {
    userId: string;
    orgId: string | null;
    rawClaims: Record<string, unknown>;
  };
};

const rawZitadelIssuer = process.env['ZITADEL_ISSUER'];
const zitadelAudience = process.env['ZITADEL_AUDIENCE'];

const zitadelIssuer =
  rawZitadelIssuer !== undefined ? rawZitadelIssuer.replace(/\/+$/, '') : '';

const jwksUri = zitadelIssuer !== '' ? `${zitadelIssuer}/oauth/v2/keys` : '';

const jwks = createRemoteJWKSet(new URL(jwksUri));

export const zitadelAuthMiddleware = async (
  req: AuthenticatedRequestType,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing bearer token' });
    return;
  }

  const accessToken = authHeader.replace('Bearer ', '');

  try {
    const { payload } = await jwtVerify(accessToken, jwks, {
      issuer: zitadelIssuer,
      audience: zitadelAudience,
    });

    const userId = payload.sub;

    if (!userId) {
      res.status(401).json({ message: 'Token missing subject claim' });
      return;
    }

    const rawOrgId = payload['urn:zitadel:iam:org:id'];
    const orgId = typeof rawOrgId === 'string' ? rawOrgId : null;

    req.auth = {
      userId,
      orgId,
      rawClaims: payload,
    };

    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired access token' });
  }
};
