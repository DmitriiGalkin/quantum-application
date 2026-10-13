import type { PoolConnection } from 'mysql2/promise';
import type { LocationPhoto } from 'entities';
import { db } from '../utils/dbNext.js';

export class LocationPhotoRepository {
  static async findByLocationIds(ids: number[]): Promise<LocationPhoto[]> {
    if (!ids.length) return [];
    return db.query<LocationPhoto>('SELECT id, locationId, url, position FROM placeLocationPhoto WHERE locationId IN (?) ORDER BY position, id', [ids]);
  }

  static async replace(locationId: number, urls: string[], conn: PoolConnection): Promise<void> {
    await conn.execute('DELETE FROM placeLocationPhoto WHERE locationId = ?', [locationId]);
    for (const [position, url] of urls.entries()) {
      await conn.execute('INSERT INTO placeLocationPhoto (locationId, url, position) VALUES (?, ?, ?)', [locationId, url, position]);
    }
  }
}
