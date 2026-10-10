import formidable, { type Files } from 'formidable';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'path';
import mime from 'mime';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import s3Client from '../utils/s3.js';
import type { RequestWithPassport } from '../controllers/helper.js';

export class FileService {
  static readonly publicUrl = 'https://storage.yandexcloud.net/quantum-education/';

  static isStorageUrl(url: string): boolean {
    return url.startsWith(this.publicUrl);
  }

  static async upload(req: RequestWithPassport): Promise<string> {
    if (req.file) return this.uploadBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
    const form = new formidable.IncomingForm();
    const files = await new Promise<Files>((resolve, reject) => {
      form.parse(req, (err, _fields, files) => {
        if (err) return reject(err);
        resolve(files);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file || !file.filepath) {
      throw new Error('FILE_NOT_FOUND');
    }

    return this.uploadBuffer(await readFile(file.filepath), file.originalFilename ?? '', file.mimetype ?? undefined);
  }

  /** Shared S3 implementation for HTTP uploads and catalog originals. */
  static async uploadBuffer(buffer: Buffer, originalFilename: string, mimetype?: string, key?: string): Promise<string> {
    if (!buffer.length) throw new Error('EMPTY_FILE');
    const filename = key ?? `${randomUUID()}${path.extname(originalFilename)}`;

    const params = {
      Bucket: 'quantum-education',
      Key: filename,
      Body: buffer,
      ContentType: mime.getType(originalFilename) || mimetype || 'application/octet-stream',
      CacheControl: 'max-age=' + 3600 * 24 * 365,
    };

    await s3Client.send(new PutObjectCommand(params));

    return this.publicUrl + filename;
  }
}
