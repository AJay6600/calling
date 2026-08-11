import { Router } from 'express';
import {
  zitadelAuthMiddleware,
  type AuthenticatedRequestType,
} from '../middleware/zitadel-auth.middleware';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'Hello API' });
});

apiRouter.get(
  '/me',
  zitadelAuthMiddleware,
  (req: AuthenticatedRequestType, res) => {
    res.json({
      userId: req.auth?.userId,
      orgId: req.auth?.orgId,
    });
  },
);
