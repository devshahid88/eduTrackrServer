// src/utils/createHttpError.ts
export function createHttpError(message: string, status: number = 400): never {
  const error = new Error(message) as any;
  error.status = status;
  throw error;
}
