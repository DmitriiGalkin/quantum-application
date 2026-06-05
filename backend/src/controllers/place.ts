import Place from '../models/place.js';
import { Response } from 'express'; // Импортируем нужные типы
import { RequestWithPassport } from '../router.js';
import { Place as IPlace } from '../../../application/src/types.js';
import Meet from 'models/meet.js'; // Импортируем пул соединений

export default {
  /**
   * Получение списка всех мест
   */
  findAll: async (req: RequestWithPassport, res: Response) => {
    try {
      const places = await Place.findAll();
      const meetsForPlaces = await Promise.all(places.map(place => Meet.findByPlaceId(place.id)));

      res.json(
        places.map((place, idx) => ({
          ...place,
          meets: meetsForPlaces[idx],
        })),
      );
    } catch (err) {
      console.error('place.findAll error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить список мест' });
    }
  },

  /**
   * Создание нового места
   */
  create: async (req: RequestWithPassport, res: Response) => {
    try {
      // Проверка на пустое тело запроса
      if (Object.keys(req.body as unknown as IPlace).length === 0) {
        return res.status(400).json({ error: true, message: 'Пожалуйста, предоставьте все необходимые поля' });
      }

      // Вызов метода модели для создания записи
      const newPlaceId = await Place.create(req.body as unknown as IPlace);

      // Возвращаем ID созданного места со статусом 201 Created
      res.status(201).json({ message: 'Место успешно создано', id: newPlaceId });
    } catch (err) {
      console.error('place.create error:', err);
      res.status(500).json({ error: true, message: 'Не удалось создать место' });
    }
  },
};
