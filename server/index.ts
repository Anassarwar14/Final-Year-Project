import { Hono } from "hono";
import authController from "./modules/auth";
import privateRoutes from "./modules/private";

const app = new Hono().basePath("/api");

const routes = app
  .route("/auth", authController)
  .route("/private", privateRoutes);

export type AppType = typeof routes;
export default app;
