import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';

const ajv = new Ajv({ allErrors: true });

ajvFormats(ajv);
ajvKeywords(ajv);

interface LoginSchema {
    email: string;
    password: string;
}

export default class UserSchema implements LoginSchema {
  email: string;

  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  async validateLogin() {
    const schema = ajv.compile({
      $async: true,
      type: 'object',
      allRequired: true,
      additionalProperties: false,
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
      },
    });
    return schema(this);
  }
}
