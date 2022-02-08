import UserModel from '../models/User';
import UserSchema from '../schemas/User';

interface UserInterface {
    model?: object;
    schema?: object;
}

interface SignupArg {
    email: string;
    name: string;
    password: string;
}

export default class UserServices implements UserInterface {
  model: { User: typeof UserModel };

  schema: { User: typeof UserSchema };

  constructor(model = { User: UserModel }, schema = { User: UserSchema }) {
    this.model = model;
    this.schema = schema;
    this.signupUser = this.signupUser.bind(this);
  }

  async signupUser(arg: SignupArg) {
    const newUser = await this.model.User.create(arg);
    const data = newUser.toObject();
    delete data.password;
    return { message: 'New user successfully signed up', data };
  }
}
