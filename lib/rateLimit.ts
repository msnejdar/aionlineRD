import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache<string, number>({
  max: 500,
  ttl: 60000, // 1 minuta
});

export function rateLimit(ip: string, maxRequests: number = 10): boolean {
  const count = rateLimitCache.get(ip) || 0;

  if (count >= maxRequests) {
    return false; // Zamítnout
  }

  rateLimitCache.set(ip, count + 1);
  return true; // Povolit
}
