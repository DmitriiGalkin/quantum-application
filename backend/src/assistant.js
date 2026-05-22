import GigaChat from 'gigachat';
import { Agent } from 'node:https';

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const assistant = new GigaChat({
  credentials: process.env.GIGA_CREDENTIALS,
  httpsAgent,
  timeout: 600,
  model: 'GigaChat',
});

export default assistant;
