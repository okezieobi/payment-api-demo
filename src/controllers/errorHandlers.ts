import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import AppError from '../errors';

interface MongoUniqueError extends Error {
    code: number;
    location: string;
}

interface ResponseError extends Error {
    isClient: boolean;
    response: object;
}

const errorMarkers = {
  status: 'error',
  isClient: true,
  timestamp: new Date(),
};

const errorHandlers = {
  handleMongoUniqueIndexErrors(
    err: MongoUniqueError,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (err.code === 11000) {
      res.status(409);
      next({
        isClient: errorMarkers.isClient,
        response: {
          status: errorMarkers.status,
          message: `Duplicate key value, validation failed at ${err.location} model`,
          data: {
            ...err,
            msg: err.message,
            timestamp: errorMarkers.timestamp,
          },
        },
      });
    } else next(err);
  },
  handleJwtError(
    err: Error,
    { headers }: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
      res.status(401);
      next({
        isClient: errorMarkers.isClient,
        response: {
          status: errorMarkers.status,
          message: err.message,
          data: {
            name: err.name,
            param: 'token',
            location: 'headers',
            value: headers.token,
            msg: 'Verification of jwt failed',
            timestamp: errorMarkers.timestamp,
          },
        },
      });
    } else next(err);
  },
  handleValidationError(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err.constructor.name === 'ValidationError' || err.name === 'ValidationError' || err.name === 'CastError') {
      res.status(400);
      next({
        isClient: errorMarkers.isClient,
        response: {
          status: errorMarkers.status,
          message: err.message,
          data: { ...err, timestamp: errorMarkers.timestamp },
        },
      });
    } else next(err);
  },
  handleCustomError(err: AppError, req: Request, res: Response, next: NextFunction) {
    const error = { status: errorMarkers.status, message: err.message, data: err.data };
    switch (err.data?.name) {
      case 'ArgumentError':
        res.status(400);
        next({ isClient: errorMarkers.isClient, response: error });
        break;
      case 'PaymentError':
        res.status(400);
        next({ isClient: errorMarkers.isClient, response: error });
        break;
      case 'QueryError':
        res.status(404);
        next({ isClient: errorMarkers.isClient, response: error });
        break;
      case 'ConflictError':
        res.status(409);
        next({ isClient: errorMarkers.isClient, response: error });
        break;
      case 'AuthorizationError':
        res.status(401);
        next({ isClient: errorMarkers.isClient, response: error });
        break;
      default:
        next(err);
    }
  },
};

const dispatchClientError = ((
  err: ResponseError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.isClient) res.send(err.response);
  else next(err);
});

export default [...Object.values(errorHandlers), dispatchClientError];
