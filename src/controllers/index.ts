import { Request, Response, NextFunction } from 'express';

interface handleServiceInterface {
    method: Function;
    res: Response;
    next: NextFunction;
    status?: number;
    arg: unknown;

}

interface ServiceResult {
    message: string;
    data: unknown;
}

export default abstract class Controller {
  key: string;

  constructor(key: string) {
    this.dispatchResponse = this.dispatchResponse.bind(this);
    this.handleService = this.handleService.bind(this);
    this.key = key;
  }

  handleService({
    method, res, next, status = 200, arg,
  }: handleServiceInterface) {
    method(arg).then((data: ServiceResult) => {
      if (data != null) {
        res.locals[this.key] = data;
        res.status(status);
        next();
      } else next('Service error');
    })
      .catch(next);
  }

  dispatchResponse(req: Request, res: Response) {
    res.send({ status: 'success', ...res.locals[this.key] });
  }
}
