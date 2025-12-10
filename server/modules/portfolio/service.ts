import { prisma } from "../../lib/db";
import { marketDataService } from "../../services/marketDataService";

export const portfolioService = {
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
      const profile = await prisma.simulatorProfile.findUnique({
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

      if (!profile) {
        return null;
      }

      const snapshots = profile.performanceSnapshots.map((snap) => ({
        createdAt: snap.date.toISOString(),
        totalValue: parseFloat(snap.totalValue.toString()),
        holdings: parseFloat(snap.holdingsValue.toString()),
        cash: parseFloat(snap.cashValue.toString()),
      }));

      return {
        snapshots,
        startValue:
          snapshots[0]?.totalValue || parseFloat(profile.virtualBalance.toString()),
        currentValue:
          snapshots[snapshots.length - 1]?.totalValue ||
          parseFloat(profile.virtualBalance.toString()),
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
};
