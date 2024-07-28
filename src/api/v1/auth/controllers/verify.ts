import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

import User from '../../../../models/user';
import sendEmail from '../../../../lib/sendEmail';
import verificationHtml from '../../../../../html/confirmationEmail';

// @desc  Verify User
// @route POST /api/v1/auth/verify
// @access  Public
const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.loginVerificationCode) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        data: {
          name: 'Please provide verification token',
        },
      });
    }
    // Get the hashed code
    const loginVerificationCode = crypto
      .createHash('sha256')
      .update(req.body.loginVerificationCode)
      .digest('hex');

    const user = await User.findOne({
      loginVerificationCode,
      loginVerificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        data: {
          name: 'Invalid verification token',
        },
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      data: {
        username: user.username,
        email: user.email,
        token: user.getSignedJwtToken!(),
      },
    });

    // Update the user after verify complete
    user.loginVerificationCode = undefined;
    user.loginVerificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    next(error);
  }
};

export default verify;
