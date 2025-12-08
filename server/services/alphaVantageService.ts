import { redis } from "../lib/redis";

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";
const BASE_URL = "https://www.alphavantage.co/query";

// Cache configuration
const CACHE_TTL = {
  QUOTE: 15, // 15 seconds for real-time quotes
  CANDLES: 86400, // 24 hours for historical data (to survive daily rate limits)
  PROFILE: 86400, // 24 hours for company info
};

const CACHE_KEYS = {
  QUOTE: (symbol: string) => `av:quote:${symbol}`,
  CANDLES: (symbol: string, interval: string) => `av:candles:${symbol}:${interval}`,
  PROFILE: (symbol: string) => `av:profile:${symbol}`,
};

// Rate limiting: Alpha Vantage free tier = 5 calls/minute, 500 calls/day
let requestCount = 0;
let requestResetTime = Date.now() + 60000;

async function checkRateLimit(): Promise<boolean> {
  const now = Date.now();
  
  if (now >= requestResetTime) {
    requestCount = 0;
    requestResetTime = now + 60000;
  }
  
  if (requestCount >= 4) { // Keep 1 request as buffer
    console.warn("Alpha Vantage rate limit reached (5 req/min)");
    return false;
  }
  
  requestCount++;
  return true;
}

async function makeRequest(params: Record<string, string>, cacheKey?: string): Promise<any> {
  // Check rate limit
  const canMakeRequest = await checkRateLimit();
  
  if (!canMakeRequest) {
    console.warn("Rate limit hit, attempting to return cached data");
    
    // Try to return cached data if available
    if (cacheKey) {
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) {
        console.log(`Returning cached data for ${cacheKey}`);
        return cached;
      }
    }
    
    // If no cache available, throw error
    throw new Error("Rate limit exceeded and no cached data available");
  }

  const queryParams = new URLSearchParams({
    ...params,
    apikey: ALPHA_VANTAGE_API_KEY,
  });

  const url = `${BASE_URL}?${queryParams}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Alpha Vantage API error:", error);
    throw error;
  }
}

export interface Quote {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
}

export interface Candle {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  t: number[];
  v: number[];
  s: string;
}

export const alphaVantageService = {
  /**
   * Get real-time quote for a symbol
   */
  async getRealtimeQuote(symbol: string): Promise<Quote | null> {
    try {
      const cacheKey = CACHE_KEYS.QUOTE(symbol);
      
      // Try cache first
      const cached = await redis.get<Quote>(cacheKey).catch(() => null);
      if (cached) return cached;

      // Fetch from Alpha Vantage (pass cache key for rate limit fallback)
      const data = await makeRequest({
        function: "GLOBAL_QUOTE",
        symbol: symbol,
      }, cacheKey);

      if (!data["Global Quote"] || Object.keys(data["Global Quote"]).length === 0) {
        console.warn(`No quote data for ${symbol}`);
        return null;
      }

      const quote = data["Global Quote"];
      
      const formattedQuote: Quote = {
        c: parseFloat(quote["05. price"]),
        o: parseFloat(quote["02. open"]),
        h: parseFloat(quote["03. high"]),
        l: parseFloat(quote["04. low"]),
        pc: parseFloat(quote["08. previous close"]),
        d: parseFloat(quote["09. change"]),
        dp: parseFloat(quote["10. change percent"].replace("%", "")),
        t: Math.floor(Date.now() / 1000),
      };

      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL.QUOTE, formattedQuote).catch(() => {});

      return formattedQuote;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  },

  /**
   * Get historical daily candles
   */
  async getDailyCandles(symbol: string, outputsize: "compact" | "full" = "compact"): Promise<Candle | null> {
    try {
      const cacheKey = CACHE_KEYS.CANDLES(symbol, "daily");
      
      // Try cache first
      const cached = await redis.get<Candle>(cacheKey).catch(() => null);
      if (cached) return cached;

      // Fetch from Alpha Vantage (pass cache key for rate limit fallback)
      const data = await makeRequest({
        function: "TIME_SERIES_DAILY",
        symbol: symbol,
        outputsize: outputsize, // compact = last 100 days, full = 20+ years (requires API key)
      }, cacheKey);

      console.log(`Alpha Vantage daily response for ${symbol}:`, { 
        hasTimeSeries: !!data["Time Series (Daily)"],
        keys: Object.keys(data),
        note: data.Note,
        error: data["Error Message"]
      });

      if (!data["Time Series (Daily)"]) {
        console.warn(`No daily data for ${symbol}`, data);
        return null;
      }

      const timeSeries = data["Time Series (Daily)"];
      const dates = Object.keys(timeSeries).sort();
      
      const candle: Candle = {
        t: [],
        o: [],
        h: [],
        l: [],
        c: [],
        v: [],
        s: "ok",
      };

      for (const date of dates) {
        const bar = timeSeries[date];
        candle.t.push(new Date(date + "T00:00:00Z").getTime() / 1000);
        candle.o.push(parseFloat(bar["1. open"]));
        candle.h.push(parseFloat(bar["2. high"]));
        candle.l.push(parseFloat(bar["3. low"]));
        candle.c.push(parseFloat(bar["4. close"]));
        candle.v.push(parseFloat(bar["5. volume"]));
      }

      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL.CANDLES, candle).catch(() => {});

      return candle;
    } catch (error: any) {
      console.error(`Error fetching daily candles for ${symbol}:`, error);
      
      // If rate limited, try to return stale cached data
      if (error.message?.includes("Rate limit")) {
        const cacheKey = CACHE_KEYS.CANDLES(symbol, "daily");
        const staleCache = await redis.get<Candle>(cacheKey).catch(() => null);
        if (staleCache) {
          console.log(`Returning stale cached data for ${symbol} due to rate limit`);
          return staleCache;
        }
      }
      
      return null;
    }
  },

  /**
   * Get historical weekly candles
   */
  async getWeeklyCandles(symbol: string): Promise<Candle | null> {
    try {
      const cacheKey = CACHE_KEYS.CANDLES(symbol, "weekly");
      
      // Try cache first
      const cached = await redis.get<Candle>(cacheKey).catch(() => null);
      if (cached) return cached;

      // Fetch from Alpha Vantage (pass cache key for rate limit fallback)
      const data = await makeRequest({
        function: "TIME_SERIES_WEEKLY",
        symbol: symbol,
      }, cacheKey);

      if (!data["Weekly Time Series"]) {
        console.warn(`No weekly data for ${symbol}`);
        return null;
      }

      const timeSeries = data["Weekly Time Series"];
      const dates = Object.keys(timeSeries).sort();
      
      const candle: Candle = {
        t: [],
        o: [],
        h: [],
        l: [],
        c: [],
        v: [],
        s: "ok",
      };

      for (const date of dates) {
        const bar = timeSeries[date];
        candle.t.push(new Date(date + "T00:00:00Z").getTime() / 1000);
        candle.o.push(parseFloat(bar["1. open"]));
        candle.h.push(parseFloat(bar["2. high"]));
        candle.l.push(parseFloat(bar["3. low"]));
        candle.c.push(parseFloat(bar["4. close"]));
        candle.v.push(parseFloat(bar["5. volume"]));
      }

      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL.CANDLES, candle).catch(() => {});

      return candle;
    } catch (error: any) {
      console.error(`Error fetching weekly candles for ${symbol}:`, error);
      
      // If rate limited, try to return stale cached data
      if (error.message?.includes("Rate limit")) {
        const cacheKey = CACHE_KEYS.CANDLES(symbol, "weekly");
        const staleCache = await redis.get<Candle>(cacheKey).catch(() => null);
        if (staleCache) {
          console.log(`Returning stale cached data for ${symbol} due to rate limit`);
          return staleCache;
        }
      }
      
      return null;
    }
  },

  /**
   * Get company overview/profile
   */
  async getCompanyProfile(symbol: string): Promise<any> {
    try {
      const cacheKey = CACHE_KEYS.PROFILE(symbol);
      
      // Try cache first
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return cached;

      // Fetch from Alpha Vantage (pass cache key for rate limit fallback)
      const data = await makeRequest({
        function: "OVERVIEW",
        symbol: symbol,
      }, cacheKey);

      if (!data.Symbol) {
        console.warn(`No profile data for ${symbol}`);
        return null;
      }

      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL.PROFILE, data).catch(() => {});

      return data;
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error);
      return null;
    }
  },

  /**
   * Search for symbols
   */
  async searchSymbols(query: string): Promise<any[]> {
    try {
      const data = await makeRequest({
        function: "SYMBOL_SEARCH",
        keywords: query,
      });

      if (!data.bestMatches) {
        return [];
      }

      return data.bestMatches.map((match: any) => ({
        description: match["2. name"],
        displaySymbol: match["1. symbol"],
        symbol: match["1. symbol"],
        type: match["3. type"],
      }));
    } catch (error) {
      console.error("Error searching symbols:", error);
      return [];
    }
  },

  /**
   * Get market status (open/closed)
   * TEMPORARY: Returns always open for testing
   */
  async getMarketStatus(): Promise<{ isOpen: boolean; nextOpen?: string; nextClose?: string }> {
    try {
      // TEMPORARY: Force market open for testing
      // TODO: Uncomment real API call when ready for production
      // return {
      //   isOpen: true,
      //   nextOpen: undefined,
      //   nextClose: "4:00 PM ET"
      // };
      
      // REAL MARKET STATUS CHECK - UNCOMMENT FOR PRODUCTION:
      const data = await makeRequest({
        function: "MARKET_STATUS",
      });

      if (!data.markets) {
        return { isOpen: false };
      }

      // Find US market status
      const usMarket = data.markets.find((m: any) => m.region === "United States");
      if (usMarket) {
        return {
          isOpen: usMarket.current_status === "open",
          nextOpen: usMarket.local_open,
          nextClose: usMarket.local_close,
        };
      }

      return { isOpen: false };
    } catch (error) {
      console.error("Error fetching market status:", error);
      return { isOpen: true }; // Default to open on error for testing
    }
  },

  /**
   * Fallback market status calculation based on time
   */
  calculateMarketStatusFallback(): { isOpen: boolean } {
    const now = new Date();
    const day = now.getUTCDay();
    const hour = now.getUTCHours();
    const isWeekday = day >= 1 && day <= 5;
    const isDuringMarketHours = hour >= 14 && hour < 21; // 9:30 AM - 4:00 PM ET in UTC
    return { isOpen: isWeekday && isDuringMarketHours };
  },
};

