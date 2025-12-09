import { Redis } from "@upstash/redis";

// Initialize Redis client for caching
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache namespaces for organization
export const CACHE_KEYS = {
  QUOTE: (symbol: string) => `mkt:quote:${symbol}`,
  CANDLES: (symbol: string, resolution: string) => `mkt:candles:${symbol}:${resolution}`,
  PROFILE: (symbol: string) => `mkt:profile:${symbol}`,
  SEARCH: (query: string) => `mkt:search:${query}`,
  RATE_LIMIT: () => `mkt:rate:limit`,
} as const;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  QUOTE: 15, // 15 seconds for real-time quotes
  CANDLES: 300, // 5 minutes for historical candles
  PROFILE: 86400, // 24 hours for company profiles
  SEARCH: 3600, // 1 hour for search results
  RATE_LIMIT: 60, // 1 minute window for rate limiting
} as const;
