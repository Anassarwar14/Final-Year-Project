import { Hono } from "hono";
import authController from "./modules/auth";
import privateRoutes from "./modules/private";
import tradingRoutes from "./modules/trading";
import newsRoutes from "./modules/news";
import portfolioRoutes from "./modules/portfolio";
import advisorRoutes from "./modules/advisor";
import ragRoutes from "./modules/rag";
import { alphaVantageService } from "./services/alphaVantageService";
import { prisma } from "./lib/db";
import { tradingService } from "./modules/trading/service";
import { RAGService } from "./modules/rag/service";
import type { Prisma } from "@prisma/client";

const globalForRagScheduler = globalThis as unknown as {
  ragRefreshInitialized?: boolean;
};

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

const app = new Hono().basePath("/api");

const routes = app
  .route("/auth", authController)
  .route("/private", privateRoutes)
  .route("/trading", tradingRoutes)
  .route("/news", newsRoutes)
  .route("/portfolio", portfolioRoutes)
  .route("/advisor", advisorRoutes)
  .route("/rag", ragRoutes);

// Auto-process pending orders on server startup if market is open.
// Skip during Next build to avoid network/db side effects at compile time.
if (!isBuildPhase) {
  (async () => {
    try {
      console.log("Checking for pending orders to process on startup...");
      const marketStatus = await alphaVantageService.getMarketStatus();

      if (marketStatus.isOpen) {
        console.log("Market is OPEN - processing all pending orders...");

        // Find all users with pending orders
        const pendingOrders: Prisma.SimulatorTransactionGetPayload<{ include: { profile: true } }>[] = await prisma.simulatorTransaction.findMany({
          where: { pending: true },
          include: { profile: true },
          distinct: ["profileId"],
        });

        const uniqueUserIds = [...new Set(pendingOrders.map((o) => o.profile.userId))];
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
} else {
  console.log("Skipping startup pending-order check during build phase.");
}

// Periodic RAG refresh from active portfolio symbols.
const shouldAutoRefreshRag = process.env.RAG_AUTO_REFRESH_ENABLED === "true";
const ragRefreshIntervalMinutes = Number(process.env.RAG_AUTO_REFRESH_INTERVAL_MINUTES || 720);
const ragRefreshMode = (process.env.RAG_REFRESH_MODE || "mvp-universe").toLowerCase();
const ragRefreshMaxTickers = Math.max(1, Number(process.env.RAG_REFRESH_MAX_TICKERS || 10));

if (!isBuildPhase && shouldAutoRefreshRag && !globalForRagScheduler.ragRefreshInitialized) {
  globalForRagScheduler.ragRefreshInitialized = true;
  const intervalMs = Math.max(60, ragRefreshIntervalMinutes) * 60 * 1000;

  const runRagRefresh = async () => {
    try {
      const summary = ragRefreshMode === "active-portfolio"
        ? await RAGService.refreshActivePortfolioTickers(ragRefreshMaxTickers)
        : await RAGService.refreshMvpUniverseTickers(ragRefreshMaxTickers);

      if (summary.tickers.length > 0) {
        console.log(
          `[RAG Refresh] mode=${ragRefreshMode} tickers=${summary.tickers.join(",")}, inserted=${summary.results.reduce((acc, r) => acc + r.chunksInserted, 0)}, skippedDocs=${summary.results.reduce((acc, r) => acc + r.documentsSkipped, 0)}`
        );
      } else {
        console.log(`[RAG Refresh] No tickers found for mode=${ragRefreshMode}.`);
      }
    } catch (error) {
      console.error("[RAG Refresh] Failed:", error);
    }
  };

  setTimeout(runRagRefresh, 10_000);
  setInterval(runRagRefresh, intervalMs);
} else if (!isBuildPhase && shouldAutoRefreshRag) {
  console.log("[RAG Refresh] Scheduler already initialized; skipping duplicate registration.");
} else if (isBuildPhase) {
  console.log("[RAG Refresh] Skipping scheduler registration during build phase.");
} else {
  console.log("[RAG Refresh] Auto-refresh is disabled. Runtime ingestion can still be enabled via RAG_QUERY_INGEST_ENABLED=true.");
}

export type AppType = typeof routes;
export default app;
