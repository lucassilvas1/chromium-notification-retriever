export class CustomError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DbNotFoundError extends CustomError {
  constructor(path: string) {
    super(`Could not find a LevelDB database at "${path}"`);
  }
}
