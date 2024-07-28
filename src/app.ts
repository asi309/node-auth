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

import connectDB from './lib/db';
import apiRouter from './api/router';
import errorResponse from './middlewares/errorResponse';

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

if (!process.env.APP_NAME) {
  console.error('Define ALPHA!');
  process.env.APP_NAME = 'Test App';
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Define Google Credentials!');
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

// Enable cors
app.use(cors());

// Routes
app.use('/api', apiRouter);

// HealthCheck route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    statusCode: 200,
    message: 'Server is running',
  });
});

// Catch all routes -> 404
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    statusCode: 404,
    message: 'Resource does not exist on server',
  });
});

app.use(errorResponse);

export default app;
