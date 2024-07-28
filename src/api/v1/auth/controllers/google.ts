import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

import User from '../../../../models/user';

// Configure Google Oauth Strategy
dotenv.config();
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
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.emails![0].value }],
        });
        // If user does not exist, create one here
        if (!user) {
          user = new User({
            googleId: profile.id,
            username: profile.displayName.toLowerCase(),
            email: profile.emails![0].value,
            profilePicture: profile.photos![0].value,
          });

          // Write changes to db
          await user.save();
        }

        // If user is incomplete, complete the values
        if (!user.googleId || !user.profilePicture) {
          if (!user.googleId) user.googleId = profile.id;
          if (!user.profilePicture)
            user.profilePicture = profile.photos![0].value;

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

// @desc    Google OAuth Callback
// @route   GET /auth/google/callback
// @access  Public
const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('google', (err: any, user: any) => {
    if (err) {
      return next(err);
    }

    // Handle user not found case
    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        data: {
          name: 'Authentication failed',
        },
      });
    }

    const token = user.getSignedJwtToken();

    res.redirect(
      `${process.env.CLIENT_URL}?token=${token}&email=${user.email}&username=${user.username}`
    );
  })(req, res, next);
};

export default googleCallback;
