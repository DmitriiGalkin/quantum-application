import dotenv from 'dotenv';
import https from 'node:https';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import compression from 'compression';

dotenv.config();

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production'

async function server() {
  const app = express();
  app.use(compression());

  let vite: any;

  if (!isProd) {
    vite = await createServer({
      root: __dirname,
      server: {
        middlewareMode: true,
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);
  } else {
    app.use(
      express.static(path.resolve(__dirname, 'dist'), {
        index: false,
      }),
    );
  }

  app.use(async (req, res) => {
    const url = req.originalUrl;

    try {
      let template: string;
      let render: (url: string) => Promise<any>;

      if (!isProd) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
      } else {
        template = fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8');
        // @ts-ignore
        render = (await import('./dist/src/entry-server.js')).render;
      }

      const { html, meta } = await render(url);

      const appHtml = template
        .replace('<!--ssr-outlet-->', html)
        .replace('<!--app-title-->', escapeHtml(meta.title))
        .replace('<!--app-description-->', escapeHtml(meta.description))
        .replace('<!--app-og-title-->', escapeHtml(meta.ogTitle))
        .replace('<!--app-og-description-->', escapeHtml(meta.ogDescription))
        .replace('<!--app-og-image-->', escapeHtml(meta.ogImage))
        .replace('<!--app-og-type-->', escapeHtml(meta.ogType))
        .replace('<!--app-og-site-name-->', escapeHtml(meta.ogSiteName));
      res.status(200).set({ 'Content-Type': 'text/html' }).end(appHtml);
    } catch (e) {
      //vite.ssrFixStacktrace(e as any);
      console.error(e);
      res.status(500).end(e instanceof Error ? e.message : String(e));
    }
  });

  if (isProd) {
    const httpsServer = https.createServer(
      {
        key: fs.readFileSync(process.env.SSL_KEY_PATH || '/run/secrets/ssl/private.key'),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH || '/run/secrets/ssl/certificate.crt'),
      },
      app,
    );

    httpsServer.listen(443, () => {
      console.log('HTTPS сервер запущен на порту 443');
    });
  } else {
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
  }
}

server();

function escapeHtml(value: string) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
