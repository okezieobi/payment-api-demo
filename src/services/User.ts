import UserModel from '../models/User';
import UserSchema from '../schemas/User';

interface UserInterface {
    model?: object;
    schema?: object;
}

interface LoginArg {
    email: string
    password: string;
}

interface SignupArg extends LoginArg {
    name: string;
}

export default class UserServices implements UserInterface {
  model: { User: typeof UserModel };

  schema: { User: typeof UserSchema };

  constructor(model = { User: UserModel }, schema = { User: UserSchema }) {
    this.model = model;
    this.schema = schema;
    this.signupUser = this.signupUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
  }

  async signupUser(arg: SignupArg) {
    const newUser = await this.model.User.create(arg);
    const data = newUser.toObject();
    delete data.password;
    return { message: 'New user successfully signed up', data };
  }

  async loginUser({ email, password }: LoginArg) {
    const user = new this.schema.User(email, password);
    await user.validateLogin();
    const userExists = await this.model.User.findOne().byEmail(user.email);
    await userExists.validatePassword(user.password);
    const data = userExists.toObject();
    delete data.password;
    return { message: 'Registered user successfully signed in', data };
  }
}
