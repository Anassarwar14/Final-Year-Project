import * as finnhub from "finnhub";
import { redis, CACHE_KEYS, CACHE_TTL } from "../lib/redis";

// Initialize Finnhub API client
const api_key = finnhub.ApiClient.instance.authentications["api_key"];
api_key.apiKey = process.env.FINNHUB_API_KEY!;
const finnhubClient = new finnhub.DefaultApi();

// Types for Finnhub responses
export interface Quote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface Candle {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  v: number[]; // Volume
  t: number[]; // Timestamps
  s: string; // Status
}

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export interface SearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface NewsArticle {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface BasicFinancials {
  metric: {
    [key: string]: number;
  };
  series: {
    annual: { [key: string]: Array<{ period: string; v: number }> };
    quarterly: { [key: string]: Array<{ period: string; v: number }> };
  };
}

export interface RecommendationTrend {
  buy: number;
  hold: number;
  period: string;
  sell: number;
  strongBuy: number;
  strongSell: number;
  symbol: string;
}

export interface EarningsCalendar {
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour: string;
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number | null;
  symbol: string;
  year: number;
}

export interface FinancialsAsReported {
  data: Array<{
    accessNumber: string;
    symbol: string;
    cik: string;
    year: number;
    quarter: number;
    form: string;
    startDate: string;
    endDate: string;
    filedDate: string;
    acceptedDate: string;
    report: {
      [key: string]: any;
    };
  }>;
}

export interface SECFiling {
  accessNumber: string;
  symbol: string;
  cik: string;
  form: string;
  filedDate: string;
  acceptedDate: string;
  reportUrl: string;
  filingUrl: string;
}

// In-memory rate limiting for fallback
let rateLimitCount = 0;
let rateLimitResetTime = Date.now() + 60000;

// Rate limiting helper
async function checkRateLimit(): Promise<boolean> {
  try {
    const key = CACHE_KEYS.RATE_LIMIT();
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, CACHE_TTL.RATE_LIMIT);
    }
    
    // Allow 50 requests per minute (leaving buffer for 60 limit)
    return count <= 50;
  } catch (error) {
    // Fallback to in-memory rate limiting if Redis fails
    const now = Date.now();
    if (now > rateLimitResetTime) {
      rateLimitCount = 0;
      rateLimitResetTime = now + 60000;
    }
    
    rateLimitCount++;
    return rateLimitCount <= 50;
  }
}

// Market Data Service
export const marketDataService = {
  /**
   * Get real-time quote for a symbol
   */
  async getRealtimeQuote(symbol: string): Promise<Quote | null> {
    try {
      const cacheKey = CACHE_KEYS.QUOTE(symbol);
      
      // Try cache first
      try {
        const cached = await redis.get<Quote>(cacheKey);
        if (cached) return cached;
      } catch (error) {
        // Silently fail cache read, continue to API
      }
      
      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached, returning cached data");
        return null;
      }
      
      // Fetch from Finnhub
      const quote = await new Promise<Quote>((resolve, reject) => {
        finnhubClient.quote(symbol, (error: any, data: any) => {
          if (error) reject(error);
          else resolve(data as Quote);
        });
      });
      
      // Cache the result
      try {
        await redis.setex(cacheKey, CACHE_TTL.QUOTE, quote);
      } catch (error) {
        // Silently fail cache write
      }
      
      return quote;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  },

  /**
   * Get batch quotes for multiple symbols (more efficient)
   */
  async getBatchQuotes(symbols: string[]): Promise<Map<string, Quote>> {
    const quotes = new Map<string, Quote>();
    
    // Fetch in parallel with rate limiting consideration
    const results = await Promise.allSettled(
      symbols.map((symbol) => this.getRealtimeQuote(symbol))
    );
    
    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        quotes.set(symbols[index], result.value);
      }
    });
    
    return quotes;
  },

  /**
   * Get historical candle data
   */
  async getCandles(
    symbol: string,
    resolution: "1" | "5" | "15" | "30" | "60" | "D" | "W" | "M",
    from: number,
    to: number
  ): Promise<Candle | null> {
    try {
      const cacheKey = CACHE_KEYS.CANDLES(symbol, resolution);
      
      // Try cache first
      const cached = await redis.get<Candle>(cacheKey);
      if (cached) return cached;
      
      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached for candles");
        return null;
      }
      
      // Fetch from Finnhub
      const candles = await new Promise<Candle>((resolve, reject) => {
        finnhubClient.stockCandles(
          symbol,
          resolution,
          from,
          to,
          (error: any, data: any) => {
            if (error) reject(error);
            else resolve(data as Candle);
          }
        );
      });
      
      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL.CANDLES, candles);
      
      return candles;
    } catch (error) {
      console.error(`Error fetching candles for ${symbol}:`, error);
      return null;
    }
  },

  /**
   * Search for symbols
   */
  async searchSymbols(query: string): Promise<SearchResult[]> {
    try {
      const cacheKey = CACHE_KEYS.SEARCH(query);
      
      // Try cache first
      const cached = await redis.get<SearchResult[]>(cacheKey);
      if (cached) return cached;
      
      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached for search");
        return [];
      }
      
      // Fetch from Finnhub
      const results = await new Promise<{ result: SearchResult[] }>(
        (resolve, reject) => {
          finnhubClient.symbolSearch(query, (error: any, data: any) => {
            if (error) reject(error);
            else resolve(data);
          });
        }
      );
      
      // Cache the result
      await redis.setex(cacheKey, CACHE_TTL.SEARCH, results.result);
      
      return results.result;
    } catch (error) {
      console.error(`Error searching symbols for ${query}:`, error);
      return [];
    }
  },

  /**
   * Get company profile
   */
  async getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
    try {
      const cacheKey = CACHE_KEYS.PROFILE(symbol);
      
      // Try cache first
      try {
        const cached = await redis.get<CompanyProfile>(cacheKey);
        if (cached) return cached;
      } catch (error) {
        // Silently fail cache read
      }
      
      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached for profile");
        return null;
      }
      
      // Fetch from Finnhub
      const profile = await new Promise<CompanyProfile>((resolve, reject) => {
        finnhubClient.companyProfile2({ symbol }, (error: any, data: any) => {
          if (error) reject(error);
          else resolve(data as CompanyProfile);
        });
      });
      
      // Cache the result (24 hours for profiles)
      try {
        await redis.setex(cacheKey, CACHE_TTL.PROFILE, profile);
      } catch (error) {
        // Silently fail cache write
      }
      
      return profile;
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error);
      return null;
    }
  },

  /**
   * Get company news (FREE - High Usage)
   * @param symbol Stock symbol
   * @param from Start date (YYYY-MM-DD)
   * @param to End date (YYYY-MM-DD)
   */
  async getCompanyNews(
    symbol: string,
    from: string,
    to: string
  ): Promise<NewsArticle[]> {
    try {
      const cacheKey = `${CACHE_KEYS.PROFILE(symbol)}:news:${from}:${to}`;

      // Try cache first
      try {
        const cached = await redis.get<NewsArticle[]>(cacheKey);
        if (cached) return cached;
      } catch (error) {
        // Silently fail cache read
      }

      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached for company news");
        return [];
      }

      // Fetch from Finnhub
      const news = await new Promise<NewsArticle[]>((resolve, reject) => {
        finnhubClient.companyNews(symbol, from, to, (error: any, data: any) => {
          if (error) reject(error);
          else resolve(data as NewsArticle[]);
        });
      });

      // Cache for 1 hour
      try {
        await redis.setex(cacheKey, 3600, news);
      } catch (error) {
        // Silently fail cache write
      }

      return news;
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error);
      return [];
    }
  },

  /**
   * Get market news (FREE)
   * @param category News category (general, forex, crypto, merger)
   */
  async getMarketNews(category: string = "general"): Promise<NewsArticle[]> {
    try {
      const cacheKey = `${CACHE_KEYS.PROFILE("market")}:news:${category}`;

      // Try cache first
      try {
        const cached = await redis.get<NewsArticle[]>(cacheKey);
        if (cached) return cached;
      } catch (error) {
        // Silently fail cache read
      }

      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached for market news");
        return [];
      }

      // Fetch from Finnhub
      const news = await new Promise<NewsArticle[]>((resolve, reject) => {
        finnhubClient.marketNews(category, (error: any, data: any) => {
          if (error) reject(error);
          else resolve(data as NewsArticle[]);
        });
      });

      // Cache for 15 minutes
      try {
        await redis.setex(cacheKey, 900, news);
      } catch (error) {
        // Silently fail cache write
      }

      return news;
    } catch (error) {
      console.error(`Error fetching market news:`, error);
      return [];
    }
  },

  /**
   * Get basic financials (FREE - High Usage)
   * Includes metrics like PE ratio, market cap, revenue, etc.
   */
  async getBasicFinancials(symbol: string): Promise<BasicFinancials | null> {
    try {
      const cacheKey = `${CACHE_KEYS.PROFILE(symbol)}:financials`;

      // Try cache first
      try {
        const cached = await redis.get<BasicFinancials>(cacheKey);
        if (cached) return cached;
      } catch (error) {
        // Silently fail cache read
      }

      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached for financials");
        return null;
      }

      // Fetch from Finnhub
      const financials = await new Promise<BasicFinancials>((resolve, reject) => {
        finnhubClient.companyBasicFinancials(
          symbol,
          "all",
          (error: any, data: any) => {
            if (error) reject(error);
            else resolve(data as BasicFinancials);
          }
        );
      });

      // Cache for 24 hours
      try {
        await redis.setex(cacheKey, CACHE_TTL.PROFILE, financials);
      } catch (error) {
        // Silently fail cache write
      }

      return financials;
    } catch (error) {
      console.error(`Error fetching financials for ${symbol}:`, error);
      return null;
    }
  },

  /**
   * Get recommendation trends (FREE)
   * Analyst buy/sell/hold recommendations
   */
  async getRecommendationTrends(
    symbol: string
  ): Promise<RecommendationTrend[]> {
    try {
      const cacheKey = `${CACHE_KEYS.PROFILE(symbol)}:recommendations`;

      // Try cache first
      try {
        const cached = await redis.get<RecommendationTrend[]>(cacheKey);
        if (cached) return cached;
      } catch (error) {
        // Silently fail cache read
      }

      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached for recommendations");
        return [];
      }

      // Fetch from Finnhub
      const recommendations = await new Promise<RecommendationTrend[]>(
        (resolve, reject) => {
          finnhubClient.recommendationTrends(
            symbol,
            (error: any, data: any) => {
              if (error) reject(error);
              else resolve(data as RecommendationTrend[]);
            }
          );
        }
      );

      // Cache for 24 hours
      try {
        await redis.setex(cacheKey, CACHE_TTL.PROFILE, recommendations);
      } catch (error) {
        // Silently fail cache write
      }

      return recommendations;
    } catch (error) {
      console.error(`Error fetching recommendations for ${symbol}:`, error);
      return [];
    }
  },

  /**
   * Get SEC filings (FREE)
   * @param symbol Stock symbol
   * @param from Start date (YYYY-MM-DD)
   * @param to End date (YYYY-MM-DD)
   */
  async getSECFilings(
    symbol: string,
    from?: string,
    to?: string
  ): Promise<SECFiling[]> {
    try {
      const cacheKey = `${CACHE_KEYS.PROFILE(symbol)}:sec:${from}:${to}`;

      // Try cache first
      try {
        const cached = await redis.get<SECFiling[]>(cacheKey);
        if (cached) return cached;
      } catch (error) {
        // Silently fail cache read
      }

      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached for SEC filings");
        return [];
      }

      // Fetch directly from Finnhub API
      const params = new URLSearchParams({ 
        symbol,
        token: process.env.FINNHUB_API_KEY || 'demo'
      });
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const response = await fetch(`https://finnhub.io/api/v1/stock/filings?${params}`);
      
      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('SEC Filings raw response:', { symbol, from, to, dataLength: data?.length, firstItem: data?.[0] });

      const filings = Array.isArray(data) ? data : [];

      // Only cache if we have valid data
      if (filings.length > 0) {
        try {
          await redis.setex(cacheKey, CACHE_TTL.PROFILE, filings);
        } catch (error) {
          // Silently fail cache write
        }
      }

      return filings;
    } catch (error) {
      console.error(`Error fetching SEC filings for ${symbol}:`, error);
      return [];
    }
  },

  /**
   * Get earnings calendar (FREE)
   * @param from Start date (YYYY-MM-DD)
   * @param to End date (YYYY-MM-DD)
   * @param symbol Optional: filter by symbol
   */
  async getEarningsCalendar(
    from?: string,
    to?: string,
    symbol?: string
  ): Promise<{ earningsCalendar: EarningsCalendar[] }> {
    try {
      const cacheKey = `earnings:calendar:${from}:${to}:${symbol || "all"}`;

      // Try cache first
      try {
        const cached = await redis.get<{ earningsCalendar: EarningsCalendar[] }>(
          cacheKey
        );
        if (cached) return cached;
      } catch (error) {
        // Silently fail cache read
      }

      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached for earnings calendar");
        return { earningsCalendar: [] };
      }

      // Fetch from Finnhub
      const calendar = await new Promise<{ earningsCalendar: EarningsCalendar[] }>(
        (resolve, reject) => {
          finnhubClient.earningsCalendar(
            { from, to, symbol },
            (error: any, data: any) => {
              if (error) reject(error);
              else resolve(data);
            }
          );
        }
      );

      // Only cache if we got data
      if (calendar.earningsCalendar && calendar.earningsCalendar.length > 0) {
        try {
          await redis.setex(cacheKey, 3600, calendar);
        } catch (error) {
          // Silently fail cache write
        }
      }

      return calendar;
    } catch (error) {
      console.error(`Error fetching earnings calendar:`, error);
      return { earningsCalendar: [] };
    }
  },

  /**
   * Get company peers (FREE)
   * Returns list of similar companies
   */
  async getPeers(symbol: string): Promise<string[]> {
    try {
      const cacheKey = `${CACHE_KEYS.PROFILE(symbol)}:peers`;

      // Try cache first
      try {
        const cached = await redis.get<string[]>(cacheKey);
        if (cached) return cached;
      } catch (error) {
        // Silently fail cache read
      }

      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached for peers");
        return [];
      }

      // Fetch from Finnhub
      const peers = await new Promise<string[]>((resolve, reject) => {
        finnhubClient.peers(symbol, (error: any, data: any) => {
          if (error) reject(error);
          else resolve(data as string[]);
        });
      });

      // Cache for 7 days (peers don't change often)
      try {
        await redis.setex(cacheKey, 604800, peers);
      } catch (error) {
        // Silently fail cache write
      }

      return peers;
    } catch (error) {
      console.error(`Error fetching peers for ${symbol}:`, error);
      return [];
    }
  },

  /**
   * Get financials as reported (FREE)
   * Raw financial data from SEC filings (10-K, 10-Q)
   * Free tier: 1 month of historical data
   */
  async getFinancialsAsReported(
    symbol: string,
    freq?: 'annual' | 'quarterly'
  ): Promise<FinancialsAsReported | null> {
    try {
      const cacheKey = `${CACHE_KEYS.PROFILE(symbol)}:financials-reported:${freq || 'all'}`;

      // Try cache first
      try {
        const cached = await redis.get<FinancialsAsReported>(cacheKey);
        if (cached) return cached;
      } catch (error) {
        // Silently fail cache read
      }

      // Check rate limit
      if (!(await checkRateLimit())) {
        console.warn("Rate limit reached for financials as reported");
        return null;
      }

      // Fetch from Finnhub - API uses financialsReported method with optional freq parameter
      const financials = await new Promise<FinancialsAsReported>((resolve, reject) => {
        const params: any = { symbol };
        if (freq) params.freq = freq;
        
        finnhubClient.financialsReported(
          params,
          (error: any, data: any) => {
            console.log('Financials as reported raw response:', { symbol, freq, error, dataKeys: data ? Object.keys(data) : null, dataLength: data?.data?.length });
            if (error) reject(error);
            else resolve(data as FinancialsAsReported);
          }
        );
      });

      // Cache for 24 hours
      try {
        await redis.setex(cacheKey, CACHE_TTL.PROFILE, financials);
      } catch (error) {
        // Silently fail cache write
      }

      return financials;
    } catch (error) {
      console.error(`Error fetching financials as reported for ${symbol}:`, error);
      return null;
    }
  },
};
