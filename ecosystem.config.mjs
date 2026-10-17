// Получаем абсолютный путь к директории с этим файлом
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'node:fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productionPath = path.join(__dirname, '.env.production');
const productionEnv = fs.existsSync(productionPath) ? dotenv.parse(fs.readFileSync(productionPath)) : {};

export const apps = [
  {
    name: 'ssr',
    cwd: __dirname,
    env: { ...productionEnv, NODE_ENV: 'production', DOTENV_CONFIG_PATH: productionPath },
    script: path.join(__dirname, 'dist/ssr.js'),
    out_file: '/dev/stdout',
    error_file: '/dev/stderr',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    interpreter: 'node',
  },
  {
    name: 'backend',
    cwd: __dirname,
    script: path.join(__dirname, 'dist/backend.js'),
    env: {
      ...productionEnv,
      NODE_ENV: 'production',
      DOTENV_CONFIG_PATH: productionPath,
    },
    out_file: '/dev/stdout',
    error_file: '/dev/stderr',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    interpreter: 'node',
  },
];

