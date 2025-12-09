import { marketDataService } from "../../services/marketDataService";
import { prisma } from "../../lib/db";

export const newsService = {
  /**
   * Get general market news
   */
  async getMarketNews(category: string = "general") {
    return await marketDataService.getMarketNews(category);
  },

  /**
   * Get personalized news feed based on user's portfolio holdings
   * Combines market news with news from user's holdings
   */
  async getPersonalizedNewsFeed(userId: string, days: number = 7) {
    try {
      // Get user's simulator profile and holdings
      const profile = await prisma.simulatorProfile.findUnique({
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

      if (!profile) {
        // Return general market news if no profile
        return {
          marketNews: await marketDataService.getMarketNews("general"),
          holdingsNews: [],
          watchlistNews: [],
        };
      }

      // Get unique symbols from holdings and watchlist
      const holdingSymbols = profile.holdings.map((h) => h.asset.symbol);
      const watchlistSymbols = profile.watchlist.map((w) => w.asset.symbol);
      const allSymbols = [...new Set([...holdingSymbols, ...watchlistSymbols])];

      // Date range for news
      const to = new Date().toISOString().split("T")[0];
      const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // Fetch news for all symbols in parallel
      const newsPromises = allSymbols.map(async (symbol) => {
        const news = await marketDataService.getCompanyNews(symbol, from, to);
        return { symbol, news };
      });

      const allNews = await Promise.all(newsPromises);

      // Separate holdings news from watchlist news
      const holdingsNews = allNews
        .filter((n) => holdingSymbols.includes(n.symbol))
        .flatMap((n) =>
          n.news.map((article) => ({
            ...article,
            symbol: n.symbol,
            inHoldings: true,
          }))
        )
        .sort((a, b) => b.datetime - a.datetime);

      const watchlistNews = allNews
        .filter((n) => watchlistSymbols.includes(n.symbol))
        .flatMap((n) =>
          n.news.map((article) => ({
            ...article,
            symbol: n.symbol,
            inWatchlist: true,
          }))
        )
        .sort((a, b) => b.datetime - a.datetime);

      // Get general market news
      const marketNews = await marketDataService.getMarketNews("general");

      return {
        marketNews,
        holdingsNews,
        watchlistNews,
        summary: {
          totalHoldings: holdingSymbols.length,
          totalWatchlist: watchlistSymbols.length,
          newsCount: {
            market: marketNews.length,
            holdings: holdingsNews.length,
            watchlist: watchlistNews.length,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching personalized news:", error);
      throw error;
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
            averagePrice: holding?.averagePrice,
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
