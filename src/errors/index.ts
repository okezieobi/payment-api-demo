export default class AppError extends Error {
  data: { timestamp: Date; name: string; };

  constructor(message: string = 'Unspecified error', name: string = 'App', data: object = {}) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AppError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
    // Custom debugging information
    this.data = {
      name: `${name}Error`,
      ...data,
      timestamp: new Date(),
    };
    // Maintains proper stack trace for where our error was thrown (only available on V8)
  }
}
