import { prisma } from "../../lib/db";
import { marketDataService } from "../../services/marketDataService";

export const portfolioService = {
  async ensurePrimaryPortfolio(userId: string) {
    const existing = await prisma.portfolio.findFirst({ where: { userId } });
    if (existing) return existing;

    return prisma.portfolio.create({
      data: {
        userId,
        name: "Primary Portfolio",
        description: "Default real portfolio",
        cashBalance: 0,
      },
    });
  },

  async ensureAsset(symbol: string) {
    const normalized = symbol.trim().toUpperCase();
    let asset = await prisma.asset.findUnique({ where: { symbol: normalized } });
    if (asset) return asset;

    const profile = await marketDataService.getCompanyProfile(normalized).catch(() => null);

    asset = await prisma.asset.create({
      data: {
        id: normalized,
        symbol: normalized,
        name: profile?.name || normalized,
        type: "STOCK",
        exchange: profile?.exchange || "US",
        currency: profile?.currency || "USD",
        logoUrl: profile?.logo || null,
      },
    });

    return asset;
  },

  /**
   * Get enhanced portfolio with live market data
   */
  async getEnhancedPortfolio(userId: string) {
    try {
      const profile = await prisma.portfolio.findFirst({
        where: { userId },
        include: {
          holdings: {
            include: {
              asset: true,
            },
          },
          transactions: {
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              asset: true,
            },
          },
        },
      });

      if (!profile) {
        return null;
      }

      // Get live quotes for all holdings
      const symbols = profile.holdings.map((h) => h.asset.symbol);
      const quotes = await marketDataService.getBatchQuotes(symbols);

      // Calculate live P&L for each holding
      const enrichedHoldings = profile.holdings.map((holding) => {
        const quote = quotes.get(holding.asset.symbol);
        const currentPrice = quote?.c || 0;
        const quantityNum = Number(holding.quantity);
        const avgBuyPriceNum = Number(holding.averageBuyPrice);
        const totalValue = currentPrice * quantityNum;
        const totalCost = avgBuyPriceNum * quantityNum;
        const unrealizedPnL = totalValue - totalCost;
        const unrealizedPnLPercent =
          totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

        return {
          ...holding,
          currentPrice,
          totalValue,
          totalCost,
          unrealizedPnL,
          unrealizedPnLPercent,
          quote,
        };
      });

      // Calculate portfolio totals
      const totalValue = enrichedHoldings.reduce(
        (sum, h) => sum + h.totalValue,
        0
      );
      const totalCost = enrichedHoldings.reduce((sum, h) => sum + h.totalCost, 0);
      const totalUnrealizedPnL = totalValue - totalCost;
      const totalUnrealizedPnLPercent =
        totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0;

      // Calculate sector allocation
      const sectorAllocation = enrichedHoldings.reduce(
        (acc, holding) => {
          const sector = holding.asset.exchange || "Unknown";
          acc[sector] = (acc[sector] || 0) + holding.totalValue;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        profile: {
          id: profile.id,
          cashBalance: Number(profile.cashBalance),
          totalValue: totalValue + Number(profile.cashBalance),
          investedValue: totalCost,
        },
        holdings: enrichedHoldings,
        recentTransactions: profile.transactions,
        analytics: {
          totalUnrealizedPnL,
          totalUnrealizedPnLPercent,
          totalValue,
          sectorAllocation,
          diversification: {
            stockCount: profile.holdings.length,
            sectors: Object.keys(sectorAllocation).length,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching enhanced portfolio:", error);
      throw error;
    }
  },

  /**
   * Get portfolio performance over time
   */
  async getPortfolioPerformance(userId: string, days: number = 30) {
    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { userId },
        include: {
          performanceSnapshots: {
            where: {
              date: {
                gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
              },
            },
            orderBy: { date: "asc" },
          },
        },
      });

      if (!portfolio) {
        return null;
      }

      const snapshots = portfolio.performanceSnapshots.map((snap) => ({
        createdAt: snap.date.toISOString(),
        totalValue: parseFloat(snap.totalValue.toString()),
        holdings: parseFloat(snap.holdingsValue.toString()),
        cash: parseFloat(snap.cashValue.toString()),
      }));

      const fallbackCurrentValue =
        snapshots[snapshots.length - 1]?.totalValue || Number(portfolio.cashBalance || 0);

      return {
        snapshots,
        startValue: snapshots[0]?.totalValue || fallbackCurrentValue,
        currentValue: fallbackCurrentValue,
        period: days,
      };
    } catch (error) {
      console.error("Error fetching portfolio performance:", error);
      throw error;
    }
  },

  /**
   * Get portfolio insights with analyst recommendations
   */
  async getPortfolioInsights(userId: string) {
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
        return { holdings: [], recommendations: [] };
      }

      // Get analyst recommendations for all holdings
      const insights = await Promise.all(
        profile.holdings.map(async (holding) => {
          const [recommendations, financials, peers] = await Promise.all([
            marketDataService.getRecommendationTrends(holding.asset.symbol),
            marketDataService.getBasicFinancials(holding.asset.symbol),
            marketDataService.getPeers(holding.asset.symbol),
          ]);

          return {
            holding,
            recommendations: recommendations[0], // Latest month
            financials: financials?.metric,
            peers,
          };
        })
      );

      return { insights };
    } catch (error) {
      console.error("Error fetching portfolio insights:", error);
      throw error;
    }
  },

  /**
   * Get aggregated news for portfolio holdings
   */
  async getPortfolioNews(userId: string, days: number = 7) {
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

      const symbols = profile.holdings.map((h) => h.asset.symbol);
      const to = new Date().toISOString().split("T")[0];
      const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // Fetch news for all holdings
      const newsPromises = symbols.map(async (symbol) => {
        const news = await marketDataService.getCompanyNews(symbol, from, to);
        return news.map((article) => ({ ...article, symbol }));
      });

      const allNews = (await Promise.all(newsPromises))
        .flat()
        .sort((a, b) => b.datetime - a.datetime);

      return allNews;
    } catch (error) {
      console.error("Error fetching portfolio news:", error);
      return [];
    }
  },

  /**
   * Get rich analytics payload for /portfolio/analytics page
   */
  async getPortfolioAnalytics(userId: string) {
    const [overview, insights] = await Promise.all([
      this.getEnhancedPortfolio(userId),
      this.getPortfolioInsights(userId).catch(() => ({ insights: [] as any[] })),
    ]);

    if (!overview) {
      return {
        overview: {
          score: 0,
          riskLevel: "Unknown",
          diversification: 0,
          efficiency: 0,
        },
        sectorAllocation: [],
        riskAnalysis: [],
        performanceAttribution: [],
        recommendations: [],
      };
    }

    const holdings = overview.holdings || [];
    const sectorEntries = Object.entries(overview.analytics?.sectorAllocation || {});
    const totalSectorValue = sectorEntries.reduce((acc, [, value]) => acc + Number(value || 0), 0);

    const sectorAllocation = sectorEntries
      .map(([name, value]) => {
        const pct = totalSectorValue > 0 ? (Number(value) / totalSectorValue) * 100 : 0;
        return {
          name,
          value: Number(pct.toFixed(2)),
          target: Math.max(5, Number((100 / Math.max(1, sectorEntries.length)).toFixed(2))),
        };
      })
      .sort((a, b) => b.value - a.value);

    const concentratedRisk = sectorAllocation.length > 0 ? Math.max(...sectorAllocation.map((s) => s.value)) : 0;
    const diversificationScore = Math.min(10, Number((overview.analytics?.diversification?.sectors || 0) * 2));
    const unrealizedPct = Number(overview.analytics?.totalUnrealizedPnLPercent || 0);

    const riskScore = Math.min(100, Math.max(0, 100 - diversificationScore * 6 + Math.max(0, concentratedRisk - 35)));
    const riskLevel = riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low";

    const riskAnalysis = [
      {
        category: "Concentration",
        score: Math.round(Math.max(0, concentratedRisk)),
        status: concentratedRisk > 45 ? "High" : concentratedRisk > 30 ? "Medium" : "Low",
        description: `Largest sector weight is ${concentratedRisk.toFixed(1)}%.`,
      },
      {
        category: "Diversification",
        score: Math.round(Math.max(0, 100 - diversificationScore * 10)),
        status: diversificationScore >= 7 ? "Low" : diversificationScore >= 4 ? "Medium" : "High",
        description: `${overview.analytics?.diversification?.sectors || 0} sectors across ${holdings.length} holdings.`,
      },
      {
        category: "PnL Volatility",
        score: Math.round(Math.min(100, Math.abs(unrealizedPct) * 3)),
        status: Math.abs(unrealizedPct) > 20 ? "High" : Math.abs(unrealizedPct) > 10 ? "Medium" : "Low",
        description: `Current unrealized return is ${unrealizedPct.toFixed(2)}%.`,
      },
    ];

    const topSector = sectorAllocation[0];
    const recommendations = [
      {
        type: "rebalance",
        title: topSector ? `Trim ${topSector.name} concentration` : "Review concentration risk",
        description: topSector
          ? `Your ${topSector.name} exposure is ${topSector.value.toFixed(1)}%. Consider reducing toward ${topSector.target.toFixed(1)}%.`
          : "No sector concentration signals yet.",
        priority: topSector && topSector.value > 45 ? "High" : "Medium",
        impact: "Medium",
      },
      {
        type: "diversify",
        title: "Improve sector spread",
        description: `You currently hold ${overview.analytics?.diversification?.sectors || 0} sectors. Add uncorrelated sectors to stabilize drawdowns.`,
        priority: (overview.analytics?.diversification?.sectors || 0) < 3 ? "High" : "Low",
        impact: "High",
      },
      {
        type: "opportunity",
        title: "Use cash tactically",
        description: `Available cash is $${Number(overview.profile.cashBalance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}. Stage entries over multiple tranches.`,
        priority: Number(overview.profile.cashBalance || 0) > 0 ? "Medium" : "Low",
        impact: "Medium",
      },
    ];

    const attributionBase = [
      { factor: "Allocation", contribution: Number((unrealizedPct * 0.45).toFixed(2)) },
      { factor: "Security Selection", contribution: Number((unrealizedPct * 0.35).toFixed(2)) },
      { factor: "Market Beta", contribution: Number((unrealizedPct * 0.2).toFixed(2)) },
    ];

    return {
      overview: {
        score: Number((10 - riskScore / 15).toFixed(1)),
        riskLevel,
        diversification: Number(diversificationScore.toFixed(1)),
        efficiency: Number((Math.max(0, Math.min(10, 6 + unrealizedPct / 10))).toFixed(1)),
      },
      sectorAllocation,
      riskAnalysis,
      performanceAttribution: attributionBase,
      recommendations,
      insightCount: (insights as any)?.insights?.length || 0,
    };
  },

  async addHoldingForUser(userId: string, input: { symbol: string; quantity: number; averagePrice: number }) {
    const symbol = input.symbol.trim().toUpperCase();
    const quantity = Number(input.quantity);
    const averagePrice = Number(input.averagePrice);

    if (!symbol || quantity <= 0 || averagePrice <= 0) {
      throw new Error("Invalid symbol, quantity, or average price");
    }

    const portfolio = await this.ensurePrimaryPortfolio(userId);
    const asset = await this.ensureAsset(symbol);

    return prisma.$transaction(async (tx) => {
      const existing = await tx.holding.findUnique({
        where: {
          portfolioId_assetId: {
            portfolioId: portfolio.id,
            assetId: asset.id,
          },
        },
      });

      if (!existing) {
        return tx.holding.create({
          data: {
            portfolioId: portfolio.id,
            assetId: asset.id,
            quantity,
            averageBuyPrice: averagePrice,
          },
          include: { asset: true },
        });
      }

      const oldQty = Number(existing.quantity);
      const oldAvg = Number(existing.averageBuyPrice);
      const totalQty = oldQty + quantity;
      const newAvg = totalQty > 0 ? (oldQty * oldAvg + quantity * averagePrice) / totalQty : averagePrice;

      return tx.holding.update({
        where: {
          portfolioId_assetId: {
            portfolioId: portfolio.id,
            assetId: asset.id,
          },
        },
        data: {
          quantity: totalQty,
          averageBuyPrice: newAvg,
        },
        include: { asset: true },
      });
    });
  },

  async updateHoldingForUser(
    userId: string,
    holdingId: string,
    input: { quantity?: number; averagePrice?: number }
  ) {
    const portfolio = await this.ensurePrimaryPortfolio(userId);
    const holding = await prisma.holding.findFirst({
      where: { id: holdingId, portfolioId: portfolio.id },
    });

    if (!holding) throw new Error("Holding not found");

    const quantity = input.quantity !== undefined ? Number(input.quantity) : Number(holding.quantity);
    const averagePrice =
      input.averagePrice !== undefined ? Number(input.averagePrice) : Number(holding.averageBuyPrice);

    if (quantity <= 0 || averagePrice <= 0) {
      throw new Error("Quantity and average price must be greater than 0");
    }

    return prisma.holding.update({
      where: { id: holdingId },
      data: {
        quantity,
        averageBuyPrice: averagePrice,
      },
      include: { asset: true },
    });
  },

  async removeHoldingForUser(userId: string, holdingId: string) {
    const portfolio = await this.ensurePrimaryPortfolio(userId);
    const holding = await prisma.holding.findFirst({
      where: { id: holdingId, portfolioId: portfolio.id },
    });

    if (!holding) throw new Error("Holding not found");

    await prisma.holding.delete({ where: { id: holdingId } });
    return { success: true };
  },
};
