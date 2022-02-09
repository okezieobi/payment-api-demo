import UserModel, { UserInterface, LoginSchema } from '../models/User';

interface UserServicesInterface {
    model?: { User: typeof UserModel };
}

export default class UserServices implements UserServicesInterface {
  model: { User: typeof UserModel };

  constructor(model = { User: UserModel }) {
    this.model = model;
    this.signupUser = this.signupUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.authUser = this.authUser.bind(this);
  }

  async signupUser(arg: UserInterface) {
    const newUser = await this.model.User.create(arg);
    const data = newUser.toObject();
    delete data.password;
    return { message: 'New user successfully signed up', data };
  }

  async loginUser({ user, password }: LoginSchema) {
    const userExists = await this.model.User.findOne().byUnique(user, password);
    await userExists.validatePassword(password);
    const data = userExists.toObject();
    delete data.password;
    return { message: 'Registered user successfully signed in', data };
  }

  async authUser(arg: string) {
    return this.model.User.findOne({}, '-password').byAuth(arg);
  }
}
