import { AppError, ErrorCode } from "@/shared/errx";

import type { BackendErrorBody } from "./types";

const codeMap: Record<string, ErrorCode> = {
  not_found: ErrorCode.NotFound,
  conflict: ErrorCode.Conflict,
  forbidden: ErrorCode.Forbidden,
  unauthenticated: ErrorCode.Unauthenticated,
  invalid: ErrorCode.Invalid,
  not_implemented: ErrorCode.NotImplemented,
  unavailable: ErrorCode.Unavailable,
  internal: ErrorCode.Internal,
};

export function errorFromResponse(status: number, body: unknown): AppError {
  const parsed = parseErrorBody(body);
  const code = codeMap[parsed.code] ?? ErrorCode.Internal;
  return new AppError(code, parsed.message || defaultMessage(code), status);
}

export function jsonError(err: unknown): { error: { code: string; message: string } } {
  if (err instanceof AppError) {
    return { error: { code: err.code, message: err.message } };
  }
  return { error: { code: ErrorCode.Internal, message: "internal error" } };
}

export function statusOf(err: unknown): number {
  return err instanceof AppError ? err.status : 500;
}

function parseErrorBody(body: unknown): { code: string; message: string } {
  if (isBackendError(body)) {
    return body.error;
  }
  return { code: "internal", message: "internal error" };
}

function isBackendError(body: unknown): body is BackendErrorBody {
  if (!body || typeof body !== "object") return false;
  const error = (body as BackendErrorBody).error;
  return Boolean(error && typeof error.code === "string" && typeof error.message === "string");
}

function defaultMessage(code: ErrorCode): string {
  switch (code) {
    case ErrorCode.NotFound:
      return "not found";
    case ErrorCode.Unauthenticated:
      return "unauthenticated";
    case ErrorCode.Forbidden:
      return "forbidden";
    case ErrorCode.Unavailable:
      return "unavailable";
    default:
      return "internal error";
  }
}
