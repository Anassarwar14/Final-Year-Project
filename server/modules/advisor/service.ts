import Groq from "groq-sdk";
import { prisma } from "../../lib/db";
import { portfolioService } from "../portfolio/service";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Best Groq models for finance:
// - llama-3.3-70b-versatile (best for complex reasoning, finance analysis)
// - llama-3.1-70b-versatile (excellent balance of speed and quality)
// - mixtral-8x7b-32768 (large context window for RAG)
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatContext {
  userId: string;
  portfolioData?: any;
  marketData?: any;
  includePortfolio?: boolean;
}

export class AdvisorService {
  /**
   * Generate system prompt with user context for personalized advice
   */
  private async generateSystemPrompt(context: ChatContext): Promise<string> {
    let systemPrompt = `You are an expert AI Financial Advisor with deep knowledge in:
- Portfolio analysis and optimization
- Market trends and technical analysis
- Risk management and diversification
- Investment strategies (value, growth, dividend, etc.)
- Fundamental analysis and company valuation
- Asset allocation and rebalancing
- Tax-efficient investing strategies

Your responses should be:
- Professional yet conversational
- Data-driven with specific recommendations
- Personalized based on the user's portfolio and goals
- Clear about risks and uncertainties
- Actionable with specific steps

When analyzing stocks, consider: fundamentals, technicals, sector trends, market conditions, and risk factors.
Always disclose when advice is general vs. specific to their portfolio.
Format responses in markdown for better readability.
Use bullet points, headings, and tables when appropriate.`;

    // Add user's portfolio context if requested
    if (context.includePortfolio) {
      try {
        const portfolio = await portfolioService.getPortfolioOverview(context.userId);
        
        if (portfolio) {
          systemPrompt += `\n\n## User's Current Portfolio:
**Total Value:** $${portfolio.totalValue.toFixed(2)}
**Cash Balance:** $${portfolio.cashBalance.toFixed(2)}
**Total P&L:** ${portfolio.totalPnL >= 0 ? '+' : ''}$${portfolio.totalPnL.toFixed(2)} (${portfolio.totalPnLPercent.toFixed(2)}%)
**Holdings:** ${portfolio.holdings.length} positions

### Current Holdings:
${portfolio.holdings.map((h: any) => 
  `- **${h.symbol}**: ${h.quantity} shares @ $${h.averagePrice.toFixed(2)} | Current: $${h.currentPrice.toFixed(2)} | P&L: ${h.unrealizedPnL >= 0 ? '+' : ''}$${h.unrealizedPnL.toFixed(2)} (${h.unrealizedPnLPercent.toFixed(2)}%)`
).join('\n')}

Use this portfolio data to provide personalized advice specific to their holdings.`;
        }
      } catch (error) {
        console.error("Error fetching portfolio context:", error);
      }
    }

    return systemPrompt;
  }

  /**
   * Send a chat message and get AI response
   */
  async sendMessage(
    userId: string,
    sessionId: string,
    userMessage: string,
    includePortfolio: boolean = true
  ): Promise<{
    message: string;
    sources: string[];
    sessionId: string;
  }> {
    try {
      // Get or create session
      let session = await prisma.aiChatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 20, // Last 20 messages for context
          },
        },
      });

      if (!session) {
        // Create new session with auto-generated title
        const title = await this.generateSessionTitle(userMessage);
        session = await prisma.aiChatSession.create({
          data: {
            id: sessionId,
            userId,
            title,
          },
          include: { messages: true },
        });
      }

      // Generate system prompt with user context
      const systemPrompt = await this.generateSystemPrompt({
        userId,
        includePortfolio,
      });

      // Build conversation history
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
      ];

      // Add previous messages from session
      session.messages.forEach((msg) => {
        messages.push({
          role: msg.role === "USER" ? "user" : "assistant",
          content: msg.content,
        });
      });

      // Add new user message
      messages.push({
        role: "user",
        content: userMessage,
      });

      // Save user message to database
      await prisma.aiChatMessage.create({
        data: {
          sessionId: session.id,
          role: "USER",
          content: userMessage,
          sources: [],
        },
      });

      // Get response from Groq
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
      });

      const aiResponse = completion.choices[0]?.message?.content || 
        "I apologize, but I couldn't generate a response. Please try again.";

      // Save AI response to database
      await prisma.aiChatMessage.create({
        data: {
          sessionId: session.id,
          role: "MODEL",
          content: aiResponse,
          sources: [], // TODO: Add RAG sources when implemented
        },
      });

      // Update session timestamp
      await prisma.aiChatSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() },
      });

      return {
        message: aiResponse,
        sources: [], // TODO: Add RAG sources
        sessionId: session.id,
      };
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send message with streaming response
   */
  async sendMessageStream(
    userId: string,
    sessionId: string,
    userMessage: string,
    includePortfolio: boolean = true
  ): Promise<AsyncIterable<string>> {
    try {
      // Get or create session
      let session = await prisma.aiChatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 20,
          },
        },
      });

      if (!session) {
        const title = await this.generateSessionTitle(userMessage);
        session = await prisma.aiChatSession.create({
          data: {
            id: sessionId,
            userId,
            title,
          },
          include: { messages: true },
        });
      }

      // Generate system prompt
      const systemPrompt = await this.generateSystemPrompt({
        userId,
        includePortfolio,
      });

      // Build conversation history
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
      ];

      session.messages.forEach((msg) => {
        messages.push({
          role: msg.role === "USER" ? "user" : "assistant",
          content: msg.content,
        });
      });

      messages.push({
        role: "user",
        content: userMessage,
      });

      // Save user message
      await prisma.aiChatMessage.create({
        data: {
          sessionId: session.id,
          role: "USER",
          content: userMessage,
          sources: [],
        },
      });

      // Get streaming response from Groq
      const stream = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
        stream: true,
      });

      // Collect full response for saving to database
      let fullResponse = "";

      // Create async generator for streaming
      async function* streamGenerator() {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          fullResponse += content;
          yield content;
        }

        // Save complete AI response after streaming
        await prisma.aiChatMessage.create({
          data: {
            sessionId: session!.id,
            role: "MODEL",
            content: fullResponse,
            sources: [],
          },
        });

        // Update session timestamp
        await prisma.aiChatSession.update({
          where: { id: session!.id },
          data: { updatedAt: new Date() },
        });
      }

      return streamGenerator();
    } catch (error) {
      console.error("Error in sendMessageStream:", error);
      throw new Error(`Failed to stream message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all chat sessions for a user
   */
  async getUserSessions(userId: string) {
    try {
      const sessions = await prisma.aiChatSession.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 1, // Get first message for preview
          },
        },
      });

      return sessions.map((session) => ({
        id: session.id,
        title: session.title,
        preview: session.messages[0]?.content?.substring(0, 100) || "New conversation",
        timestamp: session.updatedAt,
        messageCount: session.messages.length,
      }));
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      throw new Error("Failed to fetch chat sessions");
    }
  }

  /**
   * Get a specific session with all messages
   */
  async getSession(sessionId: string, userId: string) {
    try {
      const session = await prisma.aiChatSession.findFirst({
        where: {
          id: sessionId,
          userId, // Ensure user owns the session
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      return {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages.map((msg) => ({
          id: msg.id,
          role: msg.role.toLowerCase(),
          content: msg.content,
          sources: msg.sources,
          timestamp: msg.createdAt,
        })),
      };
    } catch (error) {
      console.error("Error fetching session:", error);
      throw new Error("Failed to fetch session");
    }
  }

  /**
   * Create a new chat session
   */
  async createSession(userId: string, initialMessage?: string) {
    try {
      const title = initialMessage 
        ? await this.generateSessionTitle(initialMessage)
        : "New Conversation";

      const session = await prisma.aiChatSession.create({
        data: {
          userId,
          title,
        },
      });

      return {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
      };
    } catch (error) {
      console.error("Error creating session:", error);
      throw new Error("Failed to create session");
    }
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string, userId: string) {
    try {
      // Verify user owns the session
      const session = await prisma.aiChatSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      // Delete session (messages will be cascade deleted)
      await prisma.aiChatSession.delete({
        where: { id: sessionId },
      });

      return { success: true };
    } catch (error) {
      console.error("Error deleting session:", error);
      throw new Error("Failed to delete session");
    }
  }

  /**
   * Generate a title for the session based on the first message
   */
  private async generateSessionTitle(firstMessage: string): Promise<string> {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant", // Use faster model for title generation
        messages: [
          {
            role: "system",
            content: "Generate a short, descriptive title (max 6 words) for this financial conversation. Return ONLY the title, nothing else.",
          },
          {
            role: "user",
            content: firstMessage,
          },
        ],
        temperature: 0.5,
        max_tokens: 50,
      });

      const title = completion.choices[0]?.message?.content?.trim() || "Financial Discussion";
      return title.replace(/['"]/g, ""); // Remove quotes
    } catch (error) {
      console.error("Error generating title:", error);
      return "Financial Discussion";
    }
  }

  /**
   * Get quick action response (pre-defined prompts)
   */
  async getQuickAction(
    userId: string,
    action: "portfolio_analysis" | "market_update" | "risk_check" | "investment_ideas"
  ): Promise<string> {
    const prompts = {
      portfolio_analysis: "Please provide a comprehensive analysis of my current portfolio. Include performance metrics, risk assessment, sector allocation, and recommendations for optimization.",
      market_update: "What are the current market trends and conditions? What should I be aware of today?",
      risk_check: "Analyze the risk profile of my portfolio. What are my exposure levels, and how can I better manage risk?",
      investment_ideas: "Based on my current portfolio and market conditions, what are some promising investment opportunities I should consider?",
    };

    return prompts[action] || prompts.portfolio_analysis;
  }
}

export const advisorService = new AdvisorService();
