import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../utils/http-error.js';

export const handleError: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  let status = 500;
  let message = 'Не удалось выполнить запрос';
  if (error instanceof HttpError) {
    status = error.status;
    message = error.message;
  } else if (error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'Запись с таким идентификатором уже существует';
  } else if (error instanceof Error && 'status' in error && error.status === 400) {
    status = 400;
    message = 'Некорректный запрос';
  } else {
    console.error('Request failed', error);
  }
  res.status(status).json({ error: true, message });
};
