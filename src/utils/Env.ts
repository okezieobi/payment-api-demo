import { config } from 'dotenv';

config();

export default class EnvConfig {
  databaseURL: string | undefined;

  flutterwave: { secret: string | undefined; };

  jwtSecret: string | undefined;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.databaseURL = process.env.NODE_ENV === 'testing' ?? process.env.NODE_ENV === 'testing-in-ci' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL ?? process.env.DEV_DATABASE_URL;
    this.flutterwave = {
      secret: process.env.FLUTTERWAVE_SECRET_KEY_TESTING,
    };
  }
}
