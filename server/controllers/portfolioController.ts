import { Request, Response } from "express";
import * as portfolioService from "../services/portfolioServices";

export const getPortfolio = async (req: Request, res: Response) => {
  try {
    const data = await portfolioService.fetchPortfolio();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching portfolio data" });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await portfolioService.fetchAnalytics();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching analytics" });
  }
};

export const getHoldings = async (req: Request, res: Response) => {
  try {
    const data = await portfolioService.fetchHoldings();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching holdings" });
  }
};

export const getPerformance = async (req: Request, res: Response) => {
  try {
    const data = await portfolioService.fetchPerformance();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching performance" });
  }
};
