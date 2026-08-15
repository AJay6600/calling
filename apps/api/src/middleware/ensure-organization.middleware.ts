import type { Response, NextFunction } from 'express';
import { queryHasuraAdmin } from '../lib/hasuraClient';
import { GET_ORGANIZATION_BY_ZITADEL_ID } from '../graphql/queries/getOrganizationByZitadelId';
import type { AuthenticatedRequestType } from './zitadel-auth.middleware';

export const ZITADEL_ORG_ID_HEADER = 'x-zitadel-org-id';

export interface Organization {
  id: string;
  zitadel_org_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export type OrgScopedRequestType = AuthenticatedRequestType & {
  organization?: Organization;
};

const resolveZitadelOrgId = (req: OrgScopedRequestType): string | null => {
  const headerValue = req.headers[ZITADEL_ORG_ID_HEADER];
  const headerOrgId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (typeof headerOrgId === 'string' && headerOrgId !== '') {
    return headerOrgId;
  }

  return req.auth?.orgId ?? null;
};

export const ensureOrganizationMiddleware = async (
  req: OrgScopedRequestType,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const zitadelOrgId = resolveZitadelOrgId(req);

  if (zitadelOrgId === null) {
    res.status(403).json({ message: 'Missing organization context' });
    return;
  }

  try {
    const getOrgData = await queryHasuraAdmin<{ organizations: Organization[] }>(
      GET_ORGANIZATION_BY_ZITADEL_ID,
      { zitadel_org_id: zitadelOrgId }
    );

    const organization = getOrgData.organizations?.[0];

    if (organization === undefined) {
      res.status(404).json({
        message:
          'Organization not found. Contact your administrator to register your organization.',
        zitadelOrgId,
      });
      return;
    }

    req.organization = organization;
    next();
  } catch (error) {
    console.error('[org] Failed to resolve organization via Hasura:', error);
    res.status(500).json({ message: 'Failed to resolve organization' });
  }
};
