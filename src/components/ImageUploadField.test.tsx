// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';

vi.mock('../requests.ts', () => ({ uploadIdeaPhoto: vi.fn() }));
import { uploadIdeaPhoto } from '../requests.ts';
import ImageUploadField from './ImageUploadField.tsx';

afterEach(() => { vi.clearAllMocks(); });

it('validates a file, uploads it, and lets the user remove the saved image', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const host = globalThis.document.createElement('div');
  globalThis.document.body.append(host);
  const root = createRoot(host);
  const change = vi.fn();
  const busy = vi.fn();
  const render = (value: string) => <ImageUploadField value={value} onChange={change} onBusyChange={busy}
    label="Обложка" alt="Проект" />;
  try {
    await act(async () => root.render(render('')));
    const input = host.querySelector<HTMLInputElement>('input[type="file"]')!;
    const invalid = new File(['text'], 'wrong.txt', { type: 'text/plain' });
    await act(async () => {
      Object.defineProperty(input, 'files', { configurable: true, value: [invalid] });
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(host.textContent).toContain('Выберите фотографию JPEG, PNG или WebP');
    expect(uploadIdeaPhoto).not.toHaveBeenCalled();

    vi.mocked(uploadIdeaPhoto).mockResolvedValue({ url: 'https://example.com/photo.jpg' });
    const valid = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'photo.jpg', { type: 'image/jpeg' });
    await act(async () => {
      Object.defineProperty(input, 'files', { configurable: true, value: [valid] });
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(uploadIdeaPhoto).toHaveBeenCalledWith(valid);
    expect(change).toHaveBeenCalledWith('https://example.com/photo.jpg');
    expect(busy).toHaveBeenCalledWith(true);
    expect(busy).toHaveBeenCalledWith(false);

    await act(async () => root.render(render('https://example.com/photo.jpg')));
    expect(host.querySelector('img')?.getAttribute('src')).toBe('https://example.com/photo.jpg');
    const remove = [...host.querySelectorAll('button')].find(button => button.textContent === 'Удалить изображение')!;
    await act(async () => remove.click());
    expect(change).toHaveBeenCalledWith('');
  } finally { await act(async () => root.unmount()); host.remove(); }
});
