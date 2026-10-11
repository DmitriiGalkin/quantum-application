import multer from 'multer';
import type { RequestHandler } from 'express';
import { HttpError } from '../utils/http-error.js';
import { IDEA_PHOTO_TYPES, MAX_IDEA_PHOTO_BYTES } from '../shared/lib/idea-photos.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_IDEA_PHOTO_BYTES, files: 1 },
  fileFilter: (_req, file, done) => {
    if (!IDEA_PHOTO_TYPES.includes(file.mimetype)) return done(new HttpError('Выберите JPEG, PNG или WebP', 400));
    done(null, true);
  },
}).single('image');

export const imageUpload: RequestHandler = (req, res, next) => {
  if (!req.passport) return next(new HttpError('Необходима авторизация', 401));
  upload(req, res, error => {
    if (error instanceof multer.MulterError) return next(new HttpError(
      error.code === 'LIMIT_FILE_SIZE' ? 'Размер фотографии не должен превышать 10 МиБ' : 'Ожидается один файл image', 400));
    next(error);
  });
};
