import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';

import { toPlace } from '../mappers/place.mapper.js';
import type { CreatePlaceInput, Place, UpdatePlaceInput, PlaceRow } from 'entities';
import { db } from '../utils/dbNext.js';

class PlaceRepository {
  static async findByIds(ids: number[]): Promise<Place[]> {
    if (!ids.length) return [];
    const rows = await db.query<PlaceRow>(
      'SELECT * FROM place WHERE id IN (?)',
      [[...new Set(ids)]],
    );
    return rows.map(toPlace);
  }

  // ✅ CREATE
  static async create(data: CreatePlaceInput, conn?: PoolConnection): Promise<number> {
    const result = await (conn ?? db).execute<ResultSetHeader>(
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

    return Array.isArray(result) ? result[0].insertId : result.insertId;
  }

  // ✅ UPDATE (универсальный)
  static async update(id: number, data: UpdatePlaceInput, conn?: PoolConnection): Promise<boolean> {
    const keys = ['title', 'description', 'image', 'latitude', 'longitude', 'address', 'provider', 'providerId', 'phone', 'priceFrom'] as const;
    const entries = keys.filter(key => data[key] !== undefined).map(key => [key, data[key]] as const);

    if (entries.length === 0) return false;

    const fields = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value ?? null);

    const result = await (conn ?? db).execute<ResultSetHeader>(`UPDATE place SET ${fields} WHERE id = ?`, [...values, id]);

    return (Array.isArray(result) ? result[0] : result).affectedRows > 0;
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
    const rows = await db.query<PlaceRow>(
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
