// import { Request, Response } from "express";
// import * as portfolioService from "../services/portfolioServices";

// export const getPortfolio = async (req: Request, res: Response) => {
//   try {
//     const data = await portfolioService.fetchPortfolio();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: "Error fetching portfolio data" });
//   }
// };

// export const getAnalytics = async (req: Request, res: Response) => {
//   try {
//     const data = await portfolioService.fetchAnalytics();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: "Error fetching analytics" });
//   }
// };

// export const getHoldings = async (req: Request, res: Response) => {
//   try {
//     const data = await portfolioService.fetchHoldings();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: "Error fetching holdings" });
//   }
// };

// export const getPerformance = async (req: Request, res: Response) => {
//   try {
//     const data = await portfolioService.fetchPerformance();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: "Error fetching performance" });
//   }
// };

// export const getPortfolioOverview = async (req: Request, res: Response) => {
//   try {
//     const profile = await portfolioService.fetchPortfolio();
//     const holdings = await portfolioService.fetchHoldings();
//     const analytics = await portfolioService.fetchAnalytics(holdings);
//     const snapshots = await portfolioService.fetchPerformanceSnapshots();

//     res.json({
//       profile,
//       holdings,
//       analytics,
//       snapshots,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error fetching portfolio overview" });
//   }
// };

import { Request, Response } from "express";
import * as portfolioService from "../services/portfolioServices";

// ---------------- Portfolio CRUD ----------------

// Create new portfolio
export const createPortfolio = async (req: Request, res: Response) => {
  try {
    const { userId, name, description, cashBalance } = req.body;
    const portfolio = await portfolioService.createPortfolio({ userId, name, description, cashBalance });
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: "Error creating portfolio", details: err });
  }
};

// Get all portfolios
export const getPortfolios = async (req: Request, res: Response) => {
  try {
    const portfolios = await portfolioService.getAllPortfolios();
    res.json(portfolios);
  } catch (err) {
    res.status(500).json({ error: "Error fetching portfolios" });
  }
};

// Get portfolio by ID
export const getPortfolioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const portfolio = await portfolioService.getPortfolioById(id);
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: "Error fetching portfolio" });
  }
};

// Update portfolio
export const updatePortfolio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const portfolio = await portfolioService.updatePortfolio(id, req.body);
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: "Error updating portfolio" });
  }
};

// Delete portfolio
export const deletePortfolio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await portfolioService.deletePortfolio(id);
    res.json({ message: "Portfolio deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting portfolio" });
  }
};

// ---------------- Portfolio Overview ----------------
export const getPortfolioOverview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const overview = await portfolioService.getPortfolioOverview(id);
    res.json(overview);
  } catch (err) {
    res.status(500).json({ error: "Error fetching portfolio overview" });
  }
};

// ---------------- Holdings CRUD ----------------
export const addHolding = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const holding = await portfolioService.addHolding(id, req.body);
    res.json(holding);
  } catch (err) {
    res.status(500).json({ error: "Error adding holding" });
  }
};

export const updateHolding = async (req: Request, res: Response) => {
  try {
    const { holdingId } = req.params;
    const holding = await portfolioService.updateHolding(holdingId, req.body);
    res.json(holding);
  } catch (err) {
    res.status(500).json({ error: "Error updating holding" });
  }
};

export const deleteHolding = async (req: Request, res: Response) => {
  try {
    const { holdingId } = req.params;
    await portfolioService.deleteHolding(holdingId);
    res.json({ message: "Holding deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting holding" });
  }
};

// ---------------- Transactions ----------------
export const addTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await portfolioService.addTransaction(id, req.body);
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: "Error adding transaction" });
  }
};
