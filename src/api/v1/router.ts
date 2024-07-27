import { Router, Request, Response } from 'express';

import authRouter from './auth/router';

const router = Router();

// Routes
router.use('/auth', authRouter);

// HealthCheck Routes
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    statusCode: 200,
    message: 'APIv1 router is running',
  });
});

export default router;
