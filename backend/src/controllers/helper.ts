import { Response } from 'express';
import { User } from '@shared/types'; // Импортируем пул соединений
import { Passport as IPassport } from '@shared/types';
import { ApiResponse } from '../types/api.js'; // Импортируем пул соединений

export interface RequestWithPassport extends Request {
  params: Record<string, string>;
  passport: IPassport;
  query: Record<string, string>;
  users: User[];
}



export type TypedResponse<T> = Response<ApiResponse<T>>;

export type ControllerWithAuth<T> = (req: RequestWithPassport, res: TypedResponse<T>) => Promise<void>;

export const ok = <T>(res: Response, data: T) => {
  return res.json(data);
};

export const fail = (res: Response, message: string, status = 500) => {
  return res.status(status).json({
    error: true,
    message,
  });
};