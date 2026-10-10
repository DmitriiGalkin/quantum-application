import { afterEach, describe, expect, it, vi } from 'vitest';
import { get, put, toQuery } from './api.ts';

afterEach(() => vi.unstubAllGlobals());
describe('API client', () => {
  it('works during SSR without browser storage', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 1 }), { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    expect(await get('/idea/1')).toEqual({ id: 1 });
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
  });

  it('preserves the server error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: true, message: 'Нет доступа' }), { status: 403 })));
    await expect(put('/project/1/update', {})).rejects.toThrow('Нет доступа');
  });

  it('accepts an empty successful response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    expect(await put('/meet/1', {})).toBeUndefined();
  });

  it('omits absent query values while keeping zero and false', () => {
    expect(toQuery({ latitude: 0, enabled: false, missing: undefined })).toBe('?latitude=0&enabled=false');
    expect(toQuery({})).toBe('');
  });
});
