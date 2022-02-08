import { Router } from 'express';

import Controller from '../controllers/User';

const {
  signupUser, loginUser, setJWT, dispatchResponse,
} = new Controller();

const authRouter = Router();

authRouter.post('/signup', [signupUser, setJWT], dispatchResponse);
authRouter.post('/login', [loginUser, setJWT, dispatchResponse]);

export default { authRouter };
