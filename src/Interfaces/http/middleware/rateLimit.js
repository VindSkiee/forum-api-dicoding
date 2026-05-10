import rateLimit from 'express-rate-limit';

const threadsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 90,
  standardHeaders: true,
  legacyHeaders: false,
});

export default threadsRateLimiter;
