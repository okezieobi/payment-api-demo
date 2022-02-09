/* eslint-disable no-unused-vars */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
import {
  Schema, model, Document, Query, Model,
} from 'mongoose';
import validator from 'validator';
import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';

import bcrypt from '../utils/bcrypt';
import AppError from '../errors';

const ajv = new Ajv({ allErrors: true });

ajvKeywords(ajv);

export interface LoginSchema {
    user: string;
    password: string;
}

const validateLogin = async (data: LoginSchema) => {
  const schema = ajv.compile({
    $async: true,
    type: 'object',
    allRequired: true,
    additionalProperties: false,
    properties: {
      user: { type: 'string' },
      password: { type: 'string' },
    },
  });
  return schema(data);
};

export interface UserInterface {
    phone_number: string;
    name: string;
    email: string;
  password?: string;
}

interface UserQueryHelpers {
  byUnique(user: string, password: string): Query<any, Document<UserInterface>> & UserQueryHelpers;
  byAuth(id: string): Query<any, Document<UserInterface>> & UserQueryHelpers;
}

const schema = new Schema<UserInterface>({
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
      message: ({ value }) => `${value} is not a valid email`,
    },
  },
  phone_number: {
    type: String,
    unique: true,
    required: [true, 'Phone number is required'],
    validate: {
      validator: (value: string) => validator.isMobilePhone(`${value}`),
      message: ({ value }) => `${value} is not a valid phone number`,
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

schema.query.byUnique = async function QueryByUnique(user: string, password: string):
  Promise<Query<any, Document<UserInterface>> & UserQueryHelpers> {
  await validateLogin({ user, password });
  const doc = await this.where({ $or: [{ email: { $regex: user, $options: 'i' } }, { phone_number: { $regex: user, $options: 'i' } }] }, '').exec();
  if (doc == null) {
    throw new AppError(`Registered user with '${user}' does not exist, please sign up`, 'Query', { param: 'email', value: user, msg: 'User email not found, email verification failed' });
  }
  return doc;
};
schema.query.byAuth = async function QueryByAuth(id: string):
Promise<Query<any, Document<UserInterface>> & UserQueryHelpers> {
  const isMongoId = validator.isMongoId(`${id}`);
  if (!isMongoId) {
    throw new AppError('Verified user id from jwt does not match MongoDB Id format', 'Authorization', { param: 'user._id', msg: 'User id validation failed' });
  }
  const doc = await this.where({ _id: id }).exec();
  if (doc == null) {
    throw new AppError('Verified user id from jwt not found, please sign up by creating an account', 'Authorization', { param: 'user._id', msg: 'User id not found, user authorization failed' });
  }
  return doc;
};

schema.methods.validatePassword = async function validatePassword(password:string, param: string = 'password') {
  const isPassword = await bcrypt.compareString(password, this.password);
  if (!isPassword) {
    throw new AppError('Password provided does not match user', 'Authorization', { param, msg: 'Authentication failed, mismatched password' });
  }
};

const UserModel = model<UserInterface, Model<UserInterface, UserQueryHelpers>>('User', schema);

UserModel.syncIndexes().catch(console.error);

export default UserModel;
