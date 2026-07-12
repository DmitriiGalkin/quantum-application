import { ResultSetHeader } from 'mysql2/promise';

import { toPlace } from '../mappers/place.mapper.js';
import { CreatePlaceInput, Place, UpdatePlaceInput } from '../entities/place.js';
import { PlaceRow } from '../entities/place.db.js';
import { db } from '../dbNext.js';
import { User } from '../entities/user.js';
import { UserRow } from '../entities/user.db.js';
import { mapUserRow } from '../mappers/user.mapper.js';

class PlaceRepository {
  // ✅ CREATE
  static async create(data: CreatePlaceInput): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO place
       (title, description, latitude, longitude, address, provider, providerId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description ?? null,
        data.latitude ?? null,
        data.longitude ?? null,
        data.address ?? null,
        data.provider ?? null,
        data.providerId ?? null,
      ],
    );

    return result.insertId;
  }

  // ✅ UPDATE (универсальный)
  static async update(id: number, data: UpdatePlaceInput): Promise<boolean> {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);

    if (entries.length === 0) return false;

    const fields = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);

    const result = await db.execute<ResultSetHeader>(`UPDATE place SET ${fields} WHERE id = ?`, [...values, id]);

    return result.affectedRows > 0;
  }

  // ✅ FIND ALL
  static async findAll(): Promise<Place[]> {
    const rows = await db.query<PlaceRow>('SELECT * FROM place');

    return rows.map(toPlace);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<Place | null> {
    const rows = await db.query<PlaceRow>('SELECT * FROM place WHERE id = ?', [id]);

    if (!rows[0]) return null;

    return toPlace(rows[0]);
  }

  // ✅ FIND BY PASSPORT
  static async findByPassportId(passportId: number): Promise<Place[]> {
    const rows = await db.query(
      `
        SELECT
          place.*
        FROM place
               INNER JOIN placePassport pp
                          ON pp.placeId = place.id
        WHERE pp.passportId = ?
      `,
      [passportId],
    );

    return rows.map(toPlace);
  }

  static async findByTitle(title: string): Promise<Place | null> {
    const rows = await db.query<PlaceRow>('SELECT * FROM place WHERE title = ?', [title]);

    if (!rows[0]) return null;

    return toPlace(rows[0]);
  }

  // ✅ FIND MOS.RU
  static async findMOSRU(): Promise<Place[]> {
    const rows = await db.query<PlaceRow>(
      `SELECT * 
       FROM place 
       WHERE provider = ? 
         AND phone IS NULL`,
      ['mos.ru'],
    );

    return rows.map(toPlace);
  }
}

export default PlaceRepository;
