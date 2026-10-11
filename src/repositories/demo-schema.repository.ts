import type { PoolConnection, RowDataPacket } from 'mysql2/promise';

export default class DemoSchemaRepository {
  static async maintenanceMetadata(conn: PoolConnection) {
    const [references] = await conn.query<RowDataPacket[]>(
      'SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName, REFERENCED_TABLE_NAME AS target FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL');
    const [tables] = await conn.query<RowDataPacket[]>(
      'SELECT TABLE_NAME AS tableName, ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()');
    const [triggers] = await conn.query<RowDataPacket[]>(
      'SELECT EVENT_OBJECT_TABLE AS tableName FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = DATABASE()');
    return { references, tables, triggers };
  }
  static async columns(conn: PoolConnection): Promise<{ tableName: string; columnName: string; columnType: string }[]> {
    const [rows] = await conn.query<(RowDataPacket & { tableName: string; columnName: string; columnType: string })[]>(
      'SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName, COLUMN_TYPE AS columnType FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()',
    );
    return rows;
  }
}
