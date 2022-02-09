/* eslint-disable no-underscore-dangle */
import { Request, Response, NextFunction } from 'express';

import Controller from '.';
import UserServices from '../services/User';
import JWT from '../utils/Jwt';

interface UserControllerInterface {
    Service?: typeof UserServices;
    Jwt?: typeof JWT;
    key: string;
}

export default class UserController extends Controller implements UserControllerInterface {
  Service: typeof UserServices;

  Jwt: typeof JWT;

  constructor(Service = UserServices, Jwt = JWT, key = 'user') {
    super(key);
    this.Service = Service;
    this.Jwt = Jwt;
    this.setJWT = this.setJWT.bind(this);
    this.signupUser = this.signupUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.authUser = this.authUser.bind(this);
  }

  setJWT(req: Request, res: Response, next: NextFunction) {
    new this.Jwt().generate(res.locals.user.data.id || res.locals.user.data._id.toString())
      .then((token) => {
        if (token) {
          res.locals.user.data.token = token;
          next();
        }
      }).catch(next);
  }

  signupUser({ body }: Request, res: Response, next: NextFunction) {
    const { signupUser } = new this.Service();
    return this.handleService({
      method: signupUser, res, next, arg: body, status: 201,
    });
  }

  loginUser({ body }: Request, res: Response, next: NextFunction) {
    const { loginUser } = new this.Service();
    return this.handleService({
      method: loginUser, res, next, arg: body,
    });
  }

  authUser({ headers: { token } }: Request, res: Response, next: NextFunction) {
    new this.Jwt().verify(`${token}`)
      .then(({ id }: any) => {
        const { authUser } = new this.Service();
        this.handleService({
          method: authUser, res, next, arg: id,
        });
      })
      .catch(next);
  }
}
