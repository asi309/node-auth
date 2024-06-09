import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import hpp from 'hpp';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import morgan from 'morgan';
import helmet from 'helmet';

import connectDB from './config/db';

dotenv.config();

const app = express();

if (!process.env.MONGODB_URI) {
  throw new Error('DB not defined!');
}
if (!process.env.JWT_SECRET) {
  throw new Error('Define a JWT Secret!');
}

if (!process.env.ALPHA) {
  throw new Error('Define ALPHA!');
}

connectDB();

app.use(
  cookieSession({
    name: 'session',
    keys: ['adjhfo'],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Logging for prod -> Apache style logs
  app.use(morgan('common'));
}

app.use(helmet());
app.use(hpp());

// Limit rate
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
});

app.use(limiter);

// Routes

// HealthCheck route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    statusCode: 200,
    message: 'Server is running',
  });
});

export default app;
