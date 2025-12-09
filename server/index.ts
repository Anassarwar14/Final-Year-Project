import { Hono } from "hono";
import authController from "./modules/auth";
import privateRoutes from "./modules/private";
import tradingRoutes from "./modules/trading";
import newsRoutes from "./modules/news";
import portfolioRoutes from "./modules/portfolio";

const app = new Hono().basePath("/api");

const routes = app
  .route("/auth", authController)
  .route("/private", privateRoutes)
  .route("/trading", tradingRoutes)
  .route("/news", newsRoutes)
  .route("/portfolio", portfolioRoutes);

export type AppType = typeof routes;
export default app;
