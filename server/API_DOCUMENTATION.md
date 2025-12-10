# Trading Simulator API Endpoints

## 🔐 Authentication
All routes marked with 🔒 require authentication via Better Auth session.

---

## 📊 Trading Module (`/api/trading/`)

### Simulator Routes 🔒
- `POST /simulator/initialize` - Initialize trading profile ($100k starting balance)
- `GET /simulator/profile` - Get profile with live P&L
- `POST /simulator/trade` - Execute buy/sell trade
- `GET /simulator/holdings` - Get all holdings with real-time prices
- `GET /simulator/history` - Get transaction history (paginated)
- `POST /simulator/snapshot` - Create daily portfolio snapshot
- `GET /simulator/snapshots` - Get historical snapshots

### Watchlist Routes 🔒
- `POST /simulator/watchlist` - Add stock to watchlist
- `GET /simulator/watchlist` - Get all watchlist items
- `PATCH /simulator/watchlist/:id` - Update price alerts
- `DELETE /simulator/watchlist/:id` - Remove from watchlist

### Market Data Routes (Public)
- `GET /market/quote/:symbol` - Real-time quote
- `GET /market/candles/:symbol?resolution=D&from=1234&to=5678` - OHLCV data
- `GET /market/search?q=AAPL` - Symbol search
- `GET /market/profile/:symbol` - Company profile
- `GET /market/news/company/:symbol?from=2025-01-01&to=2025-12-31` - Company news
- `GET /market/news/market?category=general` - Market news (general, forex, crypto, merger)
- `GET /market/financials/:symbol` - Basic financials (PE, market cap, etc.)
- `GET /market/recommendations/:symbol` - Analyst recommendations
- `GET /market/sec/:symbol?from=2025-01-01&to=2025-12-31` - SEC filings
- `GET /market/earnings?from=2025-01-01&to=2025-12-31&symbol=AAPL` - Earnings calendar
- `GET /market/peers/:symbol` - Similar companies

---

## 📰 News Module (`/api/news/`)

### Public Routes
- `GET /news/market?category=general` - General market news
- `GET /news/trending?limit=10` - Trending stocks by news volume

### Private Routes 🔒
- `GET /news/personalized?days=7` - Personalized feed based on holdings/watchlist
- `GET /news/earnings?days=30` - Upcoming earnings for your holdings

---

## 💼 Portfolio Module (`/api/portfolio/`)

All routes require authentication 🔒

- `GET /portfolio/overview` - Enhanced portfolio with live P&L, sector allocation
- `GET /portfolio/performance?days=30` - Portfolio performance over time
- `GET /portfolio/insights` - Analyst recommendations + fundamentals for holdings
- `GET /portfolio/news?days=7` - Aggregated news for all holdings

---

## 🎯 Data Flow Examples

### Example 1: Personalized News Feed
```typescript
// Frontend
const { data } = useSWR('/api/news/personalized?days=7', fetcher);

// Returns:
{
  marketNews: [...],        // General market news
  holdingsNews: [          // News for your stocks
    { ...article, symbol: 'AAPL', inHoldings: true }
  ],
  watchlistNews: [...],    // News for watchlist
  summary: {
    totalHoldings: 5,
    newsCount: { market: 20, holdings: 15, watchlist: 8 }
  }
}
```

### Example 2: Portfolio with Live Data
```typescript
const { data } = useSWR('/api/portfolio/overview', fetcher);

// Returns:
{
  profile: { balance, totalValue, investedValue },
  holdings: [
    {
      asset: { symbol: 'AAPL', name: 'Apple Inc' },
      quantity: 10,
      averagePrice: 150,
      currentPrice: 175,  // Live from Finnhub
      unrealizedPnL: 250,
      unrealizedPnLPercent: 16.67,
      quote: { c, d, dp, h, l, o, pc, t }
    }
  ],
  analytics: {
    totalUnrealizedPnL: 1500,
    sectorAllocation: { Technology: 50000, Healthcare: 30000 }
  }
}
```

### Example 3: News Module in Dashboard
```typescript
// Get market-wide news
const marketNews = await fetch('/api/news/market?category=general');

// Get personalized feed
const personalFeed = await fetch('/api/news/personalized?days=7');

// Get trending stocks
const trending = await fetch('/api/news/trending?limit=10');
```

---

## 🔄 Cross-Module Integration

### Scenario: Portfolio Dashboard Page
1. **Portfolio Module** → Get holdings with live prices + analytics
2. **News Module** → Get personalized news for those holdings
3. **Market Data** → Get analyst recommendations for each holding
4. **Trading Module** → Quick trade execution

### Scenario: Stock Detail Page (e.g., /stock/AAPL)
1. **Market Data** → Quote, candles, company profile
2. **Market Data** → News, SEC filings, peers
3. **Market Data** → Financials, recommendations
4. **Trading Module** → Check if in holdings/watchlist, execute trades

### Scenario: News Page
1. **News Module** → Personalized feed from holdings
2. **News Module** → Trending stocks by news volume
3. **News Module** → Upcoming earnings for holdings
4. **Market Data** → Quotes for trending stocks

---

## 🚀 Rate Limiting & Caching

- **Finnhub Free Tier**: 60 calls/min
- **Internal Limit**: 50 calls/min (buffer)
- **Redis Caching**:
  - Quotes: 15 seconds
  - Candles: 5 minutes
  - Company profiles: 24 hours
  - News: 15-60 minutes
  - Search: 5 minutes

---

## 📝 Future RAG Integration

All these endpoints provide data that can be used for RAG-powered financial advisor:

1. **Company News** → Vector embeddings for semantic search
2. **SEC Filings** → Document analysis and Q&A
3. **Analyst Recommendations** → Structured data for insights
4. **Basic Financials** → Quantitative analysis
5. **Earnings Calendar** → Event-based alerts
6. **Portfolio Context** → Personalized advice based on holdings

### RAG Flow (Future):
```
User: "Should I hold AAPL or sell?"

AI Agent:
1. Fetch user's AAPL holding → `/api/portfolio/overview`
2. Get recent news → `/api/market/news/company/AAPL`
3. Get analyst recommendations → `/api/market/recommendations/AAPL`
4. Get fundamentals → `/api/market/financials/AAPL`
5. Retrieve similar past scenarios from vector DB
6. Generate contextual advice with citations
```
