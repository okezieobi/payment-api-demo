import UserModel from '../models/User';
import UserSchema from '../schemas/User';

interface UserServicesInterface {
    model?: { User: typeof UserModel };
    schema?: { User: typeof UserSchema };
}

interface PasswordArg {
  password: string;
}

interface LoginArg extends PasswordArg {
    user: string;
}

interface SignupArg extends PasswordArg {
  name: string;
  phone: string;
  email: string;
}

export default class UserServices implements UserServicesInterface {
  model: { User: typeof UserModel };

  schema: { User: typeof UserSchema };

  constructor(model = { User: UserModel }, schema = { User: UserSchema }) {
    this.model = model;
    this.schema = schema;
    this.signupUser = this.signupUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.authUser = this.authUser.bind(this);
  }

  async signupUser(arg: SignupArg) {
    const newUser = await this.model.User.create(arg);
    const data = newUser.toObject();
    delete data.password;
    return { message: 'New user successfully signed up', data };
  }

  async loginUser({ user, password }: LoginArg) {
    const input = new this.schema.User(user, password);
    await input.validateLogin();
    const userExists = await this.model.User.findOne().byUnique(input.user);
    await userExists.validatePassword(input.password);
    const data = userExists.toObject();
    delete data.password;
    return { message: 'Registered user successfully signed in', data };
  }

  async authUser(arg: string) {
    return this.model.User.findOne({}, '-password').byAuth(arg);
  }
}
