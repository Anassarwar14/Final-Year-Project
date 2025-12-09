import { Context } from "hono";
import { portfolioService } from "./service";

export const portfolioController = {
  /**
   * GET /portfolio/overview
   */
  async getOverview(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const portfolio = await portfolioService.getEnhancedPortfolio(user.id);

      if (!portfolio) {
        return c.json({ error: "Portfolio not found" }, 404);
      }

      return c.json(portfolio);
    } catch (error: any) {
      console.error("Error fetching portfolio:", error);
      return c.json({ error: "Failed to fetch portfolio" }, 500);
    }
  },

  /**
   * GET /portfolio/performance?days=30
   */
  async getPerformance(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const days = parseInt(c.req.query("days") || "30");
      const performance = await portfolioService.getPortfolioPerformance(
        user.id,
        days
      );

      if (!performance) {
        return c.json({ error: "Portfolio not found" }, 404);
      }

      return c.json(performance);
    } catch (error: any) {
      console.error("Error fetching performance:", error);
      return c.json({ error: "Failed to fetch performance" }, 500);
    }
  },

  /**
   * GET /portfolio/insights
   */
  async getInsights(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const insights = await portfolioService.getPortfolioInsights(user.id);
      return c.json(insights);
    } catch (error: any) {
      console.error("Error fetching insights:", error);
      return c.json({ error: "Failed to fetch insights" }, 500);
    }
  },

  /**
   * GET /portfolio/news?days=7
   */
  async getNews(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const days = parseInt(c.req.query("days") || "7");
      const news = await portfolioService.getPortfolioNews(user.id, days);
      return c.json({ news });
    } catch (error: any) {
      console.error("Error fetching portfolio news:", error);
      return c.json({ error: "Failed to fetch portfolio news" }, 500);
    }
  },
};
