import { Response } from 'express';
import type { UserDto, PassportDto } from '@shared/types'; // Импортируем пул соединений
import { ApiResponse } from '../types/api.js'; // Импортируем пул соединений

export interface RequestWithPassport extends Request {
  params: Record<string, string>;
  passport: PassportDto;
  query: Record<string, string>;
  users: UserDto[];
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