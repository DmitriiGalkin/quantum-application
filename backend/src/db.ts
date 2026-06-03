import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_DATABASE ?? 'my_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
});

async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Успешно подключено к БД '${process.env.DB_DATABASE ?? 'my_database'}' на порту ${connection.config.port}`);

    connection.release();
  } catch (err) {
    // @ts-ignore
    console.error('❌ Не удалось подключиться к базе данных:', err.message);
  }
}

checkConnection();

// Обработка глобальных ошибок пула (например, потеря соединения)
// @ts-ignore
pool.on('error', err => {
  console.error('❗ Ошибка в пуле соединений MySQL:', err);
});

export default pool;
