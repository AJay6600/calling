import type { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import type { AuthenticatedRequestType } from './zitadel-auth.middleware';
import type { Organization } from '../../generated/prisma';

export type OrgScopedRequestType = AuthenticatedRequestType & {
    organization?: Organization;
};

export const ensureOrganizationMiddleware = async (
    req: OrgScopedRequestType,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const orgId = req.auth?.orgId;
    const orgName = req.auth?.orgName;

    if (!orgId) {
        res.status(403).json({ message: 'Token has no organization context' });
        return;
    }

    try {
        const organization = await prisma.organization.upsert({
            where: { zitadelOrgId: orgId },
            update: {},
            create: {
                zitadelOrgId: orgId,
                name: orgName ?? orgId,
            },
        });

        req.organization = organization;
        next();
    } catch (error) {
        console.error('[org] Failed to resolve organization:', error);
        res.status(500).json({ message: 'Failed to resolve organization' });
    }
};