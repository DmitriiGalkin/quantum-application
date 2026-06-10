import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
// @ts-ignore
import mime from 'mime';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import s3Client from '../s3.js';
import type { RequestWithPassport } from '../controllers/helper.js';

export class FileService {
  static async upload(req: RequestWithPassport): Promise<string> {
    const form = new formidable.IncomingForm();

    const { files } = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ files });
      });
    });

    const file = files.file;

    if (!file || !file.filepath) {
      throw new Error('FILE_NOT_FOUND');
    }

    const filename = `${uuidv4()}${path.extname(file.originalFilename || '')}`;

    const params = {
      Bucket: 'quantum-education',
      Key: filename,
      Body: fs.createReadStream(file.filepath),
      ContentType: mime.getType(filename) || file.mimetype,
      CacheControl: 'max-age=' + 3600 * 24 * 365,
    };

    await s3Client.send(new PutObjectCommand(params));

    return `https://storage.yandexcloud.net/quantum-education/${filename}`;
  }
}
