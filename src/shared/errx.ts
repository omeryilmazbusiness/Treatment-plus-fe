export const ErrorCode = {
  NotFound: "not_found",
  Conflict: "conflict",
  Forbidden: "forbidden",
  Unauthenticated: "unauthenticated",
  Invalid: "invalid",
  NotImplemented: "not_implemented",
  Unavailable: "unavailable",
  Internal: "internal",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, message: string, status = statusFor(code), options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }

  static notImplemented(what: string): AppError {
    return new AppError(ErrorCode.NotImplemented, `${what} is not implemented`, 501);
  }
}

function statusFor(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.NotFound:
      return 404;
    case ErrorCode.Unauthenticated:
      return 401;
    case ErrorCode.Forbidden:
      return 403;
    case ErrorCode.Conflict:
      return 409;
    case ErrorCode.Invalid:
      return 422;
    case ErrorCode.NotImplemented:
      return 501;
    case ErrorCode.Unavailable:
      return 503;
    default:
      return 500;
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
