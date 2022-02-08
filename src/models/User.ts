/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
import { Schema, model, Document } from 'mongoose';
import validator from 'validator';

import bcrypt from '../utils/bcrypt';
import AppError from '../errors';

interface UserSchema {
    name: string;
    email: string;
    password?: string;
}

const schema = new Schema<UserSchema>({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    validate: {
      validator: (value: string) => validator.isEmail(`${value}`),
      message: (arg: any) => `${arg.value} is not a valid email`,
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'user',
  options: { sort: { createdAt: -1 }, limit: 10 },
});

schema.pre('save', async function encryptPassword() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hashString(this.password);
  }
});

schema.post(/save/, function handleUniqueErr(err: any, res: any, next: Function) {
  if (err.code === 11000) {
    const error = err;
    error.location = 'User';
    next(error);
  } else next();
});

schema.query.byEmail = async function byEmail(email: string): Promise<Document> {
  const doc = await this.where({ email: { $regex: email, $options: 'i' } }, '').exec();
  if (doc == null) {
    throw new AppError(`Registered user with '${email}' does not exist, please sign up`, 'Query', { param: 'email', value: email, msg: 'User email not found, email verification failed' });
  }
  return doc;
};
schema.query.byAuth = async function byAuth(id: string): Promise<Document> {
  const isMongoId = validator.isMongoId(`${id}`);
  if (!isMongoId) {
    throw new AppError('Verified user id from jwt does not match MongoDB Id format', 'Authorization', { param: 'user._id', msg: 'User id validation failed' });
  }
  const doc = await this.where({ _id: id }).populate({ path: 'store', populate: [{ path: 'address' }, { path: 'account' }] }).populate('addresses').exec();
  if (doc == null) {
    throw new AppError('Verified user id from jwt not found, please sign up by creating an account', 'Authorization', { param: 'user._id', msg: 'User id not found, user authorization failed' });
  }
  return doc;
};

const UserModel = model<UserSchema>('User', schema);

UserModel.syncIndexes().catch(console.error);

export default UserModel;
