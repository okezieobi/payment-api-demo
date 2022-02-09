/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import {
  Schema, model, Query, Document, Model,
} from 'mongoose';
import MongoosePaginate from 'mongoose-paginate-v2';

import AppError from '../errors';

export interface TransactionQueryInterface {
    tx_ref: string;
    flw_ref?: string;
    tx_id?: number;
    status?: string,
}

interface TransactionInterface extends TransactionQueryInterface {
  user: Schema.Types.ObjectId;
  remote_copy?: object;
}

interface TransactionQueryHelpers {
    byOwner(query: TransactionQueryInterface, user: Schema.Types.ObjectId):
        Query<any, Document<TransactionInterface>> & TransactionQueryHelpers;
}

const schema = new Schema<TransactionInterface>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  tx_ref: {
    type: String,
    unique: true,
    required: [true, 'Transaction reference is required'],
  },
  flw_ref: {
    type: String,
  },
  tx_id: {
    type: Number,
  },
  status: {
    type: String,
    default: 'Pending',
    enum: {
      values: ['Pending', 'Successful', 'Error'],
      message: '\'{VALUE}\' is not a supported transaction status value, please try again with \'Pending\' or \'Successful\' or \'Error\'',
    },
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.plugin(MongoosePaginate);

schema.query.byOwner = async function findByOwner(
  query: TransactionQueryInterface,
  user: Schema.Types.ObjectId,
): Promise<Query<any, Document<TransactionInterface>> & TransactionQueryHelpers> {
  const doc = await this.where({ ...query, user }).exec();
  if (doc == null) {
    throw new AppError(`Transaction with parameter ${Object.keys(query).join(', ')} and value ${Object.values(query).join(', ')} not found`, 'Query', { query, msg: 'Transaction not found' });
  }
};

const TransactionModel = model<TransactionInterface, Model<TransactionInterface, TransactionQueryHelpers>>('Transaction', schema);

TransactionModel.syncIndexes().catch(console.error);

export default TransactionModel;
