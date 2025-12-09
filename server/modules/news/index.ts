import { Hono } from "hono";
import { newsController } from "./controller";
import { auth } from "../../lib/auth";

const newsRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// Public routes
newsRoutes.get("/market", newsController.getMarketNews);
newsRoutes.get("/trending", newsController.getTrendingStocks);

// Private routes (require authentication)
newsRoutes.get("/personalized", newsController.getPersonalizedNews);
newsRoutes.get("/earnings", newsController.getUpcomingEarnings);

export default newsRoutes;
