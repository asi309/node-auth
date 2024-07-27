import { Request, Response, Router } from 'express';

import v1Router from './v1/router';

const router = Router();

// Routes
router.use('/v1', v1Router);

// HealthCheck Routes
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    statusCode: 200,
    message: 'API router is running',
  });
});

export default router;
