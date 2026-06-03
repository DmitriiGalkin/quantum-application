import Meet from '../models/meet.js';
import Visit from '../models/visit.js';
import { Response } from 'express'; // Импортируем нужные типы
import { RequestWithPassport } from '../router';

function getPassportUserIds(req) {
  return (req.users || []).map(user => user.id);
}

// Эта функция не экспортируется, так как используется только внутри этого модуля
async function findVisitAndMeet({ visitId }: { visitId: string }) {
  const visit = await Visit.findById(visitId);

  if (!visit) {
    const error = new Error('Участие не существует');
    error.status = 404;
    throw error;
  }

  const meet = await Meet.findById(visit.meetId);

  if (!meet) {
    const error = new Error('Встреча не найдена');
    error.status = 404;
    throw error;
  }

  return { visit, meet };
}

export default {
  /**
   * Создание участия пользователя во встрече
   */
  create: async (req: RequestWithPassport, res: Response) => {
    try {
      const { meetId, userId } = req.body;

      if (!meetId || !userId) {
        return res.status(400).json({ error: true, message: 'meetId и userId обязательны' });
      }

      // Проверка существования встречи
      const meet = await Meet.findById(meetId);
      if (!meet) {
        return res.status(404).json({ error: true, message: 'Встреча не найдена' });
      }

      // Проверка на дублирование участия
      const currentVisit = await Visit.findByUserAndMeetIds(userId, meetId);
      if (currentVisit) {
        return res.status(409).json({ error: true, message: 'Участие уже существует' });
      }

      // Проверка прав доступа
      if (!getPassportUserIds(req).includes(userId)) {
        return res
          .status(403)
          .json({ error: true, message: 'Нельзя добавлять участника отличного от себя' });
      }

      const visit = new Visit(req.body);
      await Visit.create(visit);

      res.status(201).json({ error: false, message: 'Участие создано' });
    } catch (err) {
      console.error('visit.create error:', err);
      res.status(500).json({ error: true, message: 'Не удалось создать участие' });
    }
  },

  /**
   * Удаление участия пользователя из встречи
   */
  delete: async (req: RequestWithPassport, res: Response) => {
    try {
      const { id } = req.params; // Используем деструктуризацию для ясности
      const { visit } = await findVisitAndMeet({ visitId: id });

      // Проверка прав доступа перед удалением
      if (!getPassportUserIds(req).includes(visit.userId)) {
        return res.status(403).json({ error: true, message: 'Нет прав на удаление' });
      }

      await Visit.delete(id);

      res.json({ error: false, message: 'Участник удален из встречи' });
    } catch (err) {
      console.error('visit.delete error:', err);
      res
        .status(err.status || 500)
        .json({ error: true, message: err.message || 'Не удалось удалить участие' });
    }
  },

  /**
   * Получение всех встреч для конкретного пользователя
   * Оптимизированный запрос с JOIN для сборки вложенной структуры данных.
   */
  findAll: async (req: RequestWithPassport, res: Response) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: true, message: 'Параметр userId обязателен' });
      }

      const sql = `
        SELECT v.*,
               m.id AS meet_id, m.startedAt AS meet_startedAt, m.projectId AS meet_projectId,
               p.id AS project_id, p.title AS project_title, p.placeId AS project_placeId,
               pl.id AS place_id, pl.title AS place_title, pl.latitude, pl.longitude
        FROM visit v
        LEFT JOIN meet m ON m.id = v.meetId AND m.deletedAt IS NULL
        LEFT JOIN project p ON p.id = m.projectId AND p.deletedAt IS NULL
        LEFT JOIN place pl ON pl.id = p.placeId
        WHERE v.userId = ?
        ORDER BY m.startedAt DESC
      `;

      const [rows] = await Visit.pool.query(sql, [userId]);

      // Группируем данные. Ключевое изменение: используем meet_id для проверки наличия встречи.
      const result = rows.map(row => ({
        ...row,
        meet: row.meet_id
          ? {
            id: row.meet_id,
            startedAt: row.meet_startedAt,
            project: row.project_id
              ? {
                id: row.project_id,
                title: row.project_title,
                place: row.place_id
                  ? {
                    id: row.place_id,
                    title: row.place_title,
                    latitude: row.latitude,
                    longitude: row.longitude,
                  }
                  : null,
              }
              : null,
          }
          : null,
      }));

      res.json(result);
    } catch (err) {
      console.error('visit.findAll error:', err);
      res.status(500).json({ error: true, message: 'Не удалось получить посещения' });
    }
  },
};