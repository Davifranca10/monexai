// lib/rateLimit.ts
import { redis } from "./redis";

export async function loginRateLimit(identifier: string) {
  const key = `login:${identifier}`;

  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, 60); // 1 minute window
  }

  return attempts <= 5;
}
