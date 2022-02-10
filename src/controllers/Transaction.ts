import { Request, Response, NextFunction } from 'express';

import Controller from '.';
import TransactionService from '../services/Transaction';

interface TransactionControllerInterface {
    Service?: typeof TransactionService;
    key: string;
}

export default class TransactionController extends
  Controller implements TransactionControllerInterface {
  Service: typeof TransactionService;

  constructor(Service = TransactionService, key = 'transaction') {
    super(key);
    this.Service = Service;
    this.initiatePayment = this.initiatePayment.bind(this);
    this.verifyTransaction = this.verifyTransaction.bind(this);
    this.listTransactions = this.listTransactions.bind(this);
  }

  initiatePayment({ body }: Request, res: Response, next: NextFunction) {
    const { initiatePayment } = new this.Service();
    return this.handleService({
      method: initiatePayment, res, next, status: 201, arg: { ...body, user: res.locals.user },
    });
  }

  verifyTransaction({ query }: Request, res: Response, next: NextFunction) {
    const { verifyTransaction } = new this.Service();
    return this.handleService({
      method: verifyTransaction, res, next, arg: query,
    });
  }

  listTransactions({ query }: Request, res: Response, next: NextFunction) {
    const { listTransactions } = new this.Service();
    return this.handleService({
      method: listTransactions, res, next, arg: { ...query, user: res.locals.user },
    });
  }
}
