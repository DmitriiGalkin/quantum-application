import { PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import { v4 as uuidv4 } from 'uuid';

import s3Client from '../s3.js'; // Импортируем ES-модуль

export default {
  upload: async (req, res) => {
    console.log('Пошла загрузка');
    // Файл доступен в req.file
    if (!req.file) {
      return res.status(400).send('Файл не загружен');
    }
    console.log('Информация о файле:', req.file);

    // - originalname: исходное имя файла
    // - filename: имя файла на сервере (например, с хэшем)
    // - path: путь до файла на сервере
    // - size: размер файла
    // - mimetype: MIME-тип

    try {
      const filename = uuidv4() + path.extname(req.file.originalname);
      //const fileContent = fs.readFileSync(req.file.path + req.file.filename);

      const params = {
        Bucket: 'quantum-education',
        Key: filename,
        Body: req.file.buffer,
        ContentType: mime.getType(req.file.mimetype),
        CacheControl: 'max-age=' + 3600 * 24 * 365, // например, кэшировать на год
      };

      await s3Client.send(new PutObjectCommand(params));

      const fileUrl = `https://storage.yandexcloud.net/quantum-education/${filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Ошибка загрузки в S3:', error);
      res.status(500).json({ error: 'Ошибка при загрузке файла' });
    }

    //const form = formidable({ multiples: false });

    // form.parse(req, async (err, fields, files) => {
    //   if (err) {
    //     return res.status(500).json({ error: 'Ошибка при парсинге формы' });
    //   }
    //
    //   const file = files.image;
    //   if (!file) {
    //     return res.status(400).json({ error: 'Файл не найден' });
    //   }
    //
    //
    // });
  }
}
