import { Context } from "hono";
import { advisorService } from "./service";
import { z } from "zod";

// Validation schemas
const sendMessageSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1, "Message cannot be empty"),
  includePortfolio: z.boolean().optional().default(true),
});

const createSessionSchema = z.object({
  initialMessage: z.string().optional(),
});

const quickActionSchema = z.object({
  action: z.enum(["portfolio_analysis", "market_update", "risk_check", "investment_ideas"]),
});

export class AdvisorController {
  /**
   * POST /api/advisor/chat
   * Send a message and get AI response
   */
  async sendMessage(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const { sessionId, message, includePortfolio } = sendMessageSchema.parse(body);

      // Generate session ID if not provided
      const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const response = await advisorService.sendMessage(
        user.id,
        finalSessionId,
        message,
        includePortfolio
      );

      return c.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error("Error in sendMessage controller:", error);
      
      if (error instanceof z.ZodError) {
        return c.json(
          { error: "Invalid request data", details: error.errors },
          400
        );
      }

      return c.json(
        { 
          error: "Failed to send message",
          message: error instanceof Error ? error.message : "Unknown error"
        },
        500
      );
    }
  }

  /**
   * POST /api/advisor/chat/stream
   * Send a message and get streaming AI response
   */
  async sendMessageStream(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const { sessionId, message, includePortfolio } = sendMessageSchema.parse(body);

      const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Create a readable stream
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const messageStream = await advisorService.sendMessageStream(
              user.id,
              finalSessionId,
              message,
              includePortfolio
            );

            // Send session ID first
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ type: "session", sessionId: finalSessionId })}\n\n`)
            );

            // Stream the response
            for await (const chunk of messageStream) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`)
              );
            }

            // Send completion signal
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
            );

            controller.close();
          } catch (error) {
            console.error("Stream error:", error);
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ type: "error", message: "Failed to stream response" })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } catch (error) {
      console.error("Error in sendMessageStream controller:", error);
      
      if (error instanceof z.ZodError) {
        return c.json(
          { error: "Invalid request data", details: error.errors },
          400
        );
      }

      return c.json(
        { 
          error: "Failed to stream message",
          message: error instanceof Error ? error.message : "Unknown error"
        },
        500
      );
    }
  }

  /**
   * GET /api/advisor/sessions
   * Get all chat sessions for the user
   */
  async getSessions(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const sessions = await advisorService.getUserSessions(user.id);

      return c.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      console.error("Error in getSessions controller:", error);
      return c.json(
        { error: "Failed to fetch sessions" },
        500
      );
    }
  }

  /**
   * GET /api/advisor/sessions/:id
   * Get a specific session with all messages
   */
  async getSession(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const sessionId = c.req.param("id");
      
      if (!sessionId) {
        return c.json({ error: "Session ID is required" }, 400);
      }

      const session = await advisorService.getSession(sessionId, user.id);

      return c.json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error("Error in getSession controller:", error);
      return c.json(
        { 
          error: "Failed to fetch session",
          message: error instanceof Error ? error.message : "Unknown error"
        },
        404
      );
    }
  }

  /**
   * POST /api/advisor/sessions
   * Create a new chat session
   */
  async createSession(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const { initialMessage } = createSessionSchema.parse(body);

      const session = await advisorService.createSession(user.id, initialMessage);

      return c.json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error("Error in createSession controller:", error);
      
      if (error instanceof z.ZodError) {
        return c.json(
          { error: "Invalid request data", details: error.errors },
          400
        );
      }

      return c.json(
        { error: "Failed to create session" },
        500
      );
    }
  }

  /**
   * DELETE /api/advisor/sessions/:id
   * Delete a chat session
   */
  async deleteSession(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const sessionId = c.req.param("id");
      
      if (!sessionId) {
        return c.json({ error: "Session ID is required" }, 400);
      }

      await advisorService.deleteSession(sessionId, user.id);

      return c.json({
        success: true,
        message: "Session deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteSession controller:", error);
      return c.json(
        { 
          error: "Failed to delete session",
          message: error instanceof Error ? error.message : "Unknown error"
        },
        500
      );
    }
  }

  /**
   * POST /api/advisor/quick-action
   * Get a pre-defined prompt for quick actions
   */
  async quickAction(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = await c.req.json();
      const { action } = quickActionSchema.parse(body);

      const prompt = await advisorService.getQuickAction(user.id, action);

      return c.json({
        success: true,
        data: { prompt },
      });
    } catch (error) {
      console.error("Error in quickAction controller:", error);
      
      if (error instanceof z.ZodError) {
        return c.json(
          { error: "Invalid request data", details: error.errors },
          400
        );
      }

      return c.json(
        { error: "Failed to get quick action" },
        500
      );
    }
  }
}

export const advisorController = new AdvisorController();
