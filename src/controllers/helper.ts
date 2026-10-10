import type { NextFunction, Request, Response } from 'express';
import type { ParsedQs } from 'qs';
import type { Passport } from 'entities';
import { HttpError } from '../utils/http-error.js';

export interface ApiError {
  error: true;
  message: string;
}
export type ApiResponse<T> = T | ApiError;
export type TypedResponse<T> = Response<ApiResponse<T>>;
export interface RequestWithPassport<TBody = Record<string, unknown>, TQuery = ParsedQs> extends Request<
  Record<string, string>,
  unknown,
  TBody,
  TQuery
> {
  passport: Passport;
}
export type Controller<TResponse, TBody = Record<string, unknown>, TQuery = ParsedQs> = (
  req: Request<Record<string, string>, ApiResponse<TResponse>, TBody, TQuery>,
  res: TypedResponse<TResponse>,
  next: NextFunction,
) => Promise<void>;
export type ControllerWithAuth<TResponse, TBody = Record<string, unknown>, TQuery = ParsedQs> = (
  req: RequestWithPassport<TBody, TQuery>,
  res: TypedResponse<TResponse>,
) => Promise<void>;
export const ok = <T>(res: Response, data?: T) => res.json(data);
export function fail(message: string, status = 500): never {
  throw new HttpError(message, status);
}
