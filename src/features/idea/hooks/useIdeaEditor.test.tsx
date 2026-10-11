// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import { useIdeaEditor } from './useIdeaEditor.ts';

vi.mock('../../../requests.ts', () => ({ uploadIdeaPhoto: vi.fn(), fetchCreateIdea: vi.fn(), fetchUpdateIdea: vi.fn() }));
import { uploadIdeaPhoto, fetchCreateIdea } from '../../../requests.ts';

it('keeps successful uploads when a later file fails and retries only the failed file before saving', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const saved = vi.fn();
  const files = [new File(['one'], 'one.jpg', { type: 'image/jpeg' }), new File(['two'], 'two.png', { type: 'image/png' })];
  vi.mocked(uploadIdeaPhoto).mockResolvedValueOnce({ url: 'https://example.com/one.jpg' })
    .mockRejectedValueOnce(new Error('S3 unavailable')).mockResolvedValueOnce({ url: 'https://example.com/two.png' });
  vi.mocked(fetchCreateIdea).mockResolvedValue(100);
  function Editor() {
    const editor = useIdeaEditor({ title: 'Robot', description: '', photos: files.map((file, i) => ({ file,
      photo: { id: `local-${i}`, fileName: file.name, url: '', isCover: i === 0 } })) }, saved);
    return <><button disabled={editor.loading} onClick={editor.onSubmit}>Save</button><span>{editor.error}</span></>;
  }
  const host = globalThis.document.createElement('div');
  const root = createRoot(host);
  const client = new QueryClient();
  const flush = async () => act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
  try {
    await act(async () => root.render(<QueryClientProvider client={client}><Editor /></QueryClientProvider>));
    await act(async () => host.querySelector('button')!.click()); await flush();
    expect(fetchCreateIdea).not.toHaveBeenCalled();
    expect(host.textContent).toContain('two.png: S3 unavailable');
    await act(async () => host.querySelector('button')!.click()); await flush();
    expect(uploadIdeaPhoto).toHaveBeenCalledTimes(3);
    expect(vi.mocked(uploadIdeaPhoto).mock.calls.map(call => call[0].name)).toEqual(['one.jpg', 'two.png', 'two.png']);
    expect(fetchCreateIdea).toHaveBeenCalledWith({ title: 'Robot', description: '', photos: [
      { id: 'local-0', fileName: 'one.jpg', url: 'https://example.com/one.jpg', isCover: true },
      { id: 'local-1', fileName: 'two.png', url: 'https://example.com/two.png', isCover: false },
    ] });
    expect(saved).toHaveBeenCalledWith(100);
  } finally { await act(async () => root.unmount()); client.clear(); }
});
