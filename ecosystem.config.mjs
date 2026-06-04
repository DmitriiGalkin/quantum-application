// Получаем абсолютный путь к директории с этим файлом
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const apps = [
  {
    name: 'backend',
    script: path.join(__dirname, 'backend/dist/index.js'),
    env: {
      NODE_ENV: 'node',
    },
    out_file: '/dev/stdout',
    error_file: '/dev/stderr',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    interpreter: 'node',
  },
  {
    name: 'application',
    script: path.join(__dirname, 'application/server.ts'),
    out_file: '/dev/stdout',
    error_file: '/dev/stderr',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    interpreter: 'node',
  },
];

