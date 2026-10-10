import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestWithPassport } from '../controllers/helper.js';

vi.mock('../utils/s3.js', () => ({ default: { send: vi.fn() } }));
import s3Client from '../utils/s3.js';
import { FileService } from './file.service.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

beforeEach(() => { vi.clearAllMocks(); });
describe('shared S3 upload', () => {
  it('uses the same bucket, MIME type and cache policy for catalog images', async () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff]);
    vi.mocked(s3Client.send).mockResolvedValueOnce({} as never);
    const key = 'ideas/toy-001/photo.jpg';
    expect(await FileService.uploadBuffer(buffer, 'original.jpg', 'image/jpeg', key)).toBe(FileService.publicUrl + key);
    const command = vi.mocked(s3Client.send).mock.calls[0][0] as PutObjectCommand;
    expect(command.input).toMatchObject({ Bucket: 'quantum-education', Key: key, Body: buffer, ContentType: 'image/jpeg', CacheControl: 'max-age=31536000' });
  });
  it('accepts the multer buffer provided by the existing image route', async () => {
    const req = { file: { buffer: Buffer.from('data'), originalname: 'image.jpg', mimetype: 'image/jpeg' } } as unknown as RequestWithPassport;
    expect(await FileService.upload(req)).toMatch(/^https:\/\/storage.yandexcloud.net\/quantum-education\/.+\.jpg$/);
    expect(s3Client.send).toHaveBeenCalledOnce();
  });
  it('propagates upload errors and rejects an empty file', async () => {
    vi.mocked(s3Client.send).mockRejectedValueOnce(new Error('S3 unavailable') as never);
    await expect(FileService.uploadBuffer(Buffer.from('data'), 'image.jpg')).rejects.toThrow('S3 unavailable');
    await expect(FileService.uploadBuffer(Buffer.alloc(0), 'image.jpg')).rejects.toThrow('EMPTY_FILE');
  });
});
