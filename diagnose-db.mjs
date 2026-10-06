import dotenv from 'dotenv';
import dns from 'node:dns/promises';
import net from 'node:net';
dotenv.config({ quiet: true });
const host = process.env.DB_HOST;
const port = Number(process.env.DB_PORT || 3306);
try {
  const addresses = await dns.lookup(host, { all: true });
  console.log(`DNS: OK, ${addresses.length} address(es).`);
  for (const [i, address] of addresses.entries()) {
    await new Promise(resolve => {
      const socket = net.createConnection({ host: address.address, port, family: address.family });
      let connected = false;
      socket.setTimeout(8000);
      socket.on('connect', () => { connected = true; console.log(`Address ${i + 1}, IPv${address.family}, TCP ${port}: OPEN.`); });
      socket.once('data', data => { console.log(`Greeting: ${data[4] === 10 ? 'MySQL protocol 10' : 'received nonstandard response'}.`); socket.destroy(); });
      socket.once('timeout', () => { console.log(`Address ${i + 1}: ${connected ? 'greeting timeout' : 'TCP timeout'}.`); socket.destroy(); });
      socket.once('error', error => console.log(`Address ${i + 1}: ${error.code}.`));
      socket.once('close', resolve);
    });
  }
} catch (error) { console.log(`DNS: ${error.code || error.name}.`); process.exitCode = 1; }
