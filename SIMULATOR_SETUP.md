# Wealth - Trading Simulator Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in the following values:

#### Database (Supabase)
- Get your connection strings from [Supabase Dashboard](https://supabase.com/dashboard)
- `DATABASE_URL`: Pooler connection (Transaction mode)
- `DIRECT_URL`: Direct connection for migrations

#### Better Auth
- `BETTER_AUTH_SECRET`: Generate with `openssl rand -base64 32`
- `BETTER_AUTH_URL`: `http://localhost:3000` for development

#### Finnhub API
1. Sign up at [Finnhub.io](https://finnhub.io)
2. Get your API key from the dashboard
3. Free tier: 60 API calls/minute

#### Upstash Redis
1. Create account at [Upstash](https://upstash.com)
2. Create a Redis database
3. Copy REST URL and Token from dashboard

### 3. Run Database Migrations

```bash
cd server
npx prisma migrate dev
cd ..
```

This will:
- Create all database tables
- Generate Prisma Client

### 4. Seed Asset Database

```bash
cd server
npx tsx prisma/seeds/assets.ts
```

This seeds:
- Top 100 S&P 500 stocks
- 20 popular ETFs
- 10 major cryptocurrencies

**Note**: Seeding takes ~3 minutes due to Finnhub rate limits (1 request/second)

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📊 Trading Simulator Features

### Backend API Endpoints

All simulator endpoints require authentication.

#### Profile Management
- `POST /api/trading/simulator/initialize` - Create simulator profile ($100k starting balance)
- `GET /api/trading/simulator/profile` - Get profile with holdings and total value

#### Trading
- `POST /api/trading/simulator/trade` - Execute buy/sell orders
  ```json
  {
    "assetId": "AAPL",
    "type": "BUY",
    "quantity": 10,
    "pricePerUnit": 150.50
  }
  ```
- `GET /api/trading/simulator/holdings` - Get all positions with P&L

#### History & Performance
- `GET /api/trading/simulator/history` - Transaction history with pagination
  - Query params: `assetId`, `type`, `from`, `to`, `cursor`, `limit`
- `POST /api/trading/simulator/snapshot` - Create daily performance snapshot
- `GET /api/trading/simulator/snapshots` - Get performance history for charts

#### Watchlist
- `POST /api/trading/simulator/watchlist` - Add symbol to watchlist
- `GET /api/trading/simulator/watchlist` - Get watchlist with live prices
- `PATCH /api/trading/simulator/watchlist/:id` - Update price alerts
- `DELETE /api/trading/simulator/watchlist/:id` - Remove from watchlist

### Market Data Endpoints (Public)

- `GET /api/trading/market/quote/:symbol` - Real-time quote
- `GET /api/trading/market/candles/:symbol` - Historical OHLCV data
  - Query params: `resolution` (1, 5, 15, 30, 60, D, W, M), `from`, `to` (Unix timestamps)
- `GET /api/trading/market/search?q=query` - Search symbols
- `GET /api/trading/market/profile/:symbol` - Company profile

## 🎨 Design System

### Color Tokens

```css
--color-positive: #10b981;  /* Gains */
--color-negative: #ef4444;  /* Losses */
--color-neutral-emphasis: var(--primary);
```

### Spacing Scale

```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
```

### Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### Animation Durations

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

## 📈 Caching Strategy

### Redis Caching

- **Quotes**: 15-second TTL (real-time pricing)
- **Candles**: 5-minute TTL (historical data)
- **Company Profiles**: 24-hour TTL (static data)
- **Search Results**: 1-hour TTL

### Rate Limiting

- Finnhub free tier: 60 calls/minute
- Redis tracks: 50 calls/minute (buffer)
- Automatic fallback to cached data when limit reached

## 🔧 Development Commands

```bash
# Generate Prisma Client after schema changes
npm run prisma:generate

# Create new migration
cd server
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Format code
npm run format

# Lint code
npm run lint
```

## 🚨 Troubleshooting

### Migration Failed

```bash
cd server
npx prisma migrate reset
npx prisma migrate dev
```

### Redis Connection Error

- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
- Test connection in Upstash console

### Finnhub Rate Limit

- Check API key is valid
- Free tier: 60 calls/min
- Upgrade to paid tier for higher limits

### Asset Seeding Failed

- Some symbols may not have profiles in Finnhub
- Seeding continues despite individual failures
- Check console for success/failure counts

## 📝 Project Structure

```
├── app/
│   ├── dashboard/
│   │   └── simulator/
│   │       ├── page.tsx          # Main trading interface
│   │       ├── portfolio/        # Portfolio analytics
│   │       ├── history/          # Transaction history
│   │       └── watchlist/        # Watchlist management
│   └── globals.css               # Design tokens
├── server/
│   ├── modules/
│   │   └── trading/              # Trading API
│   │       ├── controller.ts
│   │       ├── service.ts
│   │       ├── validation.ts
│   │       └── index.ts
│   ├── services/
│   │   └── marketDataService.ts  # Finnhub integration
│   ├── lib/
│   │   ├── redis.ts              # Redis client
│   │   ├── db.ts                 # Prisma client
│   │   └── auth.ts               # Better Auth
│   └── prisma/
│       ├── schema.prisma         # Database schema
│       └── seeds/
│           └── assets.ts         # Asset seeding script
└── components/
    └── simulator/                # Trading UI components
```

## 🎯 Next Steps

1. Run migrations: `cd server && npx prisma migrate dev`
2. Seed assets: `npx tsx prisma/seeds/assets.ts`
3. Start dev server: `npm run dev`
4. Initialize simulator profile: Visit `/dashboard/simulator`
5. Start trading!

## 📚 Additional Resources

- [Finnhub API Docs](https://finnhub.io/docs/api)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)
