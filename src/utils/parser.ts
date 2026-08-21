import axios from 'axios';
import 'dotenv/config'; // Импорт и вызов сразу
import PlaceRepository from './repositories/place.repository.js';

// Получили места
const response = await axios.get('https://www.mos.ru/api/mss-facade/v1/rental-public-space/spots?');
const data = response.data.data;
const items = data.items as {
  id: number;
  name: string;
  address: string,
  longitude: number,
  latitude: number,
  hall_count: 3,
  short_address: string
}[];


// https://www.mos.ru/api/mss-facade/v1/rental-public-space/hall?page=0&sort=asc&sort_column=preference&spot_id=276123


items.map(async (item) => {
   await PlaceRepository.create({
    provider: 'mos.ru',
    providerId: item.id,
    title: item.name,
    address: item.short_address,
    longitude: item.longitude,
    latitude: item.latitude,
  });
});