import { Router } from 'express';

import userRoutes from './user';

const router = Router();

router.use('/auth', userRoutes.authRouter);

export default router;
