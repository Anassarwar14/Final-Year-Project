import { Hono } from "hono";
import authController from "./modules/auth";
import privateRoutes from "./modules/private";
import tradingRoutes from "./modules/trading";
import newsRoutes from "./modules/news";
import portfolioRoutes from "./modules/portfolio";
import { alphaVantageService } from "./services/alphaVantageService";
import { prisma } from "./lib/db";
import { tradingService } from "./modules/trading/service";

const app = new Hono().basePath("/api");

const routes = app
  .route("/auth", authController)
  .route("/private", privateRoutes)
  .route("/trading", tradingRoutes)
  .route("/news", newsRoutes)
  .route("/portfolio", portfolioRoutes);

// Auto-process pending orders on server startup if market is open
(async () => {
  try {
    console.log("Checking for pending orders to process on startup...");
    const marketStatus = await alphaVantageService.getMarketStatus();
    
    if (marketStatus.isOpen) {
      console.log("Market is OPEN - processing all pending orders...");
      
      // Find all users with pending orders
      const pendingOrders = await prisma.simulatorTransaction.findMany({
        where: { pending: true },
        include: { profile: true },
        distinct: ['profileId'],
      });
      
      const uniqueUserIds = [...new Set(pendingOrders.map(o => o.profile.userId))];
      console.log(`Found pending orders for ${uniqueUserIds.length} user(s)`);
      
      for (const userId of uniqueUserIds) {
        try {
          const result = await tradingService.processPendingOrders(userId);
          console.log(`User ${userId}: Processed ${result.processed} orders, Failed ${result.failed}`);
        } catch (error) {
          console.error(`Error processing orders for user ${userId}:`, error);
        }
      }
    } else {
      console.log("Market is CLOSED - pending orders will be processed when market opens");
    }
  } catch (error) {
    console.error("Error in startup pending order check:", error);
  }
})();

export type AppType = typeof routes;
export default app;
