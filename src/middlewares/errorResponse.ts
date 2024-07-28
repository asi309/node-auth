import { Request, Response } from 'express';

interface CustomError extends Error {
  name: string;
  errors?: Record<string, { message: string }>;
  path?: string;
  value?: string;
}

const errorResponse = (error: CustomError, req: Request, res: Response) => {
  if (error.name === 'Validation Error') {
    // Mongoose validation error: Required field missing
    const requiredFieldError = {};
    for (const field of Object.keys(error.errors!)) {
      // @ts-ignore
      requiredFieldError[field] = error.errors![field].message;
    }
    return res.status(400).json({
      statusCode: 400,
      name: 'Validation Failed',
      data: requiredFieldError,
    });
  } else if (error.name === 'CastError') {
    // Mongoose cast error (e.g., invalid ObjectId)
    return res
      .status(400)
      .json({ statusCode: 400, name: `Invalid ${error.path}: ${error.value}` });
  }
  console.error(error);
  return res.status(500).json({
    statusCode: 500,
    name: 'Internal Server Error',
  });
};

export default errorResponse;
