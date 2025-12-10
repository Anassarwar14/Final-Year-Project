import { Context } from "hono";
import { newsService } from "./service";

export const newsController = {
  /**
   * GET /news/market?category=general
   */
  async getMarketNews(c: Context) {
    try {
      const category = c.req.query("category") || "general";
      const news = await newsService.getMarketNews(category);
      return c.json({ news });
    } catch (error: any) {
      console.error("Error fetching market news:", error);
      return c.json({ error: "Failed to fetch market news" }, 500);
    }
  },

  /**
   * GET /news/personalized?days=7
   */
  async getPersonalizedNews(c: Context) {
    try {
      const user = c.get("user");
      
      // If no user, return general market news for unauthenticated access
      if (!user) {
        console.log('[NEWS CONTROLLER] No user authentication, returning general market news');
        const marketNews = await newsService.getMarketNews("general");
        return c.json({
          marketNews: marketNews.slice(0, 50),
          holdingsNews: [],
          watchlistNews: [],
          summary: {
            totalHoldings: 0,
            totalWatchlist: 0,
            newsCount: {
              market: marketNews.length,
              holdings: 0,
              watchlist: 0,
            },
          },
        });
      }

      console.log(`[NEWS CONTROLLER] Fetching personalized news for user: ${user.id}`);
      const days = parseInt(c.req.query("days") || "7");
      const feed = await newsService.getPersonalizedNewsFeed(user.id, days);
      
      console.log(`[NEWS CONTROLLER] Returning feed with ${feed.marketNews?.length || 0} market news, ${feed.holdingsNews?.length || 0} holdings news`);
      
      return c.json(feed);
    } catch (error: any) {
      console.error("[NEWS CONTROLLER] Error fetching personalized news:", error);
      console.error("[NEWS CONTROLLER] Error stack:", error.stack);
      
      // Return empty feed structure instead of error to prevent UI breaking
      return c.json({
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
      });
    }
  },

  /**
   * GET /news/trending?limit=10
   */
  async getTrendingStocks(c: Context) {
    try {
      const limit = parseInt(c.req.query("limit") || "10");
      const trending = await newsService.getTrendingStocks(limit);
      return c.json({ trending });
    } catch (error: any) {
      console.error("Error fetching trending stocks:", error);
      return c.json({ error: "Failed to fetch trending stocks" }, 500);
    }
  },

  /**
   * GET /news/earnings?days=30
   */
  async getUpcomingEarnings(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const days = parseInt(c.req.query("days") || "30");
      const earnings = await newsService.getUpcomingEarnings(user.id, days);
      return c.json({ earnings });
    } catch (error: any) {
      console.error("Error fetching earnings:", error);
      return c.json({ error: "Failed to fetch earnings" }, 500);
    }
  },
};
