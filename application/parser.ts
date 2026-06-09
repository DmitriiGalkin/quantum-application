import axios from 'axios';
import * as cheerio from 'cheerio';
// import { createClient } from 'redis';
//
// const redis = createClient({
//   url: 'redis://localhost:6379',
// });
//
// redis.connect();

const response = await axios.get('https://www.mos.ru/api/mss-facade/v1/rental-public-space/spots?');
const data = response.data.data;
const items = data.items;


// https://www.mos.ru/api/mss-facade/v1/rental-public-space/hall?page=0&sort=asc&sort_column=preference&spot_id=276123

console.log(response, data, items, 'items');

items.map(item => {
  const placeId = Place;
});