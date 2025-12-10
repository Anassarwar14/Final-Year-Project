// import express from "express";
// import { getPortfolio, getAnalytics, getHoldings, getPerformance } from "../controllers/portfolioController";

// const router = express.Router();

// // router.get("/", getPortfolio);
// router.get("/overview", getPortfolioOverview);
// router.get("/analytics", getAnalytics);
// router.get("/holdings", getHoldings);
// router.get("/performance", getPerformance);

// export default router;

import express from "express";
import {
  createPortfolio,
  getPortfolioById,
  getPortfolios,
  updatePortfolio,
  deletePortfolio,
  addHolding,
  updateHolding,
  deleteHolding,
  addTransaction,
  getPortfolioOverview
} from "../controllers/portfolioController";

const router = express.Router();

// Portfolio CRUD
router.post("/", createPortfolio);
router.get("/", getPortfolios);
router.get("/overview/:id", getPortfolioOverview); // Portfolio + analytics + snapshots
router.get("/:id", getPortfolioById);
router.put("/:id", updatePortfolio);
router.delete("/:id", deletePortfolio);

// Holdings CRUD (nested under portfolio)
router.post("/:id/holdings", addHolding);
router.put("/:id/holdings/:holdingId", updateHolding);
router.delete("/:id/holdings/:holdingId", deleteHolding);

// Transactions
router.post("/:id/transactions", addTransaction);

export default router;
