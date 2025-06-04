import redisClient from '../config/reddis.js';

const rateLimiter = async (req, res, next) => {
  const ip = req.ip;
  const key = `rate_limit:${ip}`;
  
  try {
    const requests = await redisClient.incr(key);
    if (requests === 1) {
      await redisClient.expire(key, 60);
    }
    
    if (requests > 1) {
      return res.status(429).json({
        error: 'Too many requests - try again after 1 minute'
      });
    }
    
    next();
  } catch (err) {
    console.error('Rate limiter error:', err);
    next();
  }
};

export default rateLimiter;