// import { pool } from "../config/db";

// export const fetchPortfolio = async () => {
//   // Example query
//   const result = await pool.query("SELECT * FROM portfolios LIMIT 10");
//   return result.rows;
// };

// export const fetchAnalytics = async () => {
//   return { roi: "8.5%", riskLevel: "Moderate" };
// };

// export const fetchHoldings = async () => {
//   const result = await pool.query("SELECT * FROM holdings");
//   return result.rows;
// };

// export const fetchPerformance = async () => {
//   return { overallGrowth: "15%", pastMonth: "2%", pastYear: "12%" };
// };


// import { prisma } from "../config/prisma";
// Make sure the path and file exist, or update to the correct path if needed
import { pool } from "../config/db"; // Update path if necessary, e.g. "./db" or "../db"
import Decimal from "decimal.js";

// ---------------- Portfolio CRUD ----------------

export const createPortfolio = async ({ userId, name, description, cashBalance }: any) => {
  return await pool.portfolio.create({
    data: { userId, name, description, cashBalance: new Decimal(cashBalance) }
  });
};

export const getAllPortfolios = async () => {
  return await pool.portfolio.findMany({
    include: { holdings: { include: { asset: true } }, transactions: true }
  });
};

export const getPortfolioById = async (id: string) => {
  return await pool.portfolio.findUnique({
    where: { id },
    include: { holdings: { include: { asset: true } }, transactions: true, performanceSnapshots: true }
  });
};

export const updatePortfolio = async (id: string, data: any) => {
  if (data.cashBalance) data.cashBalance = new Decimal(data.cashBalance);
  return await pool.portfolio.update({ where: { id }, data });
};

export const deletePortfolio = async (id: string) => {
  return await pool.portfolio.delete({ where: { id } });
};

// ---------------- Portfolio Overview ----------------
export const getPortfolioOverview = async (portfolioId: string) => {
  const portfolio = await pool.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      holdings: { include: { asset: true } },
      transactions: true,
      performanceSnapshots: true
    }
  });

  if (!portfolio) return null;

  // Analytics: Sector allocation
  const allocation: Record<string, number> = {};
  portfolio.holdings.forEach((h: any) => {
    const sector = (h.asset && (h.asset.type || "Unknown")) || "Unknown";
    const value = h.quantity.toNumber() * h.averageBuyPrice.toNumber();
    allocation[sector] = (allocation[sector] || 0) + value;
  });

  return {
    profile: {
      totalValue: portfolio.cashBalance.toNumber() + portfolio.holdings.reduce((sum: number, h: any) => sum + h.quantity.toNumber() * h.averageBuyPrice.toNumber(), 0),
      investedValue: portfolio.holdings.reduce((sum: number, h: any) => sum + h.quantity.toNumber() * h.averageBuyPrice.toNumber(), 0),
      cashBalance: portfolio.cashBalance.toNumber()
    },
    holdings: portfolio.holdings,
    analytics: { sectorAllocation: allocation },
    snapshots: portfolio.performanceSnapshots.map((s: any) => ({
      createdAt: s.date,
      totalValue: s.totalValue.toNumber(),
      holdings: s.holdingsValue.toNumber(),
      cash: s.cashValue.toNumber()
    }))
  };
};

// ---------------- Holdings CRUD ----------------
export const addHolding = async (portfolioId: string, data: any) => {
  data.quantity = new Decimal(data.quantity);
  data.averageBuyPrice = new Decimal(data.averageBuyPrice);
  return await pool.holding.create({
    data: { ...data, portfolioId }
  });
};

export const updateHolding = async (holdingId: string, data: any) => {
  if (data.quantity) data.quantity = new Decimal(data.quantity);
  if (data.averageBuyPrice) data.averageBuyPrice = new Decimal(data.averageBuyPrice);
  return await pool.holding.update({ where: { id: holdingId }, data });
};

export const deleteHolding = async (holdingId: string) => {
  return await pool.holding.delete({ where: { id: holdingId } });
};

// ---------------- Transactions ----------------
export const addTransaction = async (portfolioId: string, data: any) => {
  data.quantity = new Decimal(data.quantity);
  data.pricePerUnit = new Decimal(data.pricePerUnit);
  return await pool.transaction.create({
    data: { ...data, portfolioId }
  });
};
