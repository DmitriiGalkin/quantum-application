// Получаем абсолютный путь к директории с этим файлом
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const apps = [
  {
    name: 'backend',
    script: 'sh',
    args: '-lc "cd ./backend && npm run build && node dist/index.ts"',
    env: {
      NODE_ENV: 'node',
    },
    cwd: '/workspace',
    out_file: '/dev/stdout',
    error_file: '/dev/stderr',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    interpreter: 'node',
  },
  {
    name: 'application',
    script: 'application/server.ts',
    out_file: '/dev/stdout',
    error_file: '/dev/stderr',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    interpreter: 'node',
  },
];

