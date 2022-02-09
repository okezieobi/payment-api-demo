/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { v4 as uuid } from 'uuid';

import TransactionModel from '../models/Transaction';
import PaymentAPI from '../apis/Payment';

interface TransactionInterface {
    model: { Transaction: typeof TransactionModel };
    api: { Payment: typeof PaymentAPI };
}

interface TransactionQuery {
  status: string;
  message: string;
  transaction_id?: number;
  data: object;
  tx_ref: string;
}

interface InitiatePayment {
    amount: string;
    user: any;
}

export default class TransactionService implements TransactionInterface {
  model: { Transaction: typeof TransactionModel };

  api: { Payment: typeof PaymentAPI };

  constructor(
    model = { Transaction: TransactionModel },
    api = { Payment: PaymentAPI },
  ) {
    this.model = model;
    this.api = api;
    this.verifyTransaction = this.verifyTransaction.bind(this);
    this.initiatePayment = this.initiatePayment.bind(this);
  }

  async verifyTransaction(query: TransactionQuery) {
    const { verifyTransaction } = new this.api.Payment();
    const { message, data } = await verifyTransaction(query)
      .catch(async (err) => {
        const transaction = await this.model.Transaction.findOne({ tx_ref: query.tx_ref }).exec();
        transaction!.status = 'Error';
        await transaction?.save();
        throw err;
      });
    const { tx_ref, flw_ref, id } = data;
    const transaction = await this.model.Transaction
      .findOne({ tx_ref }).exec();
    transaction!.tx_ref = tx_ref;
    transaction!.flw_ref = flw_ref;
    transaction!.tx_id = id;
    await transaction?.save();
    return { message, data };
  }

  async initiatePayment({ amount, user }: InitiatePayment) {
    const tx_ref: string = uuid();
    const { dispatchPayment } = new this.api.Payment();
    const customer = user.toObject();
    const paymentResponse = await dispatchPayment({ tx_ref, amount, customer });
    await this.model.Transaction.create({ tx_ref, user });
    return paymentResponse;
  }

  async listTransactions({ query, user }: any) {
    const transactions = await this.model.Transaction.find({ ...query, user }).lean();
    const { verifyTransaction } = new this.api.Payment();
    if (transactions.length > 0) {
      await Promise.all(transactions.map(async (transaction) => {
        const txnDoc = transaction;
        if (txnDoc.status === 'Successful') {
          txnDoc.remote_copy = await verifyTransaction({ transaction_id: txnDoc.tx_id });
        }
      }));
    }
    return { message: 'Transactions fetched', data: transactions };
  }
}
