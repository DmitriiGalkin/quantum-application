import type { PoolConnection } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';
export class MeetChangeParticipantRepository {
  static async create(meetId: number, revision: number, ids: number[], conn: PoolConnection) {
    for (const id of ids) await conn.execute('INSERT IGNORE INTO meetChangeParticipant (meetId,revision,userId) VALUES (?,?,?)',[meetId,revision,id]);
  }
  static async get(meetId: number, revision: number, userId: number) {
    const [row] = await db.query<{ response: string }>('SELECT response FROM meetChangeParticipant WHERE meetId=? AND revision=? AND userId=?',[meetId,revision,userId]);
    return row ?? null;
  }
  static async respond(meetId: number, revision: number, userId: number, response: 'accepted' | 'declined', conn: PoolConnection) {
    const [result] = await conn.execute<import('mysql2/promise').ResultSetHeader>("UPDATE meetChangeParticipant SET response=?,respondedAt=NOW() WHERE meetId=? AND revision=? AND userId=? AND response='pending'",[response,meetId,revision,userId]);
    return result.affectedRows > 0;
  }
}
