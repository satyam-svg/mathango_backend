// config/redis.js
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

await client.connect();

export default {
  get: (...args) => client.get(...args),
  set: (...args) => client.set(...args),
  setEx: (...args) => client.setEx(...args),
  del: (...args) => client.del(...args),
  incr: (...args) => client.incr(...args),
  expire: (...args) => client.expire(...args),
  keys: (...args) => client.keys(...args),
};
