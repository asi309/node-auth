import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

import User from '../../../../models/user';
import sendEmail from '../../../../lib/sendEmail';
import verificationHtml from '../../../../../html/confirmationEmail';

dotenv.config();

// @desc - Register User
// @route - POST /api/v1/auth/register
// @access - Public
const register = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email } = req.body;

  if (!email) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      data: {
        name: 'Please provide your email address',
      },
    });
  }

  const userExist = await User.findOne({ email });

  if (userExist) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      data: {
        name: 'Email already in use.',
      },
    });
  }

  const user = await User.create({
    username,
    email,
  });

  try {
    const verificationCode = user.getVerificationCode!();
    await user.save();
    sendEmail(
      email,
      `${process.env.APP_NAME} confirmation code`,
      verificationHtml(verificationCode)
    );

    return res.status(201).json({
      statusCode: 201,
      success: true,
      data: {
        name: 'Verification code sent to email',
      },
    });
  } catch (error) {
    user.loginVerificationCode = undefined;
    user.loginVerificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    next(error);
  }
};

export default register;
