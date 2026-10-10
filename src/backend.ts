import 'dotenv/config';
import app from './app.js';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path, { resolve } from 'path'; // Импортируем весь модуль path и деструктурируем resolve

// 2. Конфигурация
const port = process.env.PORT || 4000;
const isDev = process.env.NODE_ENV === 'development';

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
