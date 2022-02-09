import { Router } from 'express';

import TransactionController from '../controllers/Transaction';

const { initiatePayment, verifyTransaction, dispatchResponse } = new TransactionController();

const router = Router();
const webhookRouter = Router();

router.post('/', initiatePayment, dispatchResponse);
webhookRouter.get('/', verifyTransaction, dispatchResponse);

export default { router, webhookRouter };
