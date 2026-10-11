import { withDemoConnection, reportCliError } from './demo-cli.js';
import { PersonalDemoService } from '../src/services/demo-personal.service.js';

const args = process.argv.slice(2);
try {
  if (args.some(arg => arg !== '--apply')) throw new Error('Usage: seed-dmitry.ts [--apply]');
  await withDemoConnection(async conn => {
    await conn.beginTransaction();
    const result = await PersonalDemoService.run(conn, args.includes('--apply'));
    if (args.includes('--apply')) await conn.commit(); else await conn.rollback();
    console.log(JSON.stringify(result, null, 2));
  });
} catch (error) { reportCliError(error); }
