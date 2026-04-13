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

      return c.json(
        portfolio || {
          profile: {
            id: null,
            cashBalance: 0,
            totalValue: 0,
            investedValue: 0,
          },
          holdings: [],
          recentTransactions: [],
          analytics: {
            totalUnrealizedPnL: 0,
            totalUnrealizedPnLPercent: 0,
            totalValue: 0,
            sectorAllocation: {},
            diversification: {
              stockCount: 0,
              sectors: 0,
            },
          },
        }
      );
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

      return c.json(
        performance || {
          snapshots: [],
          startValue: 0,
          currentValue: 0,
          period: days,
        }
      );
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
   * GET /portfolio/analytics
   */
  async getAnalytics(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const analytics = await portfolioService.getPortfolioAnalytics(user.id);
      return c.json(analytics);
    } catch (error: any) {
      console.error("Error fetching portfolio analytics:", error);
      return c.json({ error: "Failed to fetch portfolio analytics" }, 500);
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

  /**
   * POST /portfolio/holdings
   */
  async addHolding(c: Context) {
    try {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const body = await c.req.json();
      const created = await portfolioService.addHoldingForUser(user.id, {
        symbol: body.symbol,
        quantity: Number(body.quantity),
        averagePrice: Number(body.averagePrice),
      });

      return c.json({ success: true, holding: created });
    } catch (error: any) {
      return c.json({ error: error?.message || "Failed to add holding" }, 400);
    }
  },

  /**
   * PATCH /portfolio/holdings/:id
   */
  async updateHolding(c: Context) {
    try {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const id = c.req.param("id");
      const body = await c.req.json();

      const updated = await portfolioService.updateHoldingForUser(user.id, id, {
        quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
        averagePrice: body.averagePrice !== undefined ? Number(body.averagePrice) : undefined,
      });

      return c.json({ success: true, holding: updated });
    } catch (error: any) {
      return c.json({ error: error?.message || "Failed to update holding" }, 400);
    }
  },

  /**
   * DELETE /portfolio/holdings/:id
   */
  async removeHolding(c: Context) {
    try {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const id = c.req.param("id");
      await portfolioService.removeHoldingForUser(user.id, id);
      return c.json({ success: true });
    } catch (error: any) {
      return c.json({ error: error?.message || "Failed to remove holding" }, 400);
    }
  },
};
