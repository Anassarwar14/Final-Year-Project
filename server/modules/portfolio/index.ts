import { Hono } from "hono";
import { portfolioController } from "./controller";
import { auth } from "../../lib/auth";
import privateRoutesMiddleware from "../../middleware";

const portfolioRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// Apply authentication middleware to all portfolio routes
portfolioRoutes.use("/*", privateRoutesMiddleware);

// All portfolio routes require authentication
portfolioRoutes.get("/overview", portfolioController.getOverview);
portfolioRoutes.get("/performance", portfolioController.getPerformance);
portfolioRoutes.get("/insights", portfolioController.getInsights);
portfolioRoutes.get("/news", portfolioController.getNews);

export default portfolioRoutes;
