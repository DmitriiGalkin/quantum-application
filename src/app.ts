import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import router from './router.js';
import { HttpError } from './utils/http-error.js';
import { handleError } from './middlewares/error.middleware.js';

const isDev = process.env.NODE_ENV === 'development';
// 3. Создание приложения Express
const app = express();

// Настройки приложения
app.disable('etag');
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));
app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat', // Лучше брать из .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: !isDev }, // В продакшене ставим secure: true для работы через HTTPS
  }),
);

// 4. Роутинг
app.use('/', router);

// 5. Обработка ошибок 404
app.use((_req, _res, next) => {
  next(new HttpError('Маршрут не найден', 404));
});
app.use(handleError);

export default app;
