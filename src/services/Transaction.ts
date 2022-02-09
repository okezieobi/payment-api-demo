/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { v4 as uuid } from 'uuid';

import TransactionModel from '../models/Transaction';
import TransactionSchema from '../schemas/Transaction';
import PaymentAPI from '../apis/Payment';

interface TransactionInterface {
    model: { Transaction: typeof TransactionModel };
    schema: { Transaction: typeof TransactionSchema };
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

  schema: { Transaction: typeof TransactionSchema };

  api: { Payment: typeof PaymentAPI };

  constructor(
    model = { Transaction: TransactionModel },
    schema = { Transaction: TransactionSchema },
    api = { Payment: PaymentAPI },
  ) {
    this.model = model;
    this.api = api;
    this.schema = schema;
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
    const paymentArg = new this.schema.Transaction(amount, tx_ref, customer);
    await paymentArg.validateCreateTransaction();
    const paymentResponse = await dispatchPayment(paymentArg);
    await this.model.Transaction.create({ tx_ref, user });
    return paymentResponse;
  }
}
