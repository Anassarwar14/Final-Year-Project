import { Router } from 'express';
import * as newsController from '../controllers/newsController';
// import { isAdmin, isAuthenticated } from '../middleware/authMiddleware'; // Example middleware

const router = Router();

// Public routes
router.get('/', newsController.getAllNews);
router.get('/analytics', newsController.getNewsAnalytics);
router.get('/calendar', newsController.getNewsCalendarData);
router.get('/:id', newsController.getNewsArticleById);

// Admin route
// Add authentication middleware here
router.post('/fetch', /* isAdmin, */ newsController.triggerNewsFetch);

export default router;