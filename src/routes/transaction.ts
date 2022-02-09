import { Router } from 'express';

import TransactionController from '../controllers/Transaction';

const {
  initiatePayment, listTransactions,
  verifyTransaction, dispatchResponse,
} = new TransactionController();

const router = Router();
const webhookRouter = Router();

router.route('/')
  .post(initiatePayment, dispatchResponse)
  .get(listTransactions, dispatchResponse);
webhookRouter.get('/', verifyTransaction, dispatchResponse);

export default { router, webhookRouter };
