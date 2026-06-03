import 'dotenv/config'; // Импорт и вызов сразу
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import createError from 'http-errors';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path, { resolve } from 'path'; // Импортируем весь модуль path и деструктурируем resolve
import router from './router';

// 2. Конфигурация
const port = process.env.PORT || 4000;
const isDev = process.env.NODE_ENV === 'development';

// 3. Создание приложения Express
const app = express();

// Настройки приложения
app.disable('etag');
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
app.use((req, res, next) => {
  next(createError(404));
});

// 7. Запуск сервера (HTTP или HTTPS)
if (!isDev) {
  const sslOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH || resolve(path.dirname(''), 'private.key')),
    cert: fs.readFileSync(
      process.env.SSL_CERT_PATH || resolve(path.dirname(''), 'certificate.crt'),
    ),
  };

  https.createServer(sslOptions, app).listen(port, () => {
    console.log(`✅ HTTPS server listening on port ${port}`);
  });
} else {
  http.createServer(app).listen(port, () => {
    console.log(`✅ HTTP server listening on port ${port}`);
  });
}
