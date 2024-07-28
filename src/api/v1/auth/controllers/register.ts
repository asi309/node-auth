import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import User from '../../../../models/user';
import sendEmail from '../../../../lib/sendEmail';
import verificationHtml from '../../../../../html/confirmationEmail';

// Configure Google Oauth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.API_URL}/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        // If user does not exist, create one here
        if (!user) {
          user = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails![0].value,
          });

          // Write changes to db
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user);
});

passport.deserializeUser((user, done) => {
  if (user) {
    return done(null, user);
  }
  return done({ error: 'Did not find User' }, false);
});

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
