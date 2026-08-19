import { db } from '../dbNext.js';

class PlaceLocationRepository {
  static async create(data: { placeId: number; title: string }): Promise<number> {
    const result = await db.execute(
      `INSERT INTO placeLocation (placeId, title)
       VALUES (?, ?)`,
      [data.placeId, data.title],
    );

    return result.insertId;
  }

  static async findLocations(placeId: number): Promise<any[]> {
    const rows = await db.query(
      `SELECT *
       FROM placeLocation
       WHERE placeLocation.placeId = ?`,
      [placeId],
    );

    return rows;
  }

  // ✅ DELETE (soft)
  static async delete(id: number): Promise<void> {
    await db.execute(`UPDATE placeLocation SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?`, [id]);
  }
}
export default PlaceLocationRepository;

