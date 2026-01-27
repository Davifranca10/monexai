// lib/rateLimit.ts
import { redis } from "./redis";

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
) {
  const tx = redis.multi();

  tx.incr(key);
  tx.ttl(key);

  const results = await tx.exec();
  const count = results?.[0] as number;
  const ttl = results?.[1] as number;

  if (ttl === -1) {
    await redis.expire(key, windowSeconds);
  }

  return count <= limit;
}
