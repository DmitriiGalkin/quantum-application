import axios from 'axios';
import * as cheerio from 'cheerio';
// import { createClient } from 'redis';
//
// const redis = createClient({
//   url: 'redis://localhost:6379',
// });
//
// redis.connect();

const html = await axios.get('https://www.mos.ru/arenda/catalog/?sorting=preference%2Fasc&total=1761&page=0');
const $ = cheerio.load(html.data);

const items = $('main').children('div').first().children('div').children('div').children('div').children('div');

const result = items
  .map((i, el) => {
    const $el = $(el);

    // 🟡 TITLE
    const title = $el.find('h3').text().trim();

    const blocks = $el.children('div');
    const address = blocks.eq(1).text().trim();

    const price = blocks.eq(1).find('div').eq(1).text().trim();

    return { title, address, price };
  })
  .get();


console.log(result);