import { Router } from 'express';

import Controller from '../controllers/User';

const { signupUser, setJWT, dispatchResponse } = new Controller();

const authRouter = Router();

authRouter.post('/signup', [signupUser, setJWT], dispatchResponse);

export default { authRouter };
