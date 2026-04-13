import { Hono } from "hono";
import { RAGService } from "./service";

const app = new Hono();

app.post("/ingest/:ticker", async (c) => {
  const ticker = c.req.param("ticker").toUpperCase();
  
  if (!ticker) {
    return c.json({ error: "Ticker is required" }, 400);
  }

  try {
    const result = await RAGService.ingestCompanyContext(ticker);
    return c.json({
      message: `Successfully ingested context for ${ticker}`,
      data: result,
    });
  } catch (error: any) {
    console.error(`Error in /rag/ingest/${ticker}:`, error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/ingest", async (c) => {
  try {
    const body = await c.req.json();
    const tickers = Array.isArray(body?.tickers) ? body.tickers : [];

    if (!tickers.length) {
      return c.json({ error: "tickers array is required" }, 400);
    }

    const results = await RAGService.ingestTickers(tickers);
    return c.json({
      message: "Batch ingestion complete",
      data: results,
    });
  } catch (error: any) {
    console.error("Error in /rag/ingest:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/refresh/mvp", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const maxTickers = Math.max(1, Number(body?.maxTickers || process.env.RAG_REFRESH_MAX_TICKERS || 10));

    const summary = await RAGService.refreshMvpUniverseTickers(maxTickers);
    return c.json({
      message: "MVP universe refresh complete",
      data: summary,
    });
  } catch (error: any) {
    console.error("Error in /rag/refresh/mvp:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.get("/ingest/status/:ticker", async (c) => {
  const ticker = c.req.param("ticker").toUpperCase();

  if (!ticker) {
    return c.json({ error: "Ticker is required" }, 400);
  }

  try {
    const status = await RAGService.getIngestionStatus(ticker);
    return c.json({ data: status });
  } catch (error: any) {
    console.error(`Error in /rag/ingest/status/${ticker}:`, error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/search", async (c) => {
  try {
    const body = await c.req.json();
    const { query, matchCount, documentType, ticker, sourceTypes, dateFrom, dateTo } = body;

    if (!query) {
      return c.json({ error: "Query is required" }, 400);
    }

    const results = await RAGService.searchSimilarDocuments(query, matchCount || 5, documentType, {
      ticker,
      sourceTypes,
      dateFrom,
      dateTo,
    });
    return c.json({ results });
  } catch (error: any) {
    console.error("Error in /rag/search:", error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;
