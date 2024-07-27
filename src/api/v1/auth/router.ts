import { Router, Request, Response } from 'express';

const router = Router();

// Routes
// router.get('/auth')

// HealthCheck Routes
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    statusCode: 200,
    message: 'Auth APIv1 router is running',
  });
});

export default router;