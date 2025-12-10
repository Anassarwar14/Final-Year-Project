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
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log(`Returning cached data for ${cacheKey}`);
          return cached;
        }
      } catch (err) {
        console.error("Redis cache read error:", err);
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
  
  console.log(`Making Alpha Vantage request: ${params.function}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Log the response structure for debugging
    if (data["Error Message"]) {
      console.error("Alpha Vantage API Error:", data["Error Message"]);
    } else if (data.Note) {
      console.warn("Alpha Vantage Note:", data.Note);
    }
    
    return data;
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
   * TEMPORARY OVERRIDE: Always returns open for testing
   */
  async getMarketStatus(): Promise<{ isOpen: boolean; nextOpen?: string; nextClose?: string }> {
    // TEMPORARY: Force market open for testing
    // console.log("⚠️ MARKET STATUS OVERRIDE: Forcing market OPEN for testing");
    // return {
    //   isOpen: true,
    //   nextOpen: "9:30 AM ET",
    //   nextClose: "4:00 PM ET"
    // };

    //UNCOMMENT THIS BLOCK TO RESTORE REAL MARKET HOURS:
    try {
      const data = await makeRequest({
        function: "MARKET_STATUS",
      });

      if (!data.markets) {
        console.warn("No markets data, using fallback calculation");
        return this.calculateMarketStatusFallback();
      }

      // Find US market status
      const usMarket = data.markets.find((m: any) => m.region === "United States");
      if (usMarket) {
        const isOpen = usMarket.current_status === "open";
        console.log(`Market status: ${isOpen ? 'OPEN' : 'CLOSED'} (${usMarket.current_status})`);
        
        // Convert ET times to Pakistan Time (PKT = UTC+5, ET = UTC-5, difference = 10 hours)
        // 9:30 AM ET + 10 hours = 7:30 PM PKT
        // 4:00 PM ET + 10 hours = 2:00 AM PKT (next day)
        const convertETtoPKT = (etTime: string) => {
          // Parse "09:30" or "16:00" format
          const match = etTime.match(/(\d{1,2}):(\d{2})/);
          if (!match) return etTime + " PKT";
          
          let hours = parseInt(match[1]);
          const minutes = match[2];
          hours += 10; // Add 10 hours for PKT
          
          if (hours >= 24) {
            hours -= 24;
            return `${hours.toString().padStart(2, '0')}:${minutes} PKT (next day)`;
          }
          
          const period = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
          return `${displayHours}:${minutes} ${period} PKT`;
        };
        
        return {
          isOpen,
          nextOpen: convertETtoPKT(usMarket.local_open),
          nextClose: convertETtoPKT(usMarket.local_close),
        };
      }

      console.warn("US market not found, using fallback calculation");
      return this.calculateMarketStatusFallback();
    } catch (error) {
      console.error("Error fetching market status, using fallback:", error);
      return this.calculateMarketStatusFallback();
    }
  },

  /**
   * Fallback market status calculation based on time
   */
  calculateMarketStatusFallback(): { isOpen: boolean; nextOpen?: string; nextClose?: string } {
    const now = new Date();
    const day = now.getUTCDay();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    const isWeekday = day >= 1 && day <= 5;
    // US market: 9:30 AM - 4:00 PM ET = 14:30 - 21:00 UTC (EST) or 13:30 - 20:00 UTC (EDT)
    // Using EST timing (14:30 - 21:00 UTC)
    const marketStartMinutes = 14 * 60 + 30; // 14:30 UTC
    const marketEndMinutes = 21 * 60; // 21:00 UTC
    const currentMinutes = hour * 60 + minute;
    const isDuringMarketHours = currentMinutes >= marketStartMinutes && currentMinutes < marketEndMinutes;
    const isOpen = isWeekday && isDuringMarketHours;
    console.log(`Fallback market status: ${isOpen ? 'OPEN' : 'CLOSED'} (Day: ${day}, UTC Time: ${hour}:${minute})`);
    // Market: 9:30 AM ET = 7:30 PM PKT, 4:00 PM ET = 2:00 AM PKT (next day)
    return { isOpen, nextOpen: "7:30 PM PKT", nextClose: "2:00 AM PKT" };
  },

  /**
   * Get News & Sentiment data
   * Alpha Vantage NEWS_SENTIMENT endpoint
   */
  async getNewsSentiment(params: {
    tickers?: string; // e.g., "AAPL,MSFT"
    topics?: string; // e.g., "technology,earnings"
    time_from?: string; // YYYYMMDDTHHMM format
    time_to?: string;
    sort?: "LATEST" | "EARLIEST" | "RELEVANCE";
    limit?: number; // Max 1000
  }): Promise<any> {
    const cacheKey = `av:news:${JSON.stringify(params)}`;
    
    try {
      // Try cache first but don't fail if Redis is down
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log("[ALPHA VANTAGE] Returning cached news data");
          return cached;
        }
      } catch (cacheError) {
        console.warn("[ALPHA VANTAGE] Redis cache error (continuing without cache):", cacheError);
      }

      console.log("[ALPHA VANTAGE] Fetching news from Alpha Vantage API with params:", params);

      const requestParams: Record<string, string> = {
        function: "NEWS_SENTIMENT",
      };

      if (params.tickers) requestParams.tickers = params.tickers;
      if (params.topics) requestParams.topics = params.topics;
      if (params.time_from) requestParams.time_from = params.time_from;
      if (params.time_to) requestParams.time_to = params.time_to;
      if (params.sort) requestParams.sort = params.sort;
      if (params.limit) requestParams.limit = params.limit.toString();

      const data = await makeRequest(requestParams, cacheKey);

      console.log("[ALPHA VANTAGE] Response received:", {
        hasFeed: !!data.feed,
        feedLength: data.feed?.length || 0,
        hasError: !!data["Error Message"] || !!data.Note,
        errorMessage: data["Error Message"] || data.Note,
      });

      // Check for API errors
      if (data["Error Message"]) {
        console.error("[ALPHA VANTAGE] API Error:", data["Error Message"]);
        return { feed: [], items: 0, sentiment_score_definition: "" };
      }

      if (data.Note) {
        console.warn("[ALPHA VANTAGE] API Note (rate limit?):", data.Note);
        return { feed: [], items: 0, sentiment_score_definition: "" };
      }

      if (data.feed && data.feed.length > 0) {
        // Try to cache but don't fail if Redis is down
        try {
          await redis.setex(cacheKey, 900, data);
          console.log("[ALPHA VANTAGE] Cached", data.feed.length, "articles");
        } catch (cacheError) {
          console.warn("[ALPHA VANTAGE] Failed to cache (continuing anyway):", cacheError);
        }
        return data;
      }

      console.warn("[ALPHA VANTAGE] No feed data in response");
      return { feed: [], items: 0, sentiment_score_definition: "" };
    } catch (error) {
      console.error("[ALPHA VANTAGE] Fatal error fetching news sentiment:", error);
      console.error("[ALPHA VANTAGE] Error stack:", (error as Error).stack);
      return { feed: [], items: 0, sentiment_score_definition: "" };
    }
  },

  /**
   * Get top market gainers/losers
   */
  async getTopGainersLosers(): Promise<any> {
    const cacheKey = "av:top_gainers_losers";
    
    try {
      // Check cache first
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) {
        return cached;
      }

      const data = await makeRequest({
        function: "TOP_GAINERS_LOSERS",
      }, cacheKey);

      if (data) {
        // Cache for 5 minutes
        await redis.setex(cacheKey, 300, data).catch(() => {});
        return data;
      }

      return { top_gainers: [], top_losers: [], most_actively_traded: [] };
    } catch (error) {
      console.error("Error fetching top gainers/losers:", error);
      return { top_gainers: [], top_losers: [], most_actively_traded: [] };
    }
  },
};

