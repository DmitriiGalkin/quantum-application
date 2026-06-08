export type ApiSuccess<T> = {
  data: T;
  error: false;
};

export type ApiError = {
  error: true;
  message: string;
};

export type ApiResponse<T> = T | ApiError;
