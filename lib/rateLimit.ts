// lib/rateLimit.ts
import { redis } from "./redis";

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
) {
  const tx = redis.multi();

  tx.incr(key);
  tx.expire(key, windowSeconds);

  const results = await tx.exec();
  const count = results?.[0] as number;

  return count <= limit;
}
