import type { NextFunction, Request, Response } from 'express';
import type { UserDto, Passport } from 'entities';

// Расширяем интерфейс запроса, добавляя TQuery и передавая параметры в базовый Request
export interface RequestWithPassport<TBody = any, TQuery = any> extends Request<Record<string, string>, any, TBody, TQuery> {
  params: Record<string, string>;
  passport: Passport;
  users: UserDto[];
  body: TBody;
  query: TQuery; // 👈 типизируем query параметры
}

export type ApiSuccess<T> = {
  data: T;
  error: false;
};

export type ApiError = {
  error: true;
  message: string;
};

export type ApiResponse<T> = T | ApiError;

export type TypedResponse<T> = Response<ApiResponse<T>>;

// Обычный контроллер (без авторизации) с поддержкой TQuery
export type Controller<TResponse, TQuery = any, TBody = any> = (
  req: Request<Record<string, string>, ApiResponse<TResponse>, TBody, TQuery>,
  res: Response<ApiResponse<TResponse>>,
  next: NextFunction,
) => Promise<void>;

// Контроллер с авторизацией с поддержкой TQuery
export type ControllerWithAuth<TResponse, TQuery = any, TBody = any> = (
  req: RequestWithPassport<TBody, TQuery>,
  res: TypedResponse<TResponse>,
) => Promise<void>;

export const ok = <T>(res: Response, data?: T) => {
  return res.json(data);
};

export const fail = (res: Response, message: string, status = 500): never => {
  res.status(status).json({
    error: true,
    message,
  });
  throw new Error(message);
};
