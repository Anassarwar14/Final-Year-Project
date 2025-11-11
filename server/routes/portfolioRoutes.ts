import express from "express";
import { getPortfolio, getAnalytics, getHoldings, getPerformance } from "../controllers/portfolioController";

const router = express.Router();

router.get("/", getPortfolio);
router.get("/analytics", getAnalytics);
router.get("/holdings", getHoldings);
router.get("/performance", getPerformance);

export default router;