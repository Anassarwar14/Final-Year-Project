import { Router } from 'express';
import * as portfolioController from '../controllers/portfolioController';

// Note: In a real application, you should add middleware like `authenticateUser` 
// to ensure users can only access their own portfolios.

const router = Router();

// 1. Create a new portfolio
router.post('/', portfolioController.createPortfolio);

// 2. Get all portfolios for a specific user
router.get('/user/:userId', portfolioController.getUserPortfolios);

// 3. Get detailed view of a specific portfolio (holdings, value)
router.get('/:id', portfolioController.getPortfolioById);

// 4. Execute a BUY order
router.post('/buy', portfolioController.buyAsset);

// 5. Execute a SELL order
router.post('/sell', portfolioController.sellAsset);

// 6. Get transaction history for a portfolio
router.get('/:id/transactions', portfolioController.getTransactions);

// 7. Deposit or Withdraw Cash
router.post('/:id/cash', portfolioController.manageCash);

export default router;