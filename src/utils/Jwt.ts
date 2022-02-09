import jwt from 'jsonwebtoken';

import Env from './Env';

interface JwtInterface {
    jwt?: typeof jwt;
}

export default class Jwt implements JwtInterface {
  jwt: typeof jwt;

  constructor(jsonwebtoken = jwt) {
    this.jwt = jsonwebtoken;
  }

  async generate(id: string) {
    const { jwtSecret } = new Env();
    return this.jwt.sign({
      id,
    }, jwtSecret ?? '', {
      expiresIn: '3d',
    });
  }

  async verify(token: string | undefined) {
    const { jwtSecret } = new Env();
    return this.jwt.verify(token ?? '', jwtSecret ?? '');
  }
}
