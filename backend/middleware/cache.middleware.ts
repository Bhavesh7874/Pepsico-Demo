import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/redis.service';

export const cacheMiddleware = (ttl: number = 3600) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;

        try {
            const startTime = Date.now();
            const cachedData = await redisService.get(key);

            if (cachedData) {
                const responseTime = Date.now() - startTime;
                res.setHeader('X-Cache', 'HIT');
                res.setHeader('X-Response-Time', `${responseTime}ms`);
                return res.json(JSON.parse(cachedData));
            }

            // Patch res.json to cache the response
            const originalJson = res.json;
            res.json = function (data) {
                const responseTime = Date.now() - startTime;
                res.setHeader('X-Cache', 'MISS');
                res.setHeader('X-Response-Time', `${responseTime}ms`);

                // Cache the data before sending
                redisService.set(key, JSON.stringify(data), ttl).catch(err => {
                    console.error('Redis Set Error:', err);
                });

                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            console.error('Cache Middleware Error:', error);
            next();
        }
    };
};
