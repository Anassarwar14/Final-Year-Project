import { pool } from "../config/db";

export const fetchPortfolio = async () => {
  // Example query
  const result = await pool.query("SELECT * FROM portfolios LIMIT 10");
  return result.rows;
};

export const fetchAnalytics = async () => {
  return { roi: "8.5%", riskLevel: "Moderate" };
};

export const fetchHoldings = async () => {
  const result = await pool.query("SELECT * FROM holdings");
  return result.rows;
};

export const fetchPerformance = async () => {
  return { overallGrowth: "15%", pastMonth: "2%", pastYear: "12%" };
};
