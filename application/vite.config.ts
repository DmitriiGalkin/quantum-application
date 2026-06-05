// vite.config.ts

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs'; // Импортируем модуль файловой системы
import path from 'path'; // Импортируем модуль для работы с путями

// 1. Создаем функцию для получения опций HTTPS
// Эта функция будет определять, какие сертификаты использовать в зависимости от режима
const getHttpsOptions = (mode: string) => {
  // В продакшене обычно HTTPS настраивается на уровне прокси (например, Nginx)
  // Поэтому здесь мы возвращаем undefined, чтобы не создавать лишний сервер
  if (mode === 'production') {
    return undefined;
  }

  // В режиме разработки загружаем переменные окружения
  const env = loadEnv(mode, process.cwd());

  // Пытаемся прочитать файлы сертификатов
  // Используем try-catch, чтобы Vite не падал с фатальной ошибкой, если файлы не найдены
  try {
    return {
      key: fs.readFileSync(path.resolve(__dirname, env.SSL_KEY_PATH)),
      cert: fs.readFileSync(path.resolve(__dirname, env.SSL_CERT_PATH)),
    };
  } catch (error) {
    // Если файлы не найдены или есть ошибка чтения, можно вывести предупреждение
    console.warn('⚠️  Не удалось загрузить SSL-сертификаты. HMR будет работать по HTTP.');
    return undefined; // Или возвращаем undefined, чтобы сервер запустился без HTTPS
  }
};

// 2. Экспортируем конфигурацию, используя нашу функцию
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    allowedHosts: ['localhost', '0.0.0.0', 'q3-dev.ru'],
    // Вызываем нашу функцию и передаем результат в опцию 'https'
    https: getHttpsOptions(mode),
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled', '@mui/material'],
  },
}));
