import { PrismaClient } from "@prisma/client";
import { marketDataService } from "../../services/marketDataService";

const prisma = new PrismaClient();

// Top 100 S&P 500 stocks + popular ETFs + crypto
const SEED_ASSETS = {
  stocks: [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK.B", "LLY", "AVGO",
    "JPM", "V", "UNH", "XOM", "MA", "COST", "HD", "PG", "JNJ", "ABBV",
    "NFLX", "CRM", "BAC", "KO", "MRK", "CVX", "AMD", "PEP", "ADBE", "TMO",
    "ACN", "WMT", "CSCO", "ABT", "LIN", "MCD", "DIS", "PM", "GE", "INTU",
    "VZ", "CMCSA", "TXN", "IBM", "QCOM", "ORCL", "AMGN", "HON", "NEE", "SBUX",
    "UNP", "CAT", "RTX", "LOW", "SPGI", "PFE", "GS", "DE", "BKNG", "BA",
    "BLK", "AXP", "MDLZ", "ISRG", "ELV", "SYK", "GILD", "ADI", "TJX", "MMC",
    "C", "VRTX", "REGN", "PLD", "ADP", "CB", "SCHW", "ZTS", "MO", "SO",
    "CI", "NOW", "LRCX", "BSX", "CME", "DUK", "ITW", "PANW", "EOG", "BDX",
    "WM", "CL", "FI", "APH", "EQIX", "SLB", "HCA", "TT", "PH", "USB"
  ],
  etfs: [
    "SPY",   // S&P 500
    "QQQ",   // Nasdaq 100
    "VOO",   // Vanguard S&P 500
    "VTI",   // Total Stock Market
    "IWM",   // Russell 2000
    "EEM",   // Emerging Markets
    "VEA",   // Developed Markets
    "AGG",   // Bond Aggregate
    "GLD",   // Gold
    "SLV",   // Silver
    "XLF",   // Financials
    "XLK",   // Technology
    "XLE",   // Energy
    "XLV",   // Healthcare
    "XLY",   // Consumer Discretionary
    "XLP",   // Consumer Staples
    "XLI",   // Industrials
    "XLU",   // Utilities
    "XLRE",  // Real Estate
    "VIG",   // Dividend Appreciation
  ],
  crypto: [
    "BTCUSD",  // Bitcoin
    "ETHUSD",  // Ethereum
    "BNBUSD",  // Binance Coin
    "SOLUSD",  // Solana
    "ADAUSD",  // Cardano
    "XRPUSD",  // Ripple
    "DOGEUSD", // Dogecoin
    "MATICUSD", // Polygon
    "DOTUSD",  // Polkadot
    "AVAXUSD", // Avalanche
  ],
};

async function seedAssets() {
  console.log("🌱 Starting asset seeding...\n");

  let successCount = 0;
  let failCount = 0;

  // Seed stocks
  console.log("📈 Seeding stocks...");
  // Manual fallback for tickers that don't have Finnhub profiles
  const stockFallbacks: Record<string, string> = {
    FI: "Fidelity National Information Services Inc",
  };

  for (const symbol of SEED_ASSETS.stocks) {
    try {
      const profile = await marketDataService.getCompanyProfile(symbol);

      if (profile && profile.name) {
        await prisma.asset.upsert({
          where: { id: symbol },
          update: {
            name: profile.name,
            symbol: symbol,
            exchange: profile.exchange || "US",
            currency: profile.currency || "USD",
            logoUrl: profile.logo,
            type: "STOCK",
          },
          create: {
            id: symbol,
            name: profile.name,
            symbol: symbol,
            exchange: profile.exchange || "US",
            currency: profile.currency || "USD",
            logoUrl: profile.logo,
            type: "STOCK",
          },
        });
        console.log(`✓ ${symbol} - ${profile.name}`);
        successCount++;
      } else if (stockFallbacks[symbol]) {
        // Use fallback for known problematic tickers
        await prisma.asset.upsert({
          where: { id: symbol },
          update: {
            name: stockFallbacks[symbol],
            symbol: symbol,
            exchange: "US",
            currency: "USD",
            type: "STOCK",
          },
          create: {
            id: symbol,
            name: stockFallbacks[symbol],
            symbol: symbol,
            exchange: "US",
            currency: "USD",
            type: "STOCK",
          },
        });
        console.log(`✓ ${symbol} - ${stockFallbacks[symbol]} (fallback)`);
        successCount++;
      } else {
        console.log(`⚠ ${symbol} - Skipped (no profile data)`);
        failCount++;
      }

      // Small delay to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`✗ ${symbol} - Failed:`, error);
      failCount++;
    }
  }

  // Seed ETFs (Finnhub free tier doesn't provide ETF profiles, use hardcoded names)
  console.log("\n📊 Seeding ETFs...");
  const etfNames: Record<string, string> = {
    SPY: "SPDR S&P 500 ETF Trust",
    QQQ: "Invesco QQQ Trust",
    VOO: "Vanguard S&P 500 ETF",
    VTI: "Vanguard Total Stock Market ETF",
    IWM: "iShares Russell 2000 ETF",
    EEM: "iShares MSCI Emerging Markets ETF",
    VEA: "Vanguard FTSE Developed Markets ETF",
    AGG: "iShares Core U.S. Aggregate Bond ETF",
    GLD: "SPDR Gold Trust",
    SLV: "iShares Silver Trust",
    XLF: "Financial Select Sector SPDR Fund",
    XLK: "Technology Select Sector SPDR Fund",
    XLE: "Energy Select Sector SPDR Fund",
    XLV: "Health Care Select Sector SPDR Fund",
    XLY: "Consumer Discretionary Select Sector SPDR Fund",
    XLP: "Consumer Staples Select Sector SPDR Fund",
    XLI: "Industrial Select Sector SPDR Fund",
    XLU: "Utilities Select Sector SPDR Fund",
    XLRE: "Real Estate Select Sector SPDR Fund",
    VIG: "Vanguard Dividend Appreciation ETF",
  };

  for (const symbol of SEED_ASSETS.etfs) {
    try {
      await prisma.asset.upsert({
        where: { id: symbol },
        update: {
          name: etfNames[symbol] || symbol,
          symbol: symbol,
          exchange: "US",
          currency: "USD",
          type: "ETF",
        },
        create: {
          id: symbol,
          name: etfNames[symbol] || symbol,
          symbol: symbol,
          exchange: "US",
          currency: "USD",
          type: "ETF",
        },
      });
      console.log(`✓ ${symbol} - ${etfNames[symbol]}`);
      successCount++;

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`✗ ${symbol} - Failed:`, error);
      failCount++;
    }
  }

  // Seed crypto
  console.log("\n₿ Seeding cryptocurrencies...");
  for (const symbol of SEED_ASSETS.crypto) {
    try {
      // Crypto profiles might not be available in Finnhub, so we'll use default names
      const cryptoNames: Record<string, string> = {
        BTCUSD: "Bitcoin",
        ETHUSD: "Ethereum",
        BNBUSD: "Binance Coin",
        SOLUSD: "Solana",
        ADAUSD: "Cardano",
        XRPUSD: "Ripple",
        DOGEUSD: "Dogecoin",
        MATICUSD: "Polygon",
        DOTUSD: "Polkadot",
        AVAXUSD: "Avalanche",
      };

      await prisma.asset.upsert({
        where: { id: symbol },
        update: {
          name: cryptoNames[symbol] || symbol,
          symbol: symbol,
          exchange: "CRYPTO",
          currency: "USD",
          type: "CRYPTO",
        },
        create: {
          id: symbol,
          name: cryptoNames[symbol] || symbol,
          symbol: symbol,
          exchange: "CRYPTO",
          currency: "USD",
          type: "CRYPTO",
        },
      });
      console.log(`✓ ${symbol} - ${cryptoNames[symbol]}`);
      successCount++;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`✗ ${symbol} - Failed:`, error);
      failCount++;
    }
  }

  console.log(`\n✨ Seeding complete!`);
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`📊 Total: ${successCount + failCount}`);
}

seedAssets()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
