import { Context } from "hono";
import { tradingService } from "./service";
import { alphaVantageService } from "../../services/alphaVantageService";
import {
  executeTradeSchema,
  getHistorySchema,
  createSnapshotSchema,
  addToWatchlistSchema,
  updateWatchlistSchema,
} from "./validation";

export const tradingController = {
  /**
   * POST /api/trading/simulator/initialize
   */
  async initializeProfile(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const profile = await tradingService.initializeProfile(user.id);

      return c.json(
        {
          message: "Simulator profile initialized",
          profile: {
            ...profile,
            virtualBalance: profile.virtualBalance.toNumber(),
          },
        },
        201
      );
    } catch (error: any) {
      console.error("Error initializing profile:", error);
      return c.json({ error: error.message || "Failed to initialize profile" }, 500);
    }
  },

  /**
   * GET /api/trading/simulator/profile
   */
  async getProfile(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const profile = await tradingService.getProfile(user.id);

      return c.json({ profile });
    } catch (error: any) {
      console.error("Error getting profile:", error);
      
      if (error.message === "Simulator profile not found") {
        return c.json({ profile: null }, 200);
      }
      
      return c.json({ error: error.message || "Failed to get profile" }, 500);
    }
  },

  /**
   * POST /api/trading/simulator/reset
   */
  async resetProfile(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const profile = await tradingService.resetProfile(user.id);

      return c.json(
        {
          message: "Portfolio reset successfully",
          profile: {
            ...profile,
            virtualBalance: profile.virtualBalance.toNumber(),
          },
        },
        200
      );
    } catch (error: any) {
      console.error("Error resetting profile:", error);
      return c.json({ error: error.message || "Failed to reset profile" }, 500);
    }
  },

  /**
   * POST /api/trading/simulator/trade
   */
  async executeTrade(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const validatedData = executeTradeSchema.parse(body);

      // Get market status to validate trade execution
      const marketStatus = await alphaVantageService.getMarketStatus();

      const transaction = await tradingService.executeTrade(
        user.id,
        validatedData.assetId,
        validatedData.type,
        typeof validatedData.quantity === "string"
          ? parseFloat(validatedData.quantity)
          : validatedData.quantity,
        typeof validatedData.pricePerUnit === "string"
          ? parseFloat(validatedData.pricePerUnit)
          : validatedData.pricePerUnit,
        marketStatus.isOpen
      );

      return c.json(
        {
          message: `${validatedData.type} order executed successfully`,
          transaction: {
            ...transaction,
            quantity: transaction.quantity.toNumber(),
            pricePerUnit: transaction.pricePerUnit.toNumber(),
          },
        },
        201
      );
    } catch (error: any) {
      console.error("Error executing trade:", error);
      
      if (error.message.includes("Insufficient")) {
        return c.json({ error: error.message }, 400);
      }
      
      return c.json({ error: error.message || "Failed to execute trade" }, 500);
    }
  },

  /**
   * GET /api/trading/simulator/holdings
   */
  async getHoldings(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const holdings = await tradingService.getHoldings(user.id);

      return c.json({ holdings });
    } catch (error: any) {
      console.error("Error getting holdings:", error);
      return c.json({ error: error.message || "Failed to get holdings" }, 500);
    }
  },

  /**
   * GET /api/trading/simulator/history
   */
  async getHistory(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const query = c.req.query();
      const validatedQuery = getHistorySchema.parse(query);

      const filters: any = {
        limit: validatedQuery.limit,
      };

      if (validatedQuery.assetId) filters.assetId = validatedQuery.assetId;
      if (validatedQuery.type) filters.type = validatedQuery.type;
      if (validatedQuery.from) filters.from = new Date(validatedQuery.from);
      if (validatedQuery.to) filters.to = new Date(validatedQuery.to);
      if (validatedQuery.cursor) filters.cursor = validatedQuery.cursor;

      const history = await tradingService.getTransactionHistory(user.id, filters);

      return c.json(history);
    } catch (error: any) {
      console.error("Error getting history:", error);
      return c.json({ error: error.message || "Failed to get history" }, 500);
    }
  },

  /**
   * POST /api/trading/simulator/snapshot
   */
  async createSnapshot(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const validatedData = createSnapshotSchema.parse(body);

      const snapshot = await tradingService.createSnapshot(
        user.id,
        validatedData.date ? new Date(validatedData.date) : undefined
      );

      return c.json({ snapshot }, 201);
    } catch (error: any) {
      console.error("Error creating snapshot:", error);
      return c.json({ error: error.message || "Failed to create snapshot" }, 500);
    }
  },

  /**
   * GET /api/trading/simulator/snapshots
   */
  async getSnapshots(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const query = c.req.query();
      const from = query.from ? new Date(query.from) : undefined;
      const to = query.to ? new Date(query.to) : undefined;

      const snapshots = await tradingService.getSnapshots(user.id, from, to);

      return c.json({ snapshots });
    } catch (error: any) {
      console.error("Error getting snapshots:", error);
      return c.json({ error: error.message || "Failed to get snapshots" }, 500);
    }
  },

  /**
   * POST /api/trading/simulator/watchlist
   */
  async addToWatchlist(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const validatedData = addToWatchlistSchema.parse(body);

      const watchlistItem = await tradingService.addToWatchlist(
        user.id,
        validatedData.assetId,
        typeof validatedData.priceAlertTarget === "string"
          ? parseFloat(validatedData.priceAlertTarget)
          : validatedData.priceAlertTarget,
        validatedData.priceAlertEnabled
      );

      return c.json(
        {
          message: "Added to watchlist",
          item: watchlistItem,
        },
        201
      );
    } catch (error: any) {
      console.error("Error adding to watchlist:", error);
      return c.json({ error: error.message || "Failed to add to watchlist" }, 500);
    }
  },

  /**
   * DELETE /api/trading/simulator/watchlist/:id
   */
  async removeFromWatchlist(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const id = c.req.param("id");

      await tradingService.removeFromWatchlist(user.id, id);

      return c.json({ message: "Removed from watchlist" });
    } catch (error: any) {
      console.error("Error removing from watchlist:", error);
      return c.json({ error: error.message || "Failed to remove from watchlist" }, 500);
    }
  },

  /**
   * GET /api/trading/simulator/watchlist
   */
  async getWatchlist(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const watchlist = await tradingService.getWatchlist(user.id);

      return c.json({ watchlist });
    } catch (error: any) {
      console.error("Error getting watchlist:", error);
      return c.json({ error: error.message || "Failed to get watchlist" }, 500);
    }
  },

  /**
   * PATCH /api/trading/simulator/watchlist/:id
   */
  async updateWatchlist(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const id = c.req.param("id");
      const body = await c.req.json();
      const validatedData = updateWatchlistSchema.parse(body);

      const data: any = {};
      if (validatedData.priceAlertTarget !== undefined) {
        data.priceAlertTarget =
          typeof validatedData.priceAlertTarget === "string"
            ? parseFloat(validatedData.priceAlertTarget)
            : validatedData.priceAlertTarget;
      }
      if (validatedData.priceAlertEnabled !== undefined) {
        data.priceAlertEnabled = validatedData.priceAlertEnabled;
      }

      const watchlistItem = await tradingService.updateWatchlist(user.id, id, data);

      return c.json({
        message: "Watchlist updated",
        item: watchlistItem,
      });
    } catch (error: any) {
      console.error("Error updating watchlist:", error);
      return c.json({ error: error.message || "Failed to update watchlist" }, 500);
    }
  },

  /**
   * GET /api/trading/simulator/pending-orders
   */
  async getPendingOrders(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const orders = await tradingService.getPendingOrders(user.id);
      return c.json({ orders });
    } catch (error: any) {
      console.error("Error fetching pending orders:", error);
      return c.json({ error: "Failed to fetch pending orders" }, 500);
    }
  },

  /**
   * POST /api/trading/simulator/pending-orders/process
   */
  async processPendingOrders(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const result = await tradingService.processPendingOrders(user.id);
      return c.json(result);
    } catch (error: any) {
      console.error("Error processing pending orders:", error);
      return c.json({ error: "Failed to process pending orders" }, 500);
    }
  },

  /**
   * DELETE /api/trading/simulator/pending-orders/:orderId
   */
  async cancelPendingOrder(c: Context) {
    try {
      const user = c.get("user");
      
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const orderId = c.req.param("orderId");
      const order = await tradingService.cancelPendingOrder(user.id, orderId);
      return c.json({ order });
    } catch (error: any) {
      console.error("Error cancelling pending order:", error);
      return c.json({ error: error.message || "Failed to cancel pending order" }, 500);
    }
  },
};
