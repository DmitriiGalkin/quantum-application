import { NextFunction, Request, Response } from 'express';
import type { UserDto } from '@shared/types'; // Импортируем пул соединений
import { ApiResponse } from '../types/api.js';
import { Passport } from '../entities/passport.js'; // Импортируем пул соединений

export interface RequestWithPassport extends Request {
  params: Record<string, string>;
  passport: Passport;
  query: Record<string, string>;
  users: UserDto[];
}


export type TypedResponse<T> = Response<ApiResponse<T>>;

export type Controller<T> = (req: Request, res: Response<ApiResponse<T>>, next: NextFunction) => Promise<void>;
export type ControllerWithAuth<T> = (req: RequestWithPassport, res: TypedResponse<T>) => Promise<void>;

export const ok = <T>(res: Response, data: T) => {
  return res.json(data);
};

export const fail = (res: Response, message: string, status = 500): never => {
  res.status(status).json({
    error: true,
    message,
  });
  throw new Error(message);
};