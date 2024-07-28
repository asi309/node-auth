import { Request, Response, NextFunction } from 'express';

import User from '../../../../models/user';
import sendEmail from '../../../../lib/sendEmail';
import verificationHtml from '../../../../../html/confirmationEmail';

// @desc    Signin user
// @route   POST /api/v1/auth/signin
// @access  Public
const signin = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  // If email is not provided, can not signin
  if (!email) {
    return res.status(400).json({
      success: false,
      data: {
        name: 'Please provide your email address',
      },
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      data: {
        name: 'Invalid Credentials',
      },
    });
  }

  try {
    const verificationCode = user.getVerificationCode!();
    await user.save();

    sendEmail(
      email,
      `${process.env.APP_NAME} confirmation code`,
      verificationHtml(verificationCode)
    );

    return res.status(201).json({
      success: true,
      data: {
        name: 'Verification code sent to email',
      },
    });
  } catch (err) {
    user.loginVerificationCode = undefined;
    user.loginVerificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(err);
  }
};

export default signin;
