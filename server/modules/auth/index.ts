import { auth } from "@/server/lib/auth";
import { Hono } from "hono";

const authController = new Hono().on(["POST", "GET"], "/**", (c) => {
  return auth.handler(c.req.raw);
});

export default authController;
