import { PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable'; // Парсер для multipart/form-data
import fs from 'fs';
import path from 'path';
// @ts-ignore
import mime from 'mime';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import s3Client from '../s3.js';
import { Response } from 'express'; // Импортируем нужные типы
import { RequestWithPassport } from '../router';

export default {
  /**
   * Загрузка файла в облачное хранилище (S3/Yandex Object Storage)
   */
  upload: async (req: RequestWithPassport, res: Response) => {
    try {
      // --- Обработка формы ---
      const form = new formidable.IncomingForm();

      // Парсим входящий запрос. Это асинхронная операция.
      // @ts-ignore
      const { files } = await new Promise((resolve, reject) => {
        // @ts-ignore
        form.parse(req, (err, fields: any, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

      // Проверяем, что файл был загружен
      const file = files.file; // Предполагается, что поле в форме называется 'file'
      if (!file || !file.path) {
        return res.status(400).json({ error: true, message: 'Файл не найден' });
      }

      console.log('Информация о файле:', file);

      // --- Подготовка к загрузке в S3 ---
      const filename = `${uuidv4()}${path.extname(file.originalFilename)}`;

      const params = {
        Bucket: 'quantum-education',
        Key: filename,
        Body: fs.createReadStream(file.path), // Читаем файл потоком
        ContentType: mime.getType(filename) || file.mimetype, // Определяем MIME-тип по расширению
        CacheControl: 'max-age=' + (3600 * 24 * 365), // Кэширование на год
      };

      // --- Загрузка в S3 ---
      await s3Client.send(new PutObjectCommand(params));

      // Формируем публичную ссылку на файл
      const fileUrl = `https://storage.yandexcloud.net/quantum-education/${filename}`;
      res.json({ url: fileUrl });

    } catch (error) {
      console.error('Ошибка загрузки в S3:', error);
      res.status(500).json({
        error: true,
        message: 'Ошибка при загрузке файла',
      });
    }
  },
};