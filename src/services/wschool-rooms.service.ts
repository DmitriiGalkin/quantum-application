import type { PoolConnection } from 'mysql2/promise';
import PlaceRepository from '../repositories/place.repository.js';
import PlaceLocationRepository from '../repositories/place-location.repository.js';
import DemoSchemaRepository from '../repositories/demo-schema.repository.js';

export const schoolRoomTitles = ['мастерская', 'актовый зал', 'кабинет дополнительный'];
export interface SchoolRoomsSnapshot { center: Record<string, unknown>; rooms: Record<string, unknown>[] }
export class WschoolRoomsService {
  static async inspect(conn: PoolConnection): Promise<SchoolRoomsSnapshot> {
    const metadata = await DemoSchemaRepository.maintenanceMetadata(conn);
    if (!metadata.tables.some(row => String(row.tableName).toLowerCase() === 'placelocation' && row.engine === 'InnoDB')
      || metadata.triggers.some(row => String(row.tableName).toLowerCase() === 'placelocation')) throw new Error('Unreviewed placeLocation schema');
    const center = (await PlaceRepository.inspectSeedRows(conn)).find(row => row.id === 597);
    if (!center || center.title !== 'Живой источник') throw new Error('Expected school 597');
    return { center, rooms: (await PlaceLocationRepository.inspectSeedRows(conn)).filter(row => row.placeId === 597) };
  }
  static plan(snapshot: SchoolRoomsSnapshot) {
    return schoolRoomTitles.map(title => {
      const matches = snapshot.rooms.filter(row => row.deletedAt == null && String(row.title).trim().toLocaleLowerCase('ru-RU') === title);
      if (matches.length > 1) throw new Error(`Ambiguous room: ${title}`);
      return { title, id: matches.length ? Number(matches[0].id) : undefined };
    });
  }
  static async apply(conn: PoolConnection, snapshot: SchoolRoomsSnapshot) {
    const result = [];
    for (const room of this.plan(snapshot)) result.push({ title: room.title, id: room.id ?? await PlaceLocationRepository.create({ placeId: 597, title: room.title }, conn) });
    return result;
  }
}
