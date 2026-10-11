import { withDemoConnection, reportCliError } from './demo-cli.js';
import { runMeetMigration } from './meet-migration.js';

await withDemoConnection(conn => runMeetMigration(conn, process.argv.includes('--apply'))).catch(reportCliError);
