import { Router } from 'express';
import {
  zitadelAuthMiddleware,
  type AuthenticatedRequestType,
} from '../middleware/zitadel-auth.middleware';
import {
  makeCall,
  BolnaConfigError,
  BolnaRequestError,
} from '../services/bolna.client';

export const callsRouter = Router();

// E.164: + followed by 8-15 digits
const e164Pattern = /^\+[1-9]\d{7,14}$/;

callsRouter.post(
  '/',
  zitadelAuthMiddleware,
  async (req: AuthenticatedRequestType, res) => {
    const recipientPhoneNumber: unknown = req.body?.recipientPhoneNumber;

    if (
      typeof recipientPhoneNumber !== 'string' ||
      !e164Pattern.test(recipientPhoneNumber)
    ) {
      res.status(400).json({
        message:
          'recipientPhoneNumber is required and must be in E.164 format, e.g. +919876543210',
      });
      return;
    }

    try {
      const result = await makeCall({ recipientPhoneNumber });

      console.log(
        `[calls] user=${req.auth?.userId} org=${req.auth?.orgId} triggered call, executionId=${result.executionId}`,
      );

      res.status(202).json(result);
    } catch (error) {
      if (error instanceof BolnaConfigError) {
        console.error('[calls] Bolna misconfigured:', error.message);
        res.status(500).json({ message: 'Calling service is misconfigured' });
        return;
      }

      if (error instanceof BolnaRequestError) {
        console.error('[calls] Bolna rejected request:', error.body);
        res
          .status(502)
          .json({ message: 'Failed to trigger call via provider' });
        return;
      }

      console.error('[calls] Unexpected error:', error);
      res.status(500).json({ message: 'Unexpected error triggering call' });
    }
  },
);
