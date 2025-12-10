import { Hono } from "hono";
import { advisorController } from "./controller";
import { auth } from "../../lib/auth";

// Middleware for private routes
const privateRoutesMiddleware = async (c: any, next: any) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};

const advisorRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// Apply middleware to all advisor routes
advisorRoutes.use("*", privateRoutesMiddleware);

// Chat routes
advisorRoutes.post("/chat", advisorController.sendMessage.bind(advisorController));
advisorRoutes.post("/chat/stream", advisorController.sendMessageStream.bind(advisorController));

// Session management routes
advisorRoutes.get("/sessions", advisorController.getSessions.bind(advisorController));
advisorRoutes.get("/sessions/:id", advisorController.getSession.bind(advisorController));
advisorRoutes.post("/sessions", advisorController.createSession.bind(advisorController));
advisorRoutes.delete("/sessions/:id", advisorController.deleteSession.bind(advisorController));

// Quick actions
advisorRoutes.post("/quick-action", advisorController.quickAction.bind(advisorController));

export default advisorRoutes;
