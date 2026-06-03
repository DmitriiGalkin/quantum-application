import Meet from '../models/meet.js';
import Visit from '../models/visit.js';
import { Response } from 'express'; // Импортируем нужные типы
import { RequestWithPassport } from '../router';
import { Meet as IMeet } from '../../../application/src/types'; // Импортируем пул соединений
import pool from "../db.js";
import { RowDataPacket } from 'mysql2/promise';

export default {
  create: async (req: RequestWithPassport, res: Response) => {
    try {
      const meetId = await Meet.create({ ...req.body, passportId: req.passport.id } as unknown as IMeet);
      res.status(201).json({ message: 'Встреча создана', id: meetId });
    } catch (err) {
      console.error('meet.create error:', err);
      res.status(500).json({ error: true, message: 'Не удалось создать встречу' });
    }
  },

  update: async (req: RequestWithPassport, res: Response) => {
    try {
      await Meet.update({id: Number(req.params.id), ...req.body} as unknown as IMeet);
      res.json({ error: false, message: 'Встреча обновлена' });
    } catch (err) {
      console.error('meet.update error:', err);
      res.status(500).json({ error: true, message: 'Не удалось обновить встречу' });
    }
  },

  delete: async (req: RequestWithPassport, res: Response) => {
    try {
      const meet = await Meet.findById(req.params.id);

      if (!meet) {
        return res.status(404).json({ error: true, message: 'Встреча не существует' });
      }

      if (meet.passportId !== req.passport.id) {
        return res.status(403).json({ error: true, message: 'Нет прав на удаление' });
      }

      await Meet.delete(Number(req.params.id));
      res.json({ error: false, message: 'Встреча удалена' });
    } catch (err) {
      console.error('meet.delete error:', err);
      res.status(500).json({ error: true, message: 'Не удалось удалить встречу' });
    }
  },

  findAll: async (req: RequestWithPassport, res: Response) => {
    try {
      const isForPassport = req.query.isForPassport === 'true';
      const userIdForQuery = isForPassport ? req.passport.id : req.query.userId;

      const sql = `
        SELECT m.*, p.id AS project_id, p.title AS project_title, pl.id AS place_id, pl.title AS place_title,
               v.id AS visit_id, u.id AS user_id, u.title AS user_title
        FROM meet m
               LEFT JOIN project p ON p.id = m.projectId AND p.deletedAt IS NULL
               LEFT JOIN place pl ON pl.id = p.placeId
               LEFT JOIN visit v ON v.meetId = m.id
               LEFT JOIN user u ON u.id = v.userId AND u.deletedAt IS NULL
        WHERE ${isForPassport ? 'm.passportId = ?' : 'EXISTS (SELECT 1 FROM projectUser WHERE projectId = m.projectId AND userId = ?)'}
        ORDER BY m.startedAt DESC
      `;

      const [rows] = await pool.query<RowDataPacket[]>(sql, [userIdForQuery]);

      const meetsMap = new Map<number, any>();

      rows.forEach(row => {
        if (!meetsMap.has(row.id)) {
          meetsMap.set(row.id, {
            ...row,
            id: row.id,
            project: row.project_id
              ? {
                id: row.project_id,
                title: row.project_title,
                place: row.place_id ? { id: row.place_id, title: row.place_title } : null,
              }
              : null,
            visits: [],
          });
        }

        if (row.visit_id) {
          meetsMap.get(row.id).visits.push({
            id: row.visit_id,
            user: row.user_id ? { id: row.user_id, title: row.user_title } : null,
          });
        }
      });

      const result = Array.from(meetsMap.values());
      res.json(result);
    } catch (err) {
      console.error('meet.findAll error:', err);
      res.status(500).json({ error: true, message: 'Ошибка при выполнении запроса к базе данных.' });
    }
  },

  findById: async (req: RequestWithPassport, res: Response) => {
    try {
      const sql = `
        SELECT m.*, p.id AS project_id, p.title AS project_title, pl.id AS place_id, pl.title AS place_title,
               v.id AS visit_id, u.id AS user_id, u.title AS user_title
        FROM meet m
               LEFT JOIN project p ON p.id = m.projectId AND p.deletedAt IS NULL
               LEFT JOIN place pl ON pl.id = p.placeId
               LEFT JOIN visit v ON v.meetId = m.id
               LEFT JOIN user u ON u.id = v.userId AND u.deletedAt IS NULL
        WHERE m.id = ?
      `;

      const [rows] = await pool.query<RowDataPacket[]>(sql, [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: true, message: 'Встреча не найдена' });
      }

      const meetRow = rows[0];

      const result = {
        ...meetRow,
        id: meetRow.id,
        project: meetRow.project_id
          ? {
            id: meetRow.project_id,
            title: meetRow.project_title,
            place: meetRow.place_id ? { id: meetRow.place_id, title: meetRow.place_title } : null,
          }
          : null,
        visits: [],
      };

      rows.forEach(row => {
        if (row.visit_id) {
          // @ts-ignore
          result.visits.push({
            id: row.visit_id,
            user: row.user_id ? { id: row.user_id, title: row.user_title } : null,
          });
        }
      });

      res.json(result);
    } catch (err) {
      console.error('meet.findById error:', err);
      res.status(500).json({ error: true, message: 'Ошибка при выполнении запроса к базе данных.' });
    }
  },
};