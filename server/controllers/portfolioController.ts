import { Request, Response } from 'express';
import * as portfolioService from '../services/portfolioServices';

// --- Create Portfolio ---
export const createPortfolio = async (req: Request, res: Response) => {
  try {
    const { userId, name, description } = req.body;
    
    if (!userId || !name) {
      return res.status(400).json({ message: "User ID and Portfolio Name are required" });
    }

    const newPortfolio = await portfolioService.createPortfolio({ userId, name, description });
    res.status(201).json(newPortfolio);
  } catch (error) {
    res.status(500).json({ message: "Error creating portfolio", error: (error as Error).message });
  }
};

// --- Get All User Portfolios ---
export const getUserPortfolios = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const portfolios = await portfolioService.getUserPortfolios(userId);
    res.status(200).json(portfolios);
  } catch (error) {
    res.status(500).json({ message: "Error fetching portfolios", error: (error as Error).message });
  }
};

// --- Get Single Portfolio Details ---
export const getPortfolioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const portfolio = await portfolioService.getPortfolioById(id);
    
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    
    res.status(200).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Error fetching portfolio details", error: (error as Error).message });
  }
};

// --- Buy Asset ---
export const buyAsset = async (req: Request, res: Response) => {
  try {
    const { portfolioId, assetSymbol, quantity, pricePerUnit } = req.body;

    const transaction = await portfolioService.buyAsset({
      portfolioId,
      assetSymbol,
      quantity,
      pricePerUnit
    });

    res.status(200).json({ message: "Buy order executed successfully", transaction });
  } catch (error) {
    res.status(400).json({ message: "Buy order failed", error: (error as Error).message });
  }
};

// --- Sell Asset ---
export const sellAsset = async (req: Request, res: Response) => {
  try {
    const { portfolioId, assetSymbol, quantity, pricePerUnit } = req.body;

    const transaction = await portfolioService.sellAsset({
      portfolioId,
      assetSymbol,
      quantity,
      pricePerUnit
    });

    res.status(200).json({ message: "Sell order executed successfully", transaction });
  } catch (error) {
    res.status(400).json({ message: "Sell order failed", error: (error as Error).message });
  }
};

// --- Get Transactions ---
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Portfolio ID
    const transactions = await portfolioService.getPortfolioTransactions(id);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error: (error as Error).message });
  }
};

// --- Manage Cash (Deposit/Withdraw) ---
export const manageCash = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Portfolio ID
    const { amount, type } = req.body; // type: 'DEPOSIT' | 'WITHDRAW'

    if (!amount || amount <= 0 || !['DEPOSIT', 'WITHDRAW'].includes(type)) {
      return res.status(400).json({ message: "Invalid amount or transaction type" });
    }

    const updatedPortfolio = await portfolioService.manageCash(id, amount, type);
    res.status(200).json({ message: "Cash updated successfully", cashBalance: updatedPortfolio.cashBalance });
  } catch (error) {
    res.status(400).json({ message: "Cash update failed", error: (error as Error).message });
  }
};