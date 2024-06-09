import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet(process.env.ALPHA!, 10);

export interface UserSchemaType {
  _id: mongoose.Types.ObjectId;
  username?: string;
  email?: string;
  profilePicture?: string;
  loginVerificationCode?: string;
  loginVerificationCodeExpires?: Date;
  googleId?: string;
  getSignedJwtToken?: () => string;
  getVerificationCode?: () => string;
}

const userSchema = new mongoose.Schema<UserSchemaType>(
  {
    username: {
      type: String,
      default() {
        // @ts-ignore
        return this.email.split('@')[0];
      },
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      match: [/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, 'Please enter a valid email'],
    },
    googleId: String,
    profilePicture: String,
    loginVerificationCode: String,
    loginVerificationCodeExpires: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate login verification code
userSchema.methods.getVerificationCode = function () {
  const verificationCode = nanoid();

  this.loginVerificationCode = crypto
    .createHash('sha256')
    .update(verificationCode)
    .digest('hex');

  this.loginVerificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return verificationCode;
};

export default mongoose.model('User', userSchema);
