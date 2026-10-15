import { HttpError } from '../utils/http-error.js';
import formidable, { type Files } from 'formidable';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'path';
import mime from 'mime';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import s3Client from '../utils/s3.js';
import type { RequestWithPassport } from '../controllers/helper.js';
import { photoFileError } from '../shared/lib/idea-photos.js';

export class FileService {
  static readonly publicUrl = 'https://storage.yandexcloud.net/quantum-education/';

  static isStorageUrl(url: string): boolean {
    return url.startsWith(this.publicUrl);
  }

  static async uploadImage(file?: Express.Multer.File): Promise<string> {
    if (!file) throw new HttpError('Выберите файл image', 400);
    const error = photoFileError({ size: file.buffer.length, type: file.mimetype });
    if (error) throw new HttpError(error, 400);
    const bytes = file.buffer;
    const format = bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ? 'jpeg'
      : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'png'
        : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : null;
    if (!format || file.mimetype !== `image/${format}`) throw new HttpError('Содержимое файла не соответствует формату фотографии', 400);
    return this.uploadBuffer(bytes, `image.${format === 'jpeg' ? 'jpg' : format}`, file.mimetype);
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
      throw new HttpError('FILE_NOT_FOUND', 400);
    }

    return this.uploadBuffer(await readFile(file.filepath), file.originalFilename ?? '', file.mimetype ?? undefined);
  }

  /** Shared S3 implementation for HTTP uploads and catalog originals. */
  static async uploadBuffer(buffer: Buffer, originalFilename: string, mimetype?: string, key?: string, signal?: AbortSignal): Promise<string> {
    if (!buffer.length) throw new HttpError('EMPTY_FILE', 400);
    const filename = key ?? `${randomUUID()}${path.extname(originalFilename)}`;

    const params = {
      Bucket: 'quantum-education',
      Key: filename,
      Body: buffer,
      ContentType: mime.getType(originalFilename) || mimetype || 'application/octet-stream',
      CacheControl: 'max-age=' + 3600 * 24 * 365,
    };

    await s3Client.send(new PutObjectCommand(params), { abortSignal: signal });

    return this.publicUrl + filename;
  }
}
