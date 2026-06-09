import axios from 'axios';
import 'dotenv/config'; // Импорт и вызов сразу
import PlaceRepository from './models/place.repository.js';
import { Hall } from './mosrutype.js';

const axiosInstance = axios.create({
  baseURL: 'https://www.mos.ru/api/mss-facade/v1/',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    Accept: 'application/json',
  },
  timeout: 10000,
});

axiosInstance.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 429) {
      console.log('Rate limit, ждём...');
      await new Promise(res => setTimeout(res, 5000));
    }
    return Promise.reject(error);
  },
);

// Получили места
const places = await PlaceRepository.findMOSRU();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

for (const place of places) {
  try {
    const response = await axiosInstance.get(`rental-public-space/hall?page=0&sort=asc&sort_column=preference&spot_id=${place.providerId}`);

    const items = response.data.data.items as Hall[];

    if (!items.length) continue;

    await PlaceRepository.update(place.id, {
      phone: items[0].spot.phone,
    });

    console.log(place.id, 'обновлен');

    // 👇 КЛЮЧЕВОЕ — пауза
    await delay(1000 + Math.random() * 2000);
  } catch (e) {
    console.error('Ошибка:', place.id, e.message);

    // 👇 если ошибка — тоже пауза
    await delay(3000);
  }
}
