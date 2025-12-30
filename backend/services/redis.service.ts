import { createClient, RedisClientType } from 'redis';

class RedisService {
    private client: RedisClientType;
    private isConnected: boolean = false;

    constructor() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.client = createClient({
            url: redisUrl
        });

        this.client.on('error', (err) => console.error('Redis Client Error', err));
        this.client.on('connect', () => {
            this.isConnected = true;
            console.log('Redis connected successfully');
        });
    }

    async connect() {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }

    async get(key: string): Promise<string | null> {
        await this.connect();
        return await this.client.get(key);
    }

    async set(key: string, value: string, ttl: number = 3600): Promise<void> {
        await this.connect();
        await this.client.set(key, value, {
            EX: ttl
        });
    }

    async del(key: string): Promise<void> {
        await this.connect();
        await this.client.del(key);
    }

    async flush(): Promise<void> {
        await this.connect();
        await this.client.flushAll();
    }
}

export const redisService = new RedisService();
