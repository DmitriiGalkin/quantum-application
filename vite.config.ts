import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { execFileSync } from 'node:child_process';

const commitHash = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim().slice(0, 7);

export default defineConfig({
  define: {
    'import.meta.env.VITE_COMMIT_HASH': JSON.stringify(commitHash),
  },
  plugins: [
    react(),
    tsconfigPaths({
      projects: ['tsconfig.application.json'],
    }),
  ],
  server: {
    host: true,
    allowedHosts: ['q3-dev.ru'],
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled', '@mui/material'],
  },
  build: { manifest: true },
});
