import { createClient } from 'redis';

const client = createClient({
  url: `redis://${process.env.DB_HOST}:6379`, // Укажите ваш адрес Redis, если он другой
});

client.on('error', err => {
  console.error('Redis Client Error:', err);
});
client.on('connect', () => {
  console.log('✅ Redis успешно подключён на порту 6379');
});

await client.connect();

export default client;
