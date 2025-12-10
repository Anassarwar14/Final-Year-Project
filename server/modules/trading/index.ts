import { Hono } from "hono";
import { tradingController } from "./controller";
import { marketDataService } from "../../services/marketDataService";
import { alphaVantageService } from "../../services/alphaVantageService";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/db";

// Middleware for private routes
const privateRoutesMiddleware = async (c: any, next: any) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};

const tradingRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// Apply middleware to all trading routes
tradingRoutes.use("*", privateRoutesMiddleware);

// Simulator routes
tradingRoutes.post("/initialize", tradingController.initializeProfile);
tradingRoutes.get("/profile", tradingController.getProfile);
tradingRoutes.post("/reset", tradingController.resetProfile);
tradingRoutes.post("/trade", tradingController.executeTrade);
tradingRoutes.get("/holdings", tradingController.getHoldings);
tradingRoutes.get("/history", tradingController.getHistory);
tradingRoutes.get("/pending-orders", tradingController.getPendingOrders);
tradingRoutes.post("/pending-orders/process", tradingController.processPendingOrders);
tradingRoutes.delete("/pending-orders/:orderId", tradingController.cancelPendingOrder);
tradingRoutes.post("/snapshot", tradingController.createSnapshot);
tradingRoutes.get("/snapshots", tradingController.getSnapshots);

// Watchlist routes
tradingRoutes.post("/watchlist", tradingController.addToWatchlist);
tradingRoutes.get("/watchlist", tradingController.getWatchlist);
tradingRoutes.patch("/watchlist/:id", tradingController.updateWatchlist);
tradingRoutes.delete("/watchlist/:id", tradingController.removeFromWatchlist);

// Market data routes (public quotes, no auth needed for MVP)
const marketRoutes = new Hono();

marketRoutes.get("/quote/:symbol", async (c) => {
  try {
    const symbol = c.req.param("symbol");
    
    // Try Alpha Vantage first (has real-time quotes on free tier)
    let quote = await alphaVantageService.getRealtimeQuote(symbol);
    
    // Fallback to Finnhub if Alpha Vantage fails
    if (!quote) {
      quote = await marketDataService.getRealtimeQuote(symbol);
    }

    if (!quote) {
      return c.json({ error: "Quote not found" }, 404);
    }

    // Fetch asset data for logo
    const asset = await prisma.asset.findUnique({
      where: { symbol },
      select: { logoUrl: true, name: true }
    });

    return c.json({ 
      quote,
      asset: asset ? { logo: asset.logoUrl, name: asset.name } : null
    });
  } catch (error: any) {
    console.error("Error fetching quote:", error);
    return c.json({ error: "Failed to fetch quote" }, 500);
  }
});

marketRoutes.get("/candles/:symbol", async (c) => {
  try {
    const symbol = c.req.param("symbol");
    const query = c.req.query();
    
    const interval = query.interval || "daily"; // daily or weekly

    console.log(`Fetching candles: ${symbol}, interval=${interval}`);

    // Try Alpha Vantage first
    let candles;
    if (interval === "weekly") {
      candles = await alphaVantageService.getWeeklyCandles(symbol);
    } else {
      candles = await alphaVantageService.getDailyCandles(symbol, "compact");
    }

    // Fallback to Finnhub if Alpha Vantage fails
    if (!candles || candles.s !== "ok" || candles.t.length === 0) {
      console.log(`Alpha Vantage failed for ${symbol}, trying Finnhub...`);
      
      const resolution = interval === "weekly" ? "W" : "D";
      const to = Math.floor(Date.now() / 1000);
      const from = to - (interval === "weekly" ? 365 * 5 * 24 * 60 * 60 : 100 * 24 * 60 * 60); // 5 years or 100 days
      
      candles = await marketDataService.getCandles(symbol, resolution, from, to);
    }

    console.log(`Candles result:`, candles ? `status=${candles.s}, bars=${candles.t.length}` : 'null');

    if (!candles || candles.s !== "ok" || candles.t.length === 0) {
      return c.json({ 
        error: "No historical data available. Try another symbol or check API limits.",
        candles: []
      }, 200);
    }

    // Convert to array of objects for easier frontend consumption
    const formattedCandles = candles.t.map((timestamp, i) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: candles.o[i].toFixed(2),
      high: candles.h[i].toFixed(2),
      low: candles.l[i].toFixed(2),
      close: candles.c[i].toFixed(2),
      volume: candles.v[i],
    }));

    return c.json({ candles: formattedCandles });
  } catch (error: any) {
    console.error(`Error fetching candles for ${c.req.param("symbol")}:`, error);
    
    return c.json({ 
      error: error.message || "Failed to fetch candles",
      candles: []
    }, 200);
  }
});

marketRoutes.get("/search", async (c) => {
  try {
    const query = c.req.query("q");

    if (!query) {
      return c.json({ error: "Query parameter 'q' is required" }, 400);
    }

    // Search in database first (only show assets we have)
    const dbAssets = await prisma.asset.findMany({
      where: {
        OR: [
          { symbol: { contains: query.toUpperCase(), mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: [
        { symbol: 'asc' },
      ],
    });

    // Format results to match the expected structure
    const results = dbAssets.map(asset => ({
      symbol: asset.symbol,
      displaySymbol: asset.symbol,
      description: asset.name,
      type: asset.type,
      exchange: asset.exchange || 'US',
    }));

    return c.json({ results });
  } catch (error: any) {
    console.error("Error searching symbols:", error);
    return c.json({ error: "Failed to search symbols" }, 500);
  }
});

marketRoutes.get("/market-status", async (c) => {
  try {
    const status = await alphaVantageService.getMarketStatus();
    return c.json(status);
  } catch (error: any) {
    console.error("Error fetching market status:", error);
    return c.json({ error: "Failed to fetch market status", isOpen: false }, 500);
  }
});

marketRoutes.get("/profile/:symbol", async (c) => {
  try {
    const symbol = c.req.param("symbol");
    const profile = await marketDataService.getCompanyProfile(symbol);

    if (!profile) {
      return c.json({ error: "Profile not found or rate limit reached" }, 404);
    }

    return c.json({ profile });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Company news endpoint (for RAG/financial advisor)
marketRoutes.get("/news/company/:symbol", async (c) => {
  try {
    const symbol = c.req.param("symbol");
    const query = c.req.query();
    
    // Default to last 30 days
    const to = query.to || new Date().toISOString().split("T")[0];
    const from = query.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const news = await marketDataService.getCompanyNews(symbol, from, to);
    return c.json({ news });
  } catch (error: any) {
    console.error("Error fetching company news:", error);
    return c.json({ error: "Failed to fetch news" }, 500);
  }
});

// Market news endpoint
marketRoutes.get("/news/market", async (c) => {
  try {
    const category = c.req.query("category") || "general";
    const news = await marketDataService.getMarketNews(category);
    return c.json({ news });
  } catch (error: any) {
    console.error("Error fetching market news:", error);
    return c.json({ error: "Failed to fetch news" }, 500);
  }
});

// Top movers endpoint (gainers, losers, most active)
marketRoutes.get("/top-movers", async (c) => {
  try {
    const data = await alphaVantageService.getTopGainersLosers();
    return c.json(data);
  } catch (error: any) {
    console.error("Error fetching top movers:", error);
    return c.json({ error: "Failed to fetch top movers" }, 500);
  }
});

// Basic financials endpoint (for company analysis)
marketRoutes.get("/financials/:symbol", async (c) => {
  try {
    const symbol = c.req.param("symbol");
    const financials = await marketDataService.getBasicFinancials(symbol);

    if (!financials) {
      return c.json({ error: "Financials not found or rate limit reached" }, 404);
    }

    return c.json({ financials });
  } catch (error: any) {
    console.error("Error fetching financials:", error);
    return c.json({ error: "Failed to fetch financials" }, 500);
  }
});

// Analyst recommendations endpoint
marketRoutes.get("/recommendations/:symbol", async (c) => {
  try {
    const symbol = c.req.param("symbol");
    const recommendations = await marketDataService.getRecommendationTrends(symbol);
    return c.json({ recommendations });
  } catch (error: any) {
    console.error("Error fetching recommendations:", error);
    return c.json({ error: "Failed to fetch recommendations" }, 500);
  }
});

// SEC filings endpoint (for RAG/document analysis)
marketRoutes.get("/sec/:symbol", async (c) => {
  try {
    const symbol = c.req.param("symbol");
    const query = c.req.query();
    
    const from = query.from;
    const to = query.to;

    const filings = await marketDataService.getSECFilings(symbol, from, to);
    return c.json({ filings });
  } catch (error: any) {
    console.error("Error fetching SEC filings:", error);
    return c.json({ error: "Failed to fetch SEC filings" }, 500);
  }
});

// Earnings calendar endpoint
marketRoutes.get("/earnings", async (c) => {
  try {
    const query = c.req.query();
    const { from, to, symbol } = query;

    const calendar = await marketDataService.getEarningsCalendar(from, to, symbol);
    return c.json(calendar);
  } catch (error: any) {
    console.error("Error fetching earnings calendar:", error);
    return c.json({ error: "Failed to fetch earnings calendar" }, 500);
  }
});

// Company peers endpoint (for comparison)
marketRoutes.get("/peers/:symbol", async (c) => {
  try {
    const symbol = c.req.param("symbol");
    const peers = await marketDataService.getPeers(symbol);
    return c.json({ peers });
  } catch (error: any) {
    console.error("Error fetching peers:", error);
    return c.json({ error: "Failed to fetch peers" }, 500);
  }
});

// Financials as reported endpoint (raw SEC filings data)
marketRoutes.get("/financials/:symbol", async (c) => {
  try {
    const symbol = c.req.param("symbol");
    const query = c.req.query();
    const freq = query.freq as 'annual' | 'quarterly' | undefined;

    const financials = await marketDataService.getFinancialsAsReported(symbol, freq);
    return c.json({ financials });
  } catch (error: any) {
    console.error("Error fetching financials as reported:", error);
    return c.json({ error: "Failed to fetch financials" }, 500);
  }
});

// Combine routes
const app = new Hono();
app.route("/simulator", tradingRoutes);
app.route("/market", marketRoutes);

export default app;
