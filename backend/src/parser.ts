import axios from 'axios';
import 'dotenv/config'; // Импорт и вызов сразу
import PlaceRepository from './models/place.repository.js';

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

console.log(response, data, items, 'items');

items.map(async (item) => {
  const placeId = await PlaceRepository.create({
    provider: 'mos.ru',
    providerId: item.id,
    title: item.name,
    address: item.short_address,
    longitude: item.longitude,
    latitude: item.latitude,
  });
  console.log(placeId);
});