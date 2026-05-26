// src/config/redis.js
import { createClient } from 'redis';
import { promisify } from 'util';

// Создаем клиента. В новых версиях redis-клиента это делается так.
const client = createClient({
  url: `redis://172.17.0.1:6379`, // Укажите ваш адрес Redis, если он другой
});

// Обработка ошибок подключения
client.on('error', err => {
  console.error('Redis Client Error:', err);
});
client.on('connect', () => {
  console.log('✅ Redis успешно подключён на порту 6379');
});

// Подключаемся к серверу
await client.connect();

// Создаем промисифицированные версии методов для удобства с async/await
client.getAsync = promisify(client.get).bind(client);
client.setAsync = promisify(client.set).bind(client);

export default client;
