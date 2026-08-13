import { Router } from 'express';
import type { OrgScopedRequestType } from '../middleware/ensure-organization.middleware';

export const authRouter = Router();

// Called once on login (and on silent token renewal) to set up
// whatever this identity needs to exist — org today, user next.
authRouter.post('/bootstrap', (req: OrgScopedRequestType, res) => {
    res.json({
        organization: req.organization,
        // user: req.user,  <- add once user provisioning exists
    });
});