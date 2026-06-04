module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'sh',
      args: '-lc "cd ./backend && npm run build && node dist/index.ts"',
      cwd: '/workspace',
      out_file: '/dev/stdout',
      error_file: '/dev/stderr',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'application',
      script: 'application/server.js',
      out_file: '/dev/stdout',
      error_file: '/dev/stderr',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
