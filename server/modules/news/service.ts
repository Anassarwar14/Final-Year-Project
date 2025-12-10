import { marketDataService } from "../../services/marketDataService";
import { alphaVantageService } from "../../services/alphaVantageService";
import { prisma } from "../../lib/db";

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
      return await marketDataService.getMarketNews(category);
    } catch (error) {
      console.error("Error fetching Alpha Vantage news:", error);
      // Fallback to Finnhub
      try {
        return await marketDataService.getMarketNews(category);
      } catch (fallbackError) {
        console.error("Finnhub fallback also failed:", fallbackError);
        return [];
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
