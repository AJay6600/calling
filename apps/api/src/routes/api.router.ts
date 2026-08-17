import { Router } from 'express';
import {
  zitadelAuthMiddleware,
  type AuthenticatedRequestType,
} from '../middleware/zitadel-auth.middleware';
import {
  ensureOrganizationMiddleware,
  type OrgScopedRequestType,
} from '../middleware/ensure-organization.middleware';
import { callsRouter } from './calls.router';
import { authRouter } from './auth.router';
import { actionsRouter } from './actions.router';
import { webhooksRouter } from './webhooks.router';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'Hello API' });
});

apiRouter.get(
  '/me',
  zitadelAuthMiddleware,
  ensureOrganizationMiddleware,
  (req: OrgScopedRequestType, res) => {
    res.json({
      userId: req.auth?.userId,
      orgId: req.auth?.orgId,
      orgName: req.auth?.orgName,
      organization: req.organization,
    });
  },
);

apiRouter.use('/calls', zitadelAuthMiddleware, ensureOrganizationMiddleware, callsRouter);

apiRouter.use('/auth', zitadelAuthMiddleware, ensureOrganizationMiddleware, authRouter);

apiRouter.use('/actions', actionsRouter);

apiRouter.use('/webhooks', webhooksRouter);