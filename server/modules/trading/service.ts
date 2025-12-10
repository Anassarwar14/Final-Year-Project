import { prisma } from "../../lib/db";
import { marketDataService } from "../../services/marketDataService";
import { alphaVantageService } from "../../services/alphaVantageService";
import { Decimal } from "@prisma/client/runtime/library";

export const tradingService = {
  /**
   * Initialize simulator profile for a user (idempotent)
   */
  async initializeProfile(userId: string) {
    // Check if profile already exists
    const existing = await prisma.simulatorProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    // Create new profile with $100k starting balance
    return await prisma.simulatorProfile.create({
      data: {
        userId,
        virtualBalance: new Decimal(100000),
      },
    });
  },

  /**
   * Reset simulator profile - clear all holdings and reset balance to $100k
   */
  async resetProfile(userId: string) {
    return await prisma.$transaction(async (tx) => {
      // Get existing profile
      const profile = await tx.simulatorProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new Error("Simulator profile not found");
      }

      // Delete all holdings
      await tx.simulatorHolding.deleteMany({
        where: { profileId: profile.id },
      });

      // Delete all transactions
      await tx.simulatorTransaction.deleteMany({
        where: { profileId: profile.id },
      });

      // Delete all watchlist items
      await tx.simulatorWatchlist.deleteMany({
        where: { profileId: profile.id },
      });

      // Delete all snapshots
      await tx.simulatorSnapshot.deleteMany({
        where: { profileId: profile.id },
      });

      // Reset balance to $100k
      return await tx.simulatorProfile.update({
        where: { id: profile.id },
        data: {
          virtualBalance: new Decimal(100000),
        },
      });
    });
  },

  /**
   * Get simulator profile with holdings and total value
   */
  async getProfile(userId: string) {
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

    if (!profile) {
      throw new Error("Simulator profile not found");
    }

    // Fetch current prices for all holdings
    const symbols = profile.holdings.map((h) => h.asset.symbol);
    const quotes = await marketDataService.getBatchQuotes(symbols);

    // Calculate total portfolio value
    let holdingsValue = new Decimal(0);
    const holdingsWithValue = profile.holdings.map((holding) => {
      const quote = quotes.get(holding.asset.symbol);
      const currentPrice = quote ? new Decimal(quote.c) : holding.averageBuyPrice;
      const value = currentPrice.mul(holding.quantity);
      const unrealizedPnL = currentPrice.sub(holding.averageBuyPrice).mul(holding.quantity);
      const unrealizedPnLPercent = unrealizedPnL.div(holding.averageBuyPrice.mul(holding.quantity)).mul(100);

      holdingsValue = holdingsValue.add(value);

      return {
        ...holding,
        currentPrice: currentPrice.toNumber(),
        value: value.toNumber(),
        unrealizedPnL: unrealizedPnL.toNumber(),
        unrealizedPnLPercent: unrealizedPnLPercent.toNumber(),
      };
    });

    const totalValue = profile.virtualBalance.add(holdingsValue);

    return {
      id: profile.id,
      userId: profile.userId,
      virtualBalance: profile.virtualBalance.toNumber(),
      holdingsValue: holdingsValue.toNumber(),
      totalValue: totalValue.toNumber(),
      holdings: holdingsWithValue,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  },

  /**
   * Execute a trade (buy or sell)
   * Creates pending order if market is closed, executes immediately if open
   */
  async executeTrade(
    userId: string,
    assetId: string,
    type: "BUY" | "SELL",
    quantity: number,
    pricePerUnit: number,
    isMarketOpen?: boolean
  ) {
    // If market is closed, create a pending order
    if (isMarketOpen === false) {
      return await prisma.$transaction(async (tx) => {
        const profile = await tx.simulatorProfile.findUnique({
          where: { userId },
        });

        if (!profile) {
          throw new Error("Simulator profile not found");
        }

        const quantityDecimal = new Decimal(quantity);
        const priceDecimal = new Decimal(pricePerUnit);
        const totalCost = quantityDecimal.mul(priceDecimal);

        // Basic validation for pending orders
        if (type === "BUY" && profile.virtualBalance.lt(totalCost)) {
          throw new Error("Insufficient balance for pending order");
        }

        // Create pending transaction
        const transaction = await tx.simulatorTransaction.create({
          data: {
            profile: {
              connect: { id: profile.id }
            },
            asset: {
              connect: { id: assetId }
            },
            type,
            quantity: quantityDecimal,
            pricePerUnit: priceDecimal,
            executedAt: null,
            pending: true,
          },
          include: {
            asset: true,
          },
        });

        return transaction;
      });
    }
    
    // Market is open - execute immediately
    return await prisma.$transaction(async (tx) => {
      // Get profile
      const profile = await tx.simulatorProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new Error("Simulator profile not found");
      }

      const quantityDecimal = new Decimal(quantity);
      const priceDecimal = new Decimal(pricePerUnit);
      const totalCost = quantityDecimal.mul(priceDecimal);

      if (type === "BUY") {
        // Check sufficient balance
        if (profile.virtualBalance.lt(totalCost)) {
          throw new Error("Insufficient balance");
        }

        // Deduct balance
        await tx.simulatorProfile.update({
          where: { userId },
          data: {
            virtualBalance: profile.virtualBalance.sub(totalCost),
          },
        });

        // Update or create holding
        const existingHolding = await tx.simulatorHolding.findUnique({
          where: {
            profileId_assetId: {
              profileId: profile.id,
              assetId,
            },
          },
        });

        if (existingHolding) {
          // Calculate new average buy price (weighted average)
          const totalQuantity = existingHolding.quantity.add(quantityDecimal);
          const totalValue = existingHolding.averageBuyPrice
            .mul(existingHolding.quantity)
            .add(totalCost);
          const newAvgPrice = totalValue.div(totalQuantity);

          await tx.simulatorHolding.update({
            where: {
              profileId_assetId: {
                profileId: profile.id,
                assetId,
              },
            },
            data: {
              quantity: totalQuantity,
              averageBuyPrice: newAvgPrice,
            },
          });
        } else {
          // Create new holding
          await tx.simulatorHolding.create({
            data: {
              profileId: profile.id,
              assetId,
              quantity: quantityDecimal,
              averageBuyPrice: priceDecimal,
            },
          });
        }
      } else {
        // SELL
        const holding = await tx.simulatorHolding.findUnique({
          where: {
            profileId_assetId: {
              profileId: profile.id,
              assetId,
            },
          },
        });

        if (!holding) {
          throw new Error("No holdings for this asset");
        }

        if (holding.quantity.lt(quantityDecimal)) {
          throw new Error("Insufficient quantity to sell");
        }

        // Add to balance
        await tx.simulatorProfile.update({
          where: { userId },
          data: {
            virtualBalance: profile.virtualBalance.add(totalCost),
          },
        });

        // Update holding
        const newQuantity = holding.quantity.sub(quantityDecimal);

        if (newQuantity.eq(0)) {
          // Delete holding if quantity becomes zero
          await tx.simulatorHolding.delete({
            where: {
              profileId_assetId: {
                profileId: profile.id,
                assetId,
              },
            },
          });
        } else {
          await tx.simulatorHolding.update({
            where: {
              profileId_assetId: {
                profileId: profile.id,
                assetId,
              },
            },
            data: {
              quantity: newQuantity,
            },
          });
        }
      }

      // Create transaction record
      const transaction = await tx.simulatorTransaction.create({
        data: {
          profileId: profile.id,
          assetId,
          type,
          quantity: quantityDecimal,
          pricePerUnit: priceDecimal,
          executedAt: new Date(),
        },
        include: {
          asset: true,
        },
      });

      // Create daily performance snapshot after trade
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get updated portfolio value
      const updatedProfile = await tx.simulatorProfile.findUnique({
        where: { userId },
        include: {
          holdings: true,
        },
      });

      if (updatedProfile) {
        // Calculate total holdings value
        const holdingsValue = updatedProfile.holdings.reduce((total, holding) => {
          return total.add(holding.quantity.mul(priceDecimal)); // Using current trade price as approximation
        }, new Decimal(0));

        const totalValue = updatedProfile.virtualBalance.add(holdingsValue);

        // Upsert snapshot for today
        await tx.simulatorSnapshot.upsert({
          where: {
            profileId_date: {
              profileId: profile.id,
              date: today,
            },
          },
          update: {
            totalValue,
            cashValue: updatedProfile.virtualBalance,
            holdingsValue,
          },
          create: {
            profileId: profile.id,
            date: today,
            totalValue,
            cashValue: updatedProfile.virtualBalance,
            holdingsValue,
          },
        });
      }

      return transaction;
    });
  },

  /**
   * Get transaction history with pagination and filters
   */
  async getTransactionHistory(
    userId: string,
    filters: {
      assetId?: string;
      type?: "BUY" | "SELL";
      from?: Date;
      to?: Date;
      cursor?: string;
      limit?: number;
    }
  ) {
    const profile = await prisma.simulatorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Simulator profile not found");
    }

    const where: any = {
      profileId: profile.id,
      pending: false, // Exclude pending orders from history
    };

    if (filters.assetId) {
      where.assetId = filters.assetId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.from || filters.to) {
      where.executedAt = {};
      if (filters.from) where.executedAt.gte = filters.from;
      if (filters.to) where.executedAt.lte = filters.to;
    }

    if (filters.cursor) {
      where.id = { lt: filters.cursor };
    }

    const limit = filters.limit || 20;

    const transactions = await prisma.simulatorTransaction.findMany({
      where,
      include: {
        asset: true,
      },
      orderBy: {
        executedAt: "desc",
      },
      take: limit + 1, // Fetch one extra to determine if there are more
    });

    const hasMore = transactions.length > limit;
    const results = hasMore ? transactions.slice(0, limit) : transactions;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return {
      transactions: results.map((t) => ({
        ...t,
        quantity: t.quantity.toNumber(),
        pricePerUnit: t.pricePerUnit.toNumber(),
        totalValue: t.quantity.mul(t.pricePerUnit).toNumber(),
      })),
      nextCursor,
      hasMore,
    };
  },

  /**
   * Process all pending orders for a user
   * Called when market opens or manually triggered
   */
  async processPendingOrders(userId: string) {
    const profile = await prisma.simulatorProfile.findUnique({
      where: { userId },
      include: {
        transactions: {
          where: { pending: true },
          include: { asset: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!profile || !profile.transactions.length) {
      return { processed: 0, failed: 0, results: [] };
    }

    const results = [];
    let processed = 0;
    let failed = 0;

    for (const pendingOrder of profile.transactions) {
      try {
        // Fetch current market price
        let quote = await alphaVantageService.getRealtimeQuote(pendingOrder.asset.symbol);
        
        // Fallback to Finnhub if Alpha Vantage fails
        if (!quote || !quote.c) {
          quote = await marketDataService.getRealtimeQuote(pendingOrder.asset.symbol);
        }
        
        if (!quote || !quote.c) {
          throw new Error(`Unable to fetch current price for ${pendingOrder.asset.symbol}`);
        }

        const currentPrice = quote.c;
        console.log(`Processing pending order: ${pendingOrder.type} ${pendingOrder.quantity} ${pendingOrder.asset.symbol} at $${currentPrice}`);

        // Execute the pending order with CURRENT market price
        await this.executeTrade(
          userId,
          pendingOrder.assetId,
          pendingOrder.type,
          parseFloat(pendingOrder.quantity.toString()),
          currentPrice, // Use current price, not stale price
          true // Market is open
        );

        // Delete the pending order
        await prisma.simulatorTransaction.delete({
          where: { id: pendingOrder.id },
        });

        processed++;
        results.push({
          symbol: pendingOrder.asset.symbol,
          type: pendingOrder.type,
          quantity: parseFloat(pendingOrder.quantity.toString()),
          price: currentPrice,
          status: 'success',
        });
      } catch (error: any) {
        console.error(`Failed to process pending order for ${pendingOrder.asset.symbol}:`, error.message);
        failed++;
        results.push({
          symbol: pendingOrder.asset.symbol,
          type: pendingOrder.type,
          quantity: parseFloat(pendingOrder.quantity.toString()),
          status: 'failed',
          error: error.message,
        });
      }
    }

    return { processed, failed, results };
  },

  /**
   * Get pending orders for a user
   */
  async getPendingOrders(userId: string) {
    const profile = await prisma.simulatorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return [];
    }

    return await prisma.simulatorTransaction.findMany({
      where: {
        profileId: profile.id,
        pending: true,
      },
      include: {
        asset: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Cancel a pending order
   */
  async cancelPendingOrder(userId: string, orderId: string) {
    const profile = await prisma.simulatorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Simulator profile not found");
    }

    const order = await prisma.simulatorTransaction.findFirst({
      where: {
        id: orderId,
        profileId: profile.id,
        pending: true,
      },
    });

    if (!order) {
      throw new Error("Pending order not found");
    }

    await prisma.simulatorTransaction.delete({
      where: { id: orderId },
    });

    return order;
  },

  /**
   * Get all holdings with current prices
   */
  async getHoldings(userId: string) {
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

    if (!profile) {
      throw new Error("Simulator profile not found");
    }

    // Fetch current prices
    const symbols = profile.holdings.map((h) => h.asset.symbol);
    const quotes = await marketDataService.getBatchQuotes(symbols);

    return profile.holdings.map((holding) => {
      const quote = quotes.get(holding.asset.symbol);
      const currentPrice = quote ? new Decimal(quote.c) : holding.averageBuyPrice;
      const value = currentPrice.mul(holding.quantity);
      const unrealizedPnL = currentPrice.sub(holding.averageBuyPrice).mul(holding.quantity);
      const unrealizedPnLPercent = unrealizedPnL
        .div(holding.averageBuyPrice.mul(holding.quantity))
        .mul(100);

      return {
        id: holding.id,
        assetId: holding.assetId,
        asset: holding.asset,
        quantity: holding.quantity.toNumber(),
        averageBuyPrice: holding.averageBuyPrice.toNumber(),
        currentPrice: currentPrice.toNumber(),
        value: value.toNumber(),
        unrealizedPnL: unrealizedPnL.toNumber(),
        unrealizedPnLPercent: unrealizedPnLPercent.toNumber(),
        quote: quote || null,
      };
    });
  },

  /**
   * Create performance snapshot
   */
  async createSnapshot(userId: string, date?: Date) {
    const snapshotDate = date || new Date();
    snapshotDate.setHours(0, 0, 0, 0); // Normalize to start of day

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

    if (!profile) {
      throw new Error("Simulator profile not found");
    }

    // Calculate holdings value
    const symbols = profile.holdings.map((h) => h.asset.symbol);
    const quotes = await marketDataService.getBatchQuotes(symbols);

    let holdingsValue = new Decimal(0);
    for (const holding of profile.holdings) {
      const quote = quotes.get(holding.asset.symbol);
      const price = quote ? new Decimal(quote.c) : holding.averageBuyPrice;
      holdingsValue = holdingsValue.add(price.mul(holding.quantity));
    }

    const totalValue = profile.virtualBalance.add(holdingsValue);

    // Upsert snapshot
    const snapshot = await prisma.simulatorSnapshot.upsert({
      where: {
        profileId_date: {
          profileId: profile.id,
          date: snapshotDate,
        },
      },
      update: {
        totalValue,
        cashValue: profile.virtualBalance,
        holdingsValue,
      },
      create: {
        profileId: profile.id,
        date: snapshotDate,
        totalValue,
        cashValue: profile.virtualBalance,
        holdingsValue,
      },
    });

    return {
      ...snapshot,
      totalValue: snapshot.totalValue.toNumber(),
      cashValue: snapshot.cashValue.toNumber(),
      holdingsValue: snapshot.holdingsValue.toNumber(),
    };
  },

  /**
   * Get performance snapshots for charting
   */
  async getSnapshots(userId: string, from?: Date, to?: Date) {
    const profile = await prisma.simulatorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Simulator profile not found");
    }

    const where: any = {
      profileId: profile.id,
    };

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = from;
      if (to) where.date.lte = to;
    }

    const snapshots = await prisma.simulatorSnapshot.findMany({
      where,
      orderBy: {
        date: "asc",
      },
    });

    return snapshots.map((s) => ({
      ...s,
      totalValue: s.totalValue.toNumber(),
      cashValue: s.cashValue.toNumber(),
      holdingsValue: s.holdingsValue.toNumber(),
    }));
  },

  /**
   * Watchlist operations
   */
  async addToWatchlist(
    userId: string,
    assetId: string,
    priceAlertTarget?: number,
    priceAlertEnabled?: boolean
  ) {
    const profile = await prisma.simulatorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Simulator profile not found");
    }

    return await prisma.simulatorWatchlist.create({
      data: {
        profileId: profile.id,
        assetId,
        priceAlertTarget: priceAlertTarget ? new Decimal(priceAlertTarget) : null,
        priceAlertEnabled: priceAlertEnabled || false,
      },
      include: {
        asset: true,
      },
    });
  },

  async removeFromWatchlist(userId: string, watchlistId: string) {
    const profile = await prisma.simulatorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Simulator profile not found");
    }

    return await prisma.simulatorWatchlist.delete({
      where: {
        id: watchlistId,
        profileId: profile.id,
      },
    });
  },

  async getWatchlist(userId: string) {
    const profile = await prisma.simulatorProfile.findUnique({
      where: { userId },
      include: {
        watchlist: {
          include: {
            asset: true,
          },
        },
      },
    });

    if (!profile) {
      throw new Error("Simulator profile not found");
    }

    // Fetch current prices
    const symbols = profile.watchlist.map((w) => w.asset.symbol);
    const quotes = await marketDataService.getBatchQuotes(symbols);

    return profile.watchlist.map((item) => {
      const quote = quotes.get(item.asset.symbol);
      return {
        ...item,
        priceAlertTarget: item.priceAlertTarget?.toNumber() || null,
        currentPrice: quote?.c || null,
        quote: quote || null,
      };
    });
  },

  async updateWatchlist(
    userId: string,
    watchlistId: string,
    data: { priceAlertTarget?: number; priceAlertEnabled?: boolean }
  ) {
    const profile = await prisma.simulatorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Simulator profile not found");
    }

    const updateData: any = {};
    if (data.priceAlertTarget !== undefined) {
      updateData.priceAlertTarget = new Decimal(data.priceAlertTarget);
    }
    if (data.priceAlertEnabled !== undefined) {
      updateData.priceAlertEnabled = data.priceAlertEnabled;
    }

    return await prisma.simulatorWatchlist.update({
      where: {
        id: watchlistId,
        profileId: profile.id,
      },
      data: updateData,
      include: {
        asset: true,
      },
    });
  },
};
