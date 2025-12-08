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
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const days = parseInt(c.req.query("days") || "7");
      const feed = await newsService.getPersonalizedNewsFeed(user.id, days);
      return c.json(feed);
    } catch (error: any) {
      console.error("Error fetching personalized news:", error);
      return c.json({ error: "Failed to fetch personalized news" }, 500);
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
