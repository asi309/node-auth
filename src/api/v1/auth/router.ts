import { Router, Request, Response } from 'express';
import passport from 'passport';

import register from './controllers/register';
import signin from './controllers/signin';
import verify from './controllers/verify';
import googleCallback from './controllers/google';

const router = Router();

// Routes
router.post('/register', register);
router.post('/signin', signin);
router.post('/verify', verify);
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback', googleCallback);

// HealthCheck Routes
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    statusCode: 200,
    message: 'Auth APIv1 router is running',
  });
});

export default router;
