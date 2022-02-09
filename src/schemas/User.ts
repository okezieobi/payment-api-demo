import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';

const ajv = new Ajv({ allErrors: true });

ajvFormats(ajv);
ajvKeywords(ajv);

interface LoginSchema {
    user: string;
    password: string;
}

export default class UserSchema implements LoginSchema {
  user: string;

  password: string;

  constructor(user: string, password: string) {
    this.user = user;
    this.password = password;
  }

  async validateLogin() {
    const schema = ajv.compile({
      $async: true,
      type: 'object',
      allRequired: true,
      additionalProperties: false,
      properties: {
        user: { type: 'string' },
        password: { type: 'string' },
      },
    });
    return schema(this);
  }
}
