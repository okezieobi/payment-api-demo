import { Router } from 'express';

import userRoutes from './user';
import transactRoutes from './transaction';

const router = Router();

router.use('/auth', userRoutes.authRouter);
router.use('/verified-transaction', transactRoutes.webhookRouter);
router.use(userRoutes.authUser);
router.use('/transactions', transactRoutes.router);

export default router;
