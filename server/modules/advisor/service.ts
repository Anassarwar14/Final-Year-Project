import Groq from "groq-sdk";
import { prisma } from "../../lib/db";
import { portfolioService } from "../portfolio/service";
import { RAGService } from "../rag/service";
import { marketDataService } from "../../services/marketDataService";

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
  ragContext?: string;
  portfolioData?: any;
  marketData?: any;
  includePortfolio?: boolean;
}

interface RetrievalSource {
  id: string;
  sourceType: string;
  documentType: string;
  ticker?: string;
  source?: string;
  publishedAt?: string;
  similarity: number;
  snippet: string;
}

interface RetrievalMeta {
  query: string;
  expandedQuery: string;
  expanded: boolean;
  matchCount: number;
  rerankApplied?: boolean;
  intent?: string;
  entities?: string[];
  timeRange?: string;
  dataNeeded?: string[];
  isRealTime?: boolean;
  guardrailsApplied?: string[];
}

interface IntentClassification {
  intent: "company_analysis" | "market_data" | "general_concept" | "comparison" | "portfolio";
  entities: string[];
  time_range: "last_quarter" | "last_year" | "real_time" | "all";
  data_needed: string[];
  is_real_time: boolean;
}

export class AdvisorService {
  private extractLikelySymbols(text: string): string[] {
    const symbols = text.match(/\b[A-Z]{1,5}\b/g) || [];
    return Array.from(new Set(symbols));
  }

  private fallbackIntent(userMessage: string, defaultEntities: string[] = []): IntentClassification {
    const lower = userMessage.toLowerCase();
    const entities = this.extractLikelySymbols(userMessage).length
      ? this.extractLikelySymbols(userMessage)
      : defaultEntities;

    const isPortfolio = /portfolio|holdings|allocation|rebalance|my positions/.test(lower);
    const isConcept = /what is|explain|define|meaning of|how does/.test(lower);
    const isComparison = /compare|vs\.?|versus/.test(lower);
    const isRealtime = /right now|today|current|live|real[- ]?time|now/.test(lower);

    let intent: IntentClassification["intent"] = "company_analysis";
    if (isPortfolio) intent = "portfolio";
    else if (isConcept) intent = "general_concept";
    else if (isComparison) intent = "comparison";
    else if (isRealtime) intent = "market_data";

    const dataNeeded = isConcept
      ? ["education"]
      : isRealtime
      ? ["price", "news", "financials"]
      : ["financials", "news", "sec_filing"];

    return {
      intent,
      entities,
      time_range: isRealtime ? "real_time" : "all",
      data_needed: dataNeeded,
      is_real_time: isRealtime,
    };
  }

  private async classifyIntent(userMessage: string, defaultEntities: string[] = []): Promise<IntentClassification> {
    if (!process.env.GROQ_API_KEY) {
      return this.fallbackIntent(userMessage, defaultEntities);
    }

    const fallback = this.fallbackIntent(userMessage, defaultEntities);

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0,
        max_tokens: 220,
        messages: [
          {
            role: "system",
            content:
              "Classify a finance query and return STRICT JSON only with keys: intent, entities, time_range, data_needed, is_real_time. intents: company_analysis|market_data|general_concept|comparison|portfolio. time_range: last_quarter|last_year|real_time|all. entities should be uppercase ticker-like strings if present.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      const raw = completion.choices[0]?.message?.content || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return fallback;

      const parsed = JSON.parse(jsonMatch[0]) as Partial<IntentClassification>;
      const entities = Array.from(
        new Set((parsed.entities || fallback.entities).map((e: string) => String(e).toUpperCase()).filter(Boolean))
      );

      return {
        intent: (parsed.intent as IntentClassification["intent"]) || fallback.intent,
        entities,
        time_range: (parsed.time_range as IntentClassification["time_range"]) || fallback.time_range,
        data_needed: Array.isArray(parsed.data_needed) && parsed.data_needed.length
          ? parsed.data_needed.map((d: string) => String(d).toLowerCase())
          : fallback.data_needed,
        is_real_time: typeof parsed.is_real_time === "boolean" ? parsed.is_real_time : fallback.is_real_time,
      };
    } catch (_error) {
      return fallback;
    }
  }

  private resolveDateRange(timeRange: IntentClassification["time_range"]): { dateFrom?: string; dateTo?: string } {
    const now = new Date();
    const dateTo = now.toISOString();

    if (timeRange === "last_quarter") {
      const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      return { dateFrom: from, dateTo };
    }

    if (timeRange === "last_year") {
      const from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      return { dateFrom: from, dateTo };
    }

    return {};
  }

  private resolveSourceTypeFilters(classification: IntentClassification): string[] | undefined {
    const map = new Map<string, string[]>([
      ["financials", ["financials", "company_profile", "sec_filing"]],
      ["news", ["news"]],
      ["price", ["financials", "company_profile"]],
      ["ratios", ["financials", "sec_filing"]],
      ["sec_filing", ["sec_filing"]],
      ["education", ["company_profile", "financials"]],
    ]);

    const sourceTypes = new Set<string>();
    for (const need of classification.data_needed || []) {
      const mapped = map.get(need);
      if (mapped) mapped.forEach((item: string) => sourceTypes.add(item));
    }

    return sourceTypes.size ? Array.from(sourceTypes) : undefined;
  }

  private async buildRealtimeContext(classification: IntentClassification): Promise<string> {
    if (!classification.is_real_time || classification.entities.length === 0) {
      return "";
    }

    const symbols = classification.entities.slice(0, 3);
    const blocks = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const [quote, news] = await Promise.all([
            marketDataService.getRealtimeQuote(symbol),
            marketDataService.getCompanyNews(
              symbol,
              new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              new Date().toISOString().split("T")[0]
            ),
          ]);

          const quoteLine = quote
            ? `${symbol}: $${(quote.c || 0).toFixed(2)} (${(quote.dp || 0).toFixed(2)}%) | Day H/L: $${(quote.h || 0).toFixed(2)} / $${(quote.l || 0).toFixed(2)}`
            : `${symbol}: quote unavailable`;

          const topNews = (news || []).slice(0, 2).map((item: { headline: string }) => `- ${item.headline}`).join("\n");
          return `${quoteLine}${topNews ? `\nRecent headlines:\n${topNews}` : ""}`;
        } catch (_error) {
          return `${symbol}: real-time data unavailable`;
        }
      })
    );

    return blocks.filter(Boolean).join("\n\n");
  }

  private parseStoredSource(rawSource: string): RetrievalSource {
    try {
      const parsed = JSON.parse(rawSource) as Partial<RetrievalSource>;
      if (parsed && typeof parsed === "object") {
        return {
          id: parsed.id || rawSource,
          sourceType: parsed.sourceType || "unknown",
          documentType: parsed.documentType || "unknown",
          ticker: parsed.ticker,
          source: parsed.source,
          publishedAt: parsed.publishedAt,
          similarity: parsed.similarity ?? 0,
          snippet: parsed.snippet || "",
        };
      }
    } catch (_error) {
      // Legacy source strings are still valid and mapped to a minimal source object.
    }

    return {
      id: rawSource,
      sourceType: "legacy",
      documentType: "legacy",
      source: rawSource,
      similarity: 0,
      snippet: "",
    };
  }

  private serializeSourcesForStorage(sources: RetrievalSource[]): string[] {
    return sources.map((source: RetrievalSource) => JSON.stringify(source));
  }

  private buildGuardrailAppendix(
    userMessage: string,
    sources: RetrievalSource[],
    retrievalMeta: RetrievalMeta
  ): { appendix: string; flags: string[] } {
    const flags: string[] = [];
    const lower = userMessage.toLowerCase();
    const asksTradeAction = /\b(buy|sell|short|hold|allocate|rebalance|price target|entry|exit)\b/.test(lower);

    let appendix = '';

    if (asksTradeAction && sources.length === 0) {
      flags.push('insufficient_evidence_for_trade_signal');
      appendix += '\n\n### Confidence Note\nI could not retrieve enough verified supporting context for a high-confidence trade signal right now. Treat this as directional guidance and verify with fresh filings, news, and live quotes before executing.';
    }

    if (retrievalMeta.isRealTime) {
      flags.push('real_time_volatility_notice');
    }

    flags.push('educational_disclaimer');

    return { appendix, flags };
  }

  private async buildRagContext(
    userId: string,
    userMessage: string,
    includePortfolio: boolean
  ): Promise<{ ragContextStr: string; sources: RetrievalSource[]; retrievalMeta: RetrievalMeta; marketDataStr: string }> {
    let expandedQuery = userMessage;
    const symbolsToPrime = new Set<string>();

    if (includePortfolio) {
      const portfolio = await portfolioService.getEnhancedPortfolio(userId).catch(() => null);
      const holdings = portfolio?.holdings || [];
      if (holdings.length > 0) {
        const holdingSymbols = holdings
          .map((h: { symbol?: string; asset?: { symbol: string } }) => h.symbol || h.asset?.symbol)
          .filter(Boolean)
          .join(" ");

        holdings
          .map((h: { symbol?: string; asset?: { symbol: string } }) => h.symbol || h.asset?.symbol)
          .filter(Boolean)
          .forEach((symbol: string) => symbolsToPrime.add(String(symbol).toUpperCase()));

        if (holdingSymbols) {
          expandedQuery += ` ${holdingSymbols}`;
        }
      }
    }

    const querySymbols = expandedQuery.match(/\b[A-Z]{1,5}\b/g) || [];
    querySymbols.forEach((symbol: string) => symbolsToPrime.add(symbol));

    const classification = await this.classifyIntent(userMessage, Array.from(symbolsToPrime));
    classification.entities.forEach((symbol: string) => symbolsToPrime.add(symbol));

    const queryIngestionEnabled = process.env.RAG_QUERY_INGEST_ENABLED === "true";
    if (queryIngestionEnabled && symbolsToPrime.size > 0) {
      // Fire-and-forget warm-up so chat responses do not block on ingestion latency.
      void Promise.allSettled(
        Array.from(symbolsToPrime)
          .slice(0, 3)
          .map((symbol: string) => RAGService.ensureTickerContextFresh(symbol))
      );
    }

    const sourceTypeFilters = this.resolveSourceTypeFilters(classification);
    const timeRange = this.resolveDateRange(classification.time_range);
    const primaryTicker = classification.entities[0] || Array.from(symbolsToPrime)[0];

    const ragDocs = await RAGService.searchSimilarDocuments(expandedQuery, 7, undefined, {
      ticker: primaryTicker,
      sourceTypes: sourceTypeFilters,
      dateFrom: timeRange.dateFrom,
      dateTo: timeRange.dateTo,
    });
    const marketDataStr = await this.buildRealtimeContext(classification);

    if (!ragDocs || ragDocs.length === 0) {
      return {
        ragContextStr: "",
        sources: [],
        marketDataStr,
        retrievalMeta: {
          query: userMessage,
          expandedQuery,
          expanded: expandedQuery !== userMessage,
          matchCount: 0,
          rerankApplied: true,
          intent: classification.intent,
          entities: classification.entities,
          timeRange: classification.time_range,
          dataNeeded: classification.data_needed,
          isRealTime: classification.is_real_time,
        },
      };
    }

    const sourcesById = new Map<string, RetrievalSource>();
    const ragContextStr = ragDocs
      .map((doc: { id?: string; sourceType?: string; metadata?: any; documentType?: string; ticker?: string; source?: string; publishedAt?: string; content?: string }, idx: number) => {
        const sourceType = doc.sourceType || doc.metadata?.type || "unknown";
        const documentType = doc.documentType || doc.metadata?.type || "unknown";
        const ticker = doc.ticker || doc.metadata?.ticker;
        const source = doc.source || doc.metadata?.source;
        const publishedAt = doc.publishedAt || (doc.metadata?.date
          ? new Date(Number(doc.metadata.date) * 1000).toISOString()
          : undefined);
        const sourceId = `${doc.id || "doc"}-${source || ticker || idx}`;

        sourcesById.set(sourceId, {
          id: sourceId,
          sourceType,
          documentType,
          ticker,
          source,
          publishedAt,
          similarity: doc.similarity ?? 0,
          snippet: doc.content?.slice(0, 260) || "",
        });

        return `[Doc ${idx + 1}] (${sourceType} - ${ticker || "general"}, similarity ${(doc.similarity ?? 0).toFixed(3)}): ${doc.content}`;
      })
      .join("\n\n");

    return {
      ragContextStr,
      sources: Array.from(sourcesById.values()),
      marketDataStr,
      retrievalMeta: {
        query: userMessage,
        expandedQuery,
        expanded: expandedQuery !== userMessage,
        matchCount: ragDocs.length,
        rerankApplied: true,
        intent: classification.intent,
        entities: classification.entities,
        timeRange: classification.time_range,
        dataNeeded: classification.data_needed,
        isRealTime: classification.is_real_time,
      },
    };
  }

  /**
   * Generate system prompt with user context for personalized advice
   */
  private async generateSystemPrompt(context: ChatContext): Promise<string> {
    let systemPrompt = `You are an elite AI Financial Advisor and Wealth Manager with deep expertise in macroeconomics, portfolio optimization, technical/fundamental analysis, risk management, and SEC filings.

VOICE AND TONE RULES:
1. Address the user directly as "you". Never refer to "the user" in third person.
2. Do NOT start responses with fixed boilerplate (for example, do not always open with the same disclaimer sentence).
3. Keep safety and uncertainty language concise and natural. Avoid repetitive disclaimer paragraphs.

CORE DIRECTIVES:
1. Base recommendations on available Investor Profile data (risk tolerance, horizon, goals, sectors) and portfolio holdings.
2. If portfolio/profile data is present, give specific and quantitative actions (buy/sell/hold/rebalance with concrete sizing ideas).
3. If profile or portfolio data is missing, ask for only the missing inputs needed for personalization.
4. When profile data is missing, explicitly ask the user to complete their profile by clicking the "Profile Incomplete" badge at the top of the chat page.
5. Synthesize Retrieved Financial Context (RAG data like 10-K forms, news, and company profiles) and cite exact facts/metrics from that context.
6. Distinguish time-sensitive market facts from longer-horizon fundamentals.
7. Format clearly with concise Markdown sections, bullets, and tables when useful.`;

    let hasInvestorProfile = false;
    let profileNeedsCompletion = false;
    let hasPortfolioData = false;

    // Add user's portfolio context if requested
    if (context.includePortfolio) {
      try {
        let realPortfolio: any = null;

        try {
          const portfolio = await portfolioService.getEnhancedPortfolio(context.userId);
          if (portfolio) {
            realPortfolio = {
              ...portfolio.profile,
              holdings: portfolio.holdings,
              analytics: portfolio.analytics,
              recentTransactions: portfolio.recentTransactions,
            };
          }
        } catch (e) {}

        const portfolioData = realPortfolio && realPortfolio.holdings?.length > 0 ? realPortfolio : null;

        if (realPortfolio && realPortfolio.holdings?.length > 0) {
          const totalValue = Number(realPortfolio.totalValue || 0);
          const cash = Number(realPortfolio.cashBalance || 0);
          const unrealizedPnL = Number(realPortfolio.analytics?.totalUnrealizedPnL || 0);
          const unrealizedPct = Number(realPortfolio.analytics?.totalUnrealizedPnLPercent || 0);

          systemPrompt += `\n\n## USER'S REAL PORTFOLIO (PRIMARY):
**Total Portfolio Value:** $${totalValue.toFixed(2)}
**Available Cash:** $${cash.toFixed(2)}
**Unrealized P&L:** ${unrealizedPnL >= 0 ? '+' : ''}$${unrealizedPnL.toFixed(2)} (${unrealizedPct.toFixed(2)}%)

### Real Holdings:`;

          if (!realPortfolio.holdings || realPortfolio.holdings.length === 0) {
            systemPrompt += `\n(No active real positions.)`;
          } else {
            realPortfolio.holdings.forEach((h: { asset?: { symbol: string }; symbol?: string; averageBuyPrice?: number; averagePrice?: number; currentPrice?: number; unrealizedPnL?: number; unrealizedPnLPercent?: number; quantity?: number }) => {
              const symbol = h.asset?.symbol || h.symbol;
              const avgPrice = Number(h.averageBuyPrice || h.averagePrice || 0);
              const currPrice = Number(h.currentPrice || 0);
              const pnl = Number(h.unrealizedPnL || 0);
              const pnlPct = Number(h.unrealizedPnLPercent || 0);
              const qty = Number(h.quantity || 0);

              systemPrompt += `\n- **${symbol}**: ${qty} shares | Avg: $${avgPrice.toFixed(2)} | Current: $${currPrice.toFixed(2)} | P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%)`;
            });
          }

          if (Array.isArray(realPortfolio.recentTransactions) && realPortfolio.recentTransactions.length > 0) {
            systemPrompt += `\n\n### Recent Transactions (Newest First):`;
            realPortfolio.recentTransactions.slice(0, 5).forEach((t: { asset?: { symbol: string }; type?: string; quantity?: number; pricePerUnit?: number }) => {
              const symbol = t.asset?.symbol || 'N/A';
              const type = t.type || 'N/A';
              const qty = Number(t.quantity || 0);
              const px = Number(t.pricePerUnit || 0);
              systemPrompt += `\n- ${type} ${qty} ${symbol} @ $${px.toFixed(2)}`;
            });
          }
        }

        const investorProfile = await prisma.investorProfile.findUnique({
          where: { userId: context.userId }
        });
        
        if (investorProfile) {
          const defaultLikeProfile =
            investorProfile.experienceLevel?.toLowerCase() === "beginner" &&
            (!investorProfile.preferredSectors || investorProfile.preferredSectors.length === 0);

          hasInvestorProfile = !defaultLikeProfile;
          profileNeedsCompletion = defaultLikeProfile;
          systemPrompt += `\n\n## USER'S INVESTOR PROFILE:
- **Risk Tolerance:** ${investorProfile.riskTolerance.toUpperCase()}
- **Investment Goal:** ${investorProfile.investmentGoal.toUpperCase()}
- **Investment Horizon:** ${investorProfile.investmentHorizon.toUpperCase()}
- **Experience Level:** ${investorProfile.experienceLevel.toUpperCase()}
- **Preferred Sectors:** ${investorProfile.preferredSectors.join(', ') || 'Agnostic'}

>>> CRITICAL: Align every recommendation to this profile. Speak directly to the user as "you".`;
        }

        if (portfolioData) {
          hasPortfolioData = true;
          const totalValue = Number(portfolioData.totalValue || 0);
          const cash = Number(portfolioData.virtualBalance || portfolioData.cashBalance || 0);
          
          systemPrompt += `\n\n## USER'S ACTIVE PORTFOLIO CONTEXT:
**Total Portfolio Value:** $${totalValue.toFixed(2)}
**Available Cash to Invest:** $${cash.toFixed(2)}

### Current Holdings:`;
          
          if (!portfolioData.holdings || portfolioData.holdings.length === 0) {
            systemPrompt += `\n(No active positions. User is holding 100% cash.)`;
          } else {
             portfolioData.holdings.forEach((h: { asset?: { symbol: string }; symbol?: string; averageBuyPrice?: number; averagePrice?: number; currentPrice?: number; unrealizedPnL?: number; unrealizedPnLPercent?: number; quantity?: number }) => {
              const symbol = h.asset?.symbol || h.symbol;
              const avgPrice = Number(h.averageBuyPrice || h.averagePrice || 0);
              const currPrice = Number(h.currentPrice || 0);
              const pnl = Number(h.unrealizedPnL || 0);
              const pnlPct = Number(h.unrealizedPnLPercent || 0);
              const qty = Number(h.quantity || 0);
              
              systemPrompt += `\n- **${symbol}**: ${qty} shares. Average Buy: $${avgPrice.toFixed(2)} | Current: $${currPrice.toFixed(2)} | P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%)`;
             });
          }
          systemPrompt += `\n\n>>> CRITICAL: Base buy/sell analysis on these exact holdings. Tell the user what they should add, trim, or exit based on their stated goals and risk tolerance.`;
        }
      } catch (error) {
        console.error("Error fetching portfolio context:", error);
      }
    }

    if (!hasInvestorProfile || profileNeedsCompletion) {
      systemPrompt += `\n\n## PROFILE COMPLETION RULE:
  The investor profile is missing or incomplete. Before giving detailed allocation advice, ask the user to complete their profile by clicking the "Profile Incomplete" badge at the top. Keep this reminder short and in second person.`;
    }

    if (!hasPortfolioData) {
      systemPrompt += `\n\n## MISSING PORTFOLIO RULE:
No active holdings were found. If the user asks for portfolio-specific actions, ask for current holdings/cash allocation first, then provide a provisional framework.`;
    }

    if (context.ragContext) {
      systemPrompt += `\n\n## RETRIEVED FINANCIAL CONTEXT (RAG):
The following information has been retrieved from our vector database via similarity search. It includes real-time company profiles, news, SEC 10-K / 10-Q forms, and financial metrics.
--------------------------------------------------
${context.ragContext}
--------------------------------------------------
>>> CRITICAL: You MUST explicitly cite these sources when suggesting trades (e.g. "According to Apple's latest 10-K form..."). Combine this data with what the user is currently holding to suggest re-weightings.`;
    }

    if (context.marketData) {
      systemPrompt += `\n\n## REAL-TIME MARKET SNAPSHOT:\n${context.marketData}\n\n>>> CRITICAL: Treat this as time-sensitive context. Distinguish real-time facts from long-horizon filing/fundamental context.`;
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
    sources: RetrievalSource[];
    retrievalMeta: RetrievalMeta;
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

      // Fetch relevant documents using RAG
      let ragContextStr = "";
      let marketDataStr = "";
      let retrievedSources: RetrievalSource[] = [];
      let retrievalMeta: RetrievalMeta = {
        query: userMessage,
        expandedQuery: userMessage,
        expanded: false,
        matchCount: 0,
      };
      try {
        const ragData = await this.buildRagContext(userId, userMessage, includePortfolio);
        ragContextStr = ragData.ragContextStr;
        marketDataStr = ragData.marketDataStr;
        retrievedSources = ragData.sources;
        retrievalMeta = ragData.retrievalMeta;
      } catch (error) {
        console.error("Failed to retrieve RAG documents:", error);
      }

      // Generate system prompt with user context
      const systemPrompt = await this.generateSystemPrompt({
        userId,
        includePortfolio,
        ragContext: ragContextStr,
        marketData: marketDataStr,
      });

      // Build conversation history
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
      ];

      // Add previous messages from session
      session.messages.forEach((msg: { role: string; content: string }) => {
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

      const guardrail = this.buildGuardrailAppendix(userMessage, retrievedSources, retrievalMeta);
      const finalResponse = `${aiResponse}${guardrail.appendix}`;
      retrievalMeta.guardrailsApplied = guardrail.flags;

      // Save AI response to database
      await prisma.aiChatMessage.create({
        data: {
          sessionId: session.id,
          role: "MODEL",
          content: finalResponse,
          sources: this.serializeSourcesForStorage(retrievedSources),
        },
      });

      // Update session timestamp
      await prisma.aiChatSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() },
      });

      return {
        message: finalResponse,
        sources: retrievedSources,
        retrievalMeta,
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
  ): Promise<{
    stream: AsyncIterable<string>;
    sources: RetrievalSource[];
    retrievalMeta: RetrievalMeta;
  }> {
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

      // Fetch relevant documents using RAG
      let ragContextStr = "";
      let marketDataStr = "";
      let retrievedSources: RetrievalSource[] = [];
      let retrievalMeta: RetrievalMeta = {
        query: userMessage,
        expandedQuery: userMessage,
        expanded: false,
        matchCount: 0,
      };
      try {
        const ragData = await this.buildRagContext(userId, userMessage, includePortfolio);
        ragContextStr = ragData.ragContextStr;
        marketDataStr = ragData.marketDataStr;
        retrievedSources = ragData.sources;
        retrievalMeta = ragData.retrievalMeta;
      } catch (error) {
        console.error("Failed to retrieve RAG documents:", error);
      }

      // Generate system prompt
      const systemPrompt = await this.generateSystemPrompt({
        userId,
        includePortfolio,
        ragContext: ragContextStr,
        marketData: marketDataStr,
      });

      // Build conversation history
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
      ];

      session.messages.forEach((msg: { role: string; content: string }) => {
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
      const serializedSources = this.serializeSourcesForStorage(retrievedSources);

      // Create async generator for streaming
      async function* streamGenerator() {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          fullResponse += content;
          yield content;
        }

        const guardrail = self.buildGuardrailAppendix(userMessage, retrievedSources, retrievalMeta);
        retrievalMeta.guardrailsApplied = guardrail.flags;
        if (guardrail.appendix) {
          fullResponse += guardrail.appendix;
          yield guardrail.appendix;
        }

        // Save complete AI response after streaming
        await prisma.aiChatMessage.create({
          data: {
            sessionId: session!.id,
            role: "MODEL",
            content: fullResponse,
            sources: serializedSources,
          },
        });

        // Update session timestamp
        await prisma.aiChatSession.update({
          where: { id: session!.id },
          data: { updatedAt: new Date() },
        });
      }

      const self = this;
      return {
        stream: streamGenerator(),
        sources: retrievedSources,
        retrievalMeta,
      };
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

      return sessions.map((session: { id: string; title: string; messages: Array<{ content?: string }>; updatedAt: Date }) => ({
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
        messages: session.messages.map((msg: { id: string; role: string; content: string; sources: string[]; createdAt: Date }) => ({
          id: msg.id,
          role: msg.role.toLowerCase(),
          content: msg.content,
          sources: msg.sources.map((source: string) => this.parseStoredSource(source)),
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

  /**
   * Get user's investor profile
   */
  async getProfile(userId: string) {
    return prisma.investorProfile.findUnique({
      where: { userId },
    });
  }

  /**
   * Update or create user's investor profile
   */
  async upsertProfile(userId: string, data: {
    riskTolerance?: string;
    investmentGoal?: string;
    investmentHorizon?: string;
    experienceLevel?: string;
    preferredSectors?: string[];
  }) {
    return prisma.investorProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        riskTolerance: data.riskTolerance || "moderate",
        investmentGoal: data.investmentGoal || "growth",
        investmentHorizon: data.investmentHorizon || "medium",
        experienceLevel: data.experienceLevel || "beginner",
        preferredSectors: data.preferredSectors || [],
      },
    });
  }
}

export const advisorService = new AdvisorService();
