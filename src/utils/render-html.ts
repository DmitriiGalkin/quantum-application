import type { ReactNode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';

// Collect complete, hydratable HTML after lazy pages finish loading.
export async function renderHtml(element: ReactNode): Promise<string> {
  let renderError: unknown;
  const { prelude } = await prerenderToNodeStream(element, {
    // The response is collected as one HTML string, so keep completed boundaries inline.
    progressiveChunkSize: Number.MAX_SAFE_INTEGER,
    onError(error: unknown) {
      renderError = error;
    },
  });
  if (renderError) throw renderError;
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    prelude.on('data', (chunk: Buffer) => chunks.push(chunk));
    prelude.on('error', reject);
    prelude.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}
