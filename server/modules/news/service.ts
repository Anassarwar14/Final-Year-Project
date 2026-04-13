import { marketDataService } from "../../services/marketDataService";
import { alphaVantageService } from "../../services/alphaVantageService";
import { prisma } from "../../lib/db";

function toAlphaTimestamp(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}

function normalizeFinnhubNews(articles: any[], relatedTicker?: string) {
  return (articles || []).map((item: any) => ({
    title: item.headline || "Untitled Article",
    url: item.url,
    time_published: toAlphaTimestamp(item.datetime || Math.floor(Date.now() / 1000)),
    authors: [],
    summary: item.summary || "",
    source: item.source || "Unknown",
    banner_image: item.image || "",
    category_within_source: item.category || "general",
    overall_sentiment_score: 0,
    overall_sentiment_label: "Neutral",
    topics: [],
    ticker_sentiment: relatedTicker
      ? [
          {
            ticker: relatedTicker,
            relevance_score: "0.5",
            ticker_sentiment_score: "0",
            ticker_sentiment_label: "Neutral",
          },
        ]
      : [],
  }));
}

function buildSyntheticMarketNews(): any[] {
  const symbols = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META"];
  const now = Math.floor(Date.now() / 1000);
  return symbols.map((symbol, idx) => ({
    title: `${symbol} market update: intraday volatility in focus`,
    url: `https://finance.yahoo.com/quote/${symbol}`,
    time_published: toAlphaTimestamp(now - idx * 900),
    authors: ["Market Desk"],
    summary: `Live market data providers are temporarily rate-limited. Open this symbol page for the latest quote, chart, and headlines while the feed refreshes.`,
    source: "Wealth Fallback Feed",
    banner_image: "",
    category_within_source: "general",
    overall_sentiment_score: 0,
    overall_sentiment_label: "Neutral",
    topics: [],
    ticker_sentiment: [
      {
        ticker: symbol,
        relevance_score: "0.6",
        ticker_sentiment_score: "0",
        ticker_sentiment_label: "Neutral",
      },
    ],
  }));
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export const newsService = {
  /**
   * Get general market news using Alpha Vantage News & Sentiment
   */
  async getMarketNews(category: string = "general") {
    try {
      console.log(`Fetching market news for category: ${category}`);
      const now = new Date();
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const fmt = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;
      const time_from = fmt(from);
      
      // Fetch general financial news without topic filter for better reliability
      const newsData = await alphaVantageService.getNewsSentiment({
        sort: "LATEST",
        limit: 50,
        time_from,
      });

      console.log(`Alpha Vantage returned ${newsData.feed?.length || 0} articles`);
      
      if (newsData.feed && newsData.feed.length > 0) {
        return newsData.feed;
      }
      
      // If no articles, try Finnhub fallback
      console.log("No articles from Alpha Vantage, trying Finnhub fallback");
      const finnhubNews = await withTimeout(
        marketDataService.getMarketNews(category),
        2000,
        "Finnhub market news"
      ).catch(() => []);
      if (finnhubNews.length > 0) {
        return normalizeFinnhubNews(finnhubNews);
      }

      // Final fallback: aggregate company news from liquid symbols.
      const fallbackSymbols = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL"];
      const todayIso = new Date().toISOString().split("T")[0];
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const perSymbol = await Promise.allSettled(
        fallbackSymbols.map((symbol) =>
          withTimeout(
            marketDataService.getCompanyNews(symbol, oneWeekAgo, todayIso),
            2000,
            `Finnhub company news ${symbol}`
          ).catch(() => [])
        )
      );
      const flattened = perSymbol
        .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
        .flatMap((r) => r.value)
        .slice(0, 50);

      const normalized = normalizeFinnhubNews(flattened);
      return normalized.length > 0 ? normalized : buildSyntheticMarketNews();
    } catch (error) {
      console.error("Error fetching Alpha Vantage news:", error);
      // Fallback to Finnhub
      try {
        const finnhubNews = await withTimeout(
          marketDataService.getMarketNews(category),
          2000,
          "Finnhub market news fallback"
        ).catch(() => []);
        const normalized = normalizeFinnhubNews(finnhubNews);
        return normalized.length > 0 ? normalized : buildSyntheticMarketNews();
      } catch (fallbackError) {
        console.error("Finnhub fallback also failed:", fallbackError);
        return buildSyntheticMarketNews();
      }
    }
  },

  /**
   * Get personalized news feed based on user's portfolio holdings
   * Prioritizes news from holdings, then watchlist, then general market
   */
  async getPersonalizedNewsFeed(userId: string, days: number = 7) {
    try {
      console.log(`[NEWS SERVICE] Starting getPersonalizedNewsFeed for user: ${userId}`);
      // Compute time window for Alpha Vantage NEWS_SENTIMENT
      const now = new Date();
      const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const fmt = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;
      const time_from = fmt(from);
      
      // Always fetch general market news first as a baseline
      console.log('[NEWS SERVICE] Fetching general market news...');
      let marketNews: any[] = [];
      try {
        marketNews = await this.getMarketNews("general");
        console.log(`[NEWS SERVICE] Got ${marketNews.length} market news articles`);
      } catch (error) {
        console.error('[NEWS SERVICE] Failed to fetch market news:', error);
        marketNews = [];
      }
      
      // Get user's simulator profile and holdings
      let profile;
      try {
        profile = await prisma.simulatorProfile.findUnique({
          where: { userId },
          include: {
            holdings: {
              include: {
                asset: true,
              },
            },
            watchlist: {
              include: {
                asset: true,
              },
            },
          },
        });
        console.log(`[NEWS SERVICE] Profile found: ${!!profile}, Holdings: ${profile?.holdings.length || 0}`);
      } catch (error) {
        console.error('[NEWS SERVICE] Failed to fetch profile:', error);
        profile = null;
      }

      if (!profile) {
        // Return general market news if no profile
        const limitedMarketNews = marketNews.slice(0, 50);
        console.log(`[NEWS SERVICE] No profile, returning ${limitedMarketNews.length} market news`);
        return {
          marketNews: limitedMarketNews,
          holdingsNews: [],
          watchlistNews: [],
          summary: {
            totalHoldings: 0,
            totalWatchlist: 0,
            newsCount: {
              market: limitedMarketNews.length,
              holdings: 0,
              watchlist: 0,
            },
          },
        };
      }

      // Get unique symbols from holdings and watchlist
      const holdingSymbols = profile.holdings.map((h) => h.asset.symbol);
      const watchlistSymbols = profile.watchlist.map((w) => w.asset.symbol);
      console.log(`[NEWS SERVICE] Holdings symbols: ${holdingSymbols.join(', ')}`);

      // Fetch news using Alpha Vantage for holdings (prioritized)
      let holdingsNews: any[] = [];
      if (holdingSymbols.length > 0) {
        try {
          console.log('[NEWS SERVICE] Fetching holdings news...');
          const holdingsNewsData = await alphaVantageService.getNewsSentiment({
            tickers: holdingSymbols.join(","),
            sort: "LATEST",
            limit: 50,
            time_from,
          });
          
          holdingsNews = (holdingsNewsData.feed || []).map((article: any) => ({
            ...article,
            inHoldings: true,
            relevantTickers: article.ticker_sentiment?.filter((ts: any) => 
              holdingSymbols.includes(ts.ticker)
            ),
          }));
          console.log(`[NEWS SERVICE] Got ${holdingsNews.length} holdings news`);

          if (holdingsNews.length === 0) {
            const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
            const toDate = new Date().toISOString().split("T")[0];
            const fallback = await Promise.allSettled(
              holdingSymbols.slice(0, 5).map((symbol) =>
                withTimeout(
                  marketDataService.getCompanyNews(symbol, fromDate, toDate),
                  2000,
                  `Holdings company news ${symbol}`
                ).catch(() => [])
              )
            );
            holdingsNews = fallback
              .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
              .flatMap((r) => r.value)
              .slice(0, 50)
              .map((article: any) => ({
                ...normalizeFinnhubNews([article])[0],
                inHoldings: true,
                relevantTickers: [],
              }));
          }
        } catch (error) {
          console.error('[NEWS SERVICE] Failed to fetch holdings news:', error);
        }
      }

      // Fetch news for watchlist
      let watchlistNews: any[] = [];
      if (watchlistSymbols.length > 0) {
        try {
          console.log('[NEWS SERVICE] Fetching watchlist news...');
          const watchlistNewsData = await alphaVantageService.getNewsSentiment({
            tickers: watchlistSymbols.join(","),
            sort: "LATEST",
            limit: 30,
            time_from,
          });
          
          watchlistNews = (watchlistNewsData.feed || []).map((article: any) => ({
            ...article,
            inWatchlist: true,
            relevantTickers: article.ticker_sentiment?.filter((ts: any) => 
              watchlistSymbols.includes(ts.ticker)
            ),
          }));
          console.log(`[NEWS SERVICE] Got ${watchlistNews.length} watchlist news`);

          if (watchlistNews.length === 0) {
            const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
            const toDate = new Date().toISOString().split("T")[0];
            const fallback = await Promise.allSettled(
              watchlistSymbols.slice(0, 5).map((symbol) =>
                withTimeout(
                  marketDataService.getCompanyNews(symbol, fromDate, toDate),
                  2000,
                  `Watchlist company news ${symbol}`
                ).catch(() => [])
              )
            );
            watchlistNews = fallback
              .filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled")
              .flatMap((r) => r.value)
              .slice(0, 30)
              .map((article: any) => ({
                ...normalizeFinnhubNews([article])[0],
                inWatchlist: true,
                relevantTickers: [],
              }));
          }
        } catch (error) {
          console.error('[NEWS SERVICE] Failed to fetch watchlist news:', error);
        }
      }

      const limitedMarketNews = marketNews.slice(0, 50);
      
      const result = {
        marketNews: limitedMarketNews,
        holdingsNews,
        watchlistNews,
        summary: {
          totalHoldings: holdingSymbols.length,
          totalWatchlist: watchlistSymbols.length,
          newsCount: {
            market: limitedMarketNews.length,
            holdings: holdingsNews.length,
            watchlist: watchlistNews.length,
          },
        },
      };
      
      console.log(`[NEWS SERVICE] Returning complete feed:`, result.summary.newsCount);
      return result;
    } catch (error) {
      console.error("[NEWS SERVICE] Critical error in getPersonalizedNewsFeed:", error);
      console.error("[NEWS SERVICE] Error stack:", (error as Error).stack);
      
      // Return empty but valid structure
      return {
        marketNews: [],
        holdingsNews: [],
        watchlistNews: [],
        summary: {
          totalHoldings: 0,
          totalWatchlist: 0,
          newsCount: {
            market: 0,
            holdings: 0,
            watchlist: 0,
          },
        },
      };
    }
  },

  /**
   * Get trending stocks based on news volume and sentiment
   */
  async getTrendingStocks(limit: number = 10) {
    try {
      // Get market news and extract mentioned symbols
      const marketNews = await marketDataService.getMarketNews("general");
      
      // Count symbol mentions in news
      const symbolMentions = new Map<string, number>();
      
      for (const article of marketNews) {
        if (article.related) {
          const symbols = article.related.split(",").map((s) => s.trim());
          symbols.forEach((symbol) => {
            symbolMentions.set(symbol, (symbolMentions.get(symbol) || 0) + 1);
          });
        }
      }

      // Sort by mention count and get top stocks
      const trending = Array.from(symbolMentions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([symbol, mentions]) => ({ symbol, mentions }));

      // Enrich with quote data
      const enrichedTrending = await Promise.all(
        trending.map(async (item) => {
          const quote = await marketDataService.getRealtimeQuote(item.symbol);
          return {
            ...item,
            quote,
          };
        })
      );

      return enrichedTrending;
    } catch (error) {
      console.error("Error fetching trending stocks:", error);
      return [];
    }
  },

  /**
   * Get earnings calendar for user's holdings
   */
  async getUpcomingEarnings(userId: string, days: number = 30) {
    try {
      const profile = await prisma.simulatorProfile.findUnique({
        where: { userId },
        include: {
          holdings: {
            include: {
              asset: true,
            },
          },
        },
      });

      if (!profile || profile.holdings.length === 0) {
        return [];
      }

      const from = new Date().toISOString().split("T")[0];
      const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // Get earnings calendar
      const calendar = await marketDataService.getEarningsCalendar(from, to);

      // Filter for user's holdings
      const holdingSymbols = profile.holdings.map((h) => h.asset.symbol);
      const userEarnings = calendar.earningsCalendar.filter((e) =>
        holdingSymbols.includes(e.symbol)
      );

      // Enrich with holding data
      const enriched = userEarnings.map((earning) => {
        const holding = profile.holdings.find(
          (h) => h.asset.symbol === earning.symbol
        );
        return {
          ...earning,
          holding: {
            quantity: holding?.quantity,
            averageBuyPrice: holding?.averageBuyPrice,
          },
        };
      });

      return enriched;
    } catch (error) {
      console.error("Error fetching earnings:", error);
      return [];
    }
  },
};
