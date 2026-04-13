import { createHash } from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { marketDataService } from '../../services/marketDataService';
import { prisma } from '../../lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface IngestDocument {
  sourceId: string;
  text: string;
  metadata: {
    ticker: string;
    source: string;
    type: string;
    date?: number;
    publishedAt?: string;
    source_id: string;
    content_hash: string;
    ingested_at: string;
    form_type?: string;
    filing_date?: string;
    section?: string;
  };
  type: string;
}

interface IngestSummary {
  success: boolean;
  ticker: string;
  chunksInserted: number;
  chunksDeleted: number;
  documentsProcessed: number;
  documentsSkipped: number;
}

interface SearchFilters {
  ticker?: string;
  sourceTypes?: string[];
  dateFrom?: string;
  dateTo?: string;
}

interface RefreshSummary {
  tickers: string[];
  results: IngestSummary[];
}

interface RawSearchResult {
  id: string;
  content: string;
  metadata: any;
  similarity: number;
}

interface NormalizedSearchResult {
  id: string;
  content: string;
  snippet: string;
  similarity: number;
  rerankScore?: number;
  sourceType: string;
  documentType: string;
  ticker?: string;
  source?: string;
  publishedAt?: string;
  metadata: any;
}

interface QueryIntentHints {
  wantsTenK: boolean;
  wantsTenQ: boolean;
  wantsRiskFactors: boolean;
}

export class RAGService {
  private static tickerIngestionCooldownMs = Math.max(
    15,
    Number(process.env.RAG_INGESTION_COOLDOWN_MINUTES || 180)
  ) * 60 * 1000;
  private static ingestionLocks = new Map<string, Promise<void>>();
  private static lastIngestionAttemptMs = new Map<string, number>();
  private static fallbackEmbeddingWarningShown = false;

  private static getMaxChunksPerDocument(documentType: string): number {
    const defaultCap = Number(process.env.RAG_MAX_CHUNKS_PER_DOCUMENT || 10);
    const secCap = Number(process.env.RAG_SEC_MAX_CHUNKS_PER_DOCUMENT || 8);
    return documentType === 'sec_filing' ? Math.max(1, secCap) : Math.max(1, defaultCap);
  }

  private static normalizeSearchResults(results: RawSearchResult[]): NormalizedSearchResult[] {
    return results.map((result) => {
      const sourceType = result.metadata?.type || 'unknown';
      const timestamp = result.metadata?.date ? Number(result.metadata.date) : null;
      const publishedAt = timestamp ? new Date(timestamp * 1000).toISOString() : result.metadata?.publishedAt;

      return {
        id: result.id,
        content: result.content,
        snippet: result.content.slice(0, 260),
        similarity: result.similarity ?? 0,
        sourceType,
        documentType: result.metadata?.type || 'unknown',
        ticker: result.metadata?.ticker,
        source: result.metadata?.source,
        publishedAt,
        metadata: result.metadata,
      };
    });
  }

  private static applySearchFilters(results: NormalizedSearchResult[], filters?: SearchFilters): NormalizedSearchResult[] {
    if (!filters) return results;

    const normalizedTicker = filters.ticker?.trim().toUpperCase();
    const sourceTypeSet = filters.sourceTypes?.length
      ? new Set(filters.sourceTypes.map((type) => type.trim().toLowerCase()).filter(Boolean))
      : null;
    const dateFromMs = filters.dateFrom ? new Date(filters.dateFrom).getTime() : null;
    const dateToMs = filters.dateTo ? new Date(filters.dateTo).getTime() : null;

    return results.filter((result) => {
      if (normalizedTicker && String(result.ticker || '').toUpperCase() !== normalizedTicker) {
        return false;
      }

      if (sourceTypeSet && !sourceTypeSet.has(String(result.sourceType || '').toLowerCase())) {
        return false;
      }

      if (dateFromMs || dateToMs) {
        const publishedMs = result.publishedAt ? new Date(result.publishedAt).getTime() : NaN;
        if (!Number.isFinite(publishedMs)) return false;
        if (dateFromMs && publishedMs < dateFromMs) return false;
        if (dateToMs && publishedMs > dateToMs) return false;
      }

      return true;
    });
  }

  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2);
  }

  private static rerankResults(query: string, results: NormalizedSearchResult[]): NormalizedSearchResult[] {
    if (!results.length) return results;

    const queryTokens = new Set(this.tokenize(query));
    const nowMs = Date.now();
    const hints = this.deriveQueryIntentHints(query);

    const scored = results.map((result) => {
      const resultText = `${result.content} ${result.snippet} ${result.metadata?.section || ''}`;
      const resultTokens = new Set(this.tokenize(resultText));

      let overlapCount = 0;
      queryTokens.forEach((token) => {
        if (resultTokens.has(token)) overlapCount++;
      });

      const keywordScore = queryTokens.size > 0 ? overlapCount / queryTokens.size : 0;

      let recencyScore = 0;
      if (result.publishedAt) {
        const publishedMs = new Date(result.publishedAt).getTime();
        if (Number.isFinite(publishedMs)) {
          const ageDays = Math.max(0, (nowMs - publishedMs) / (1000 * 60 * 60 * 24));
          recencyScore = Math.exp(-ageDays / 180);
        }
      }

      const vectorScore = Number(result.similarity || 0);
      const secBoost = this.computeSecRerankBoost(result, hints);
      const rerankScore = (0.55 * vectorScore) + (0.20 * keywordScore) + (0.10 * recencyScore) + (0.15 * secBoost);

      return {
        ...result,
        rerankScore,
      };
    });

    return scored.sort((a, b) => (b.rerankScore || 0) - (a.rerankScore || 0));
  }

  private static deriveQueryIntentHints(query: string): QueryIntentHints {
    const normalized = query.toLowerCase();
    return {
      wantsTenK: /\b10\s*-?k\b|\bannual report\b/.test(normalized),
      wantsTenQ: /\b10\s*-?q\b|\bquarterly report\b/.test(normalized),
      wantsRiskFactors: /\brisk factors?\b|\bitem\s*1a\b/.test(normalized),
    };
  }

  private static computeSecRerankBoost(result: NormalizedSearchResult, hints: QueryIntentHints): number {
    if (result.sourceType !== 'sec_filing') return 0;

    const formType = String(result.metadata?.form_type || '').toUpperCase();
    const section = String(result.metadata?.section || '').toLowerCase();
    const contentLower = String(result.content || '').toLowerCase();

    let boost = 0;

    if (hints.wantsTenK) {
      if (formType === '10-K' || formType === '10K') boost += 1.0;
      else if (formType === '10-Q' || formType === '10Q') boost += 0.6;
      else if (formType.startsWith('8-K') || formType === '8K') boost += 0.2;
      else boost -= 0.3;
    }

    if (hints.wantsTenQ) {
      if (formType === '10-Q' || formType === '10Q') boost += 1.0;
      else if (formType === '10-K' || formType === '10K') boost += 0.4;
      else boost -= 0.2;
    }

    if (hints.wantsRiskFactors) {
      if (section.includes('item 1a') || section.includes('risk')) boost += 1.0;
      else if (contentLower.includes('risk factor')) boost += 0.6;
      else boost -= 0.2;
    }

    // Normalize boost to roughly [0, 1] for weighted blending.
    return Math.max(0, Math.min(1, (boost + 0.6) / 2));
  }

  private static sortSecFilingsByPriority(secFilings: any[]): any[] {
    const preferred = new Map<string, number>([
      ['10-K', 0],
      ['10K', 0],
      ['10-Q', 1],
      ['10Q', 1],
      ['20-F', 2],
      ['6-K', 3],
      ['8-K', 4],
      ['8K', 4],
    ]);

    const score = (filing: any): number => {
      const form = String(filing?.form || '').toUpperCase();
      return preferred.has(form) ? preferred.get(form)! : 20;
    };

    const filingTs = (filing: any): number => {
      const value = filing?.filedDate || filing?.acceptedDate || filing?.date;
      const parsed = Date.parse(String(value || ''));
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return [...secFilings].sort((a, b) => {
      const p = score(a) - score(b);
      if (p !== 0) return p;
      return filingTs(b) - filingTs(a);
    });
  }

  private static getFormType(result: NormalizedSearchResult): string {
    return String(result.metadata?.form_type || '').toUpperCase();
  }

  private static buildSemanticSearchQuery(query: string, hints: QueryIntentHints): string {
    const expansions: string[] = [];

    if (hints.wantsTenK) {
      expansions.push('10-K annual report item 1a risk factors item 7 management discussion');
    }

    if (hints.wantsTenQ) {
      expansions.push('10-Q quarterly report risk factors management discussion');
    }

    if (hints.wantsRiskFactors) {
      expansions.push('risk factors material risks forward looking statements item 1a');
    }

    if (!expansions.length) {
      return query;
    }

    return `${query} ${expansions.join(' ')}`;
  }

  private static hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  private static generateLocalEmbedding(text: string, dimensions = 768): number[] {
    const vector = new Array<number>(dimensions).fill(0);
    const tokens = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2)
      .slice(0, 2000);

    if (!tokens.length) {
      return vector;
    }

    // Signed hashing trick: maps tokens into a fixed vector while preserving rough lexical similarity.
    for (const token of tokens) {
      const hash = createHash('sha1').update(token).digest();
      const idx = hash.readUInt16BE(0) % dimensions;
      const sign = (hash[2] & 1) === 0 ? 1 : -1;
      vector[idx] += sign;
    }

    const magnitude = Math.sqrt(vector.reduce((acc, value) => acc + value * value, 0));
    if (!magnitude) {
      return vector;
    }

    return vector.map((value) => value / magnitude);
  }

  private static getSecHeaders(): Record<string, string> {
    // SEC requests should always include a descriptive user-agent.
    return {
      'User-Agent': process.env.SEC_USER_AGENT || 'FYP-RAG-Ingestion/1.0 (contact: dev@local)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Encoding': 'identity',
    };
  }

  private static stripHtmlToText(html: string): string {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static extractSecSections(text: string): Array<{ section: string; content: string }> {
    const headingRegex = /(Item\s+\d{1,2}[A-Z]?\.?\s*[-:\u2013\u2014]?\s*[A-Za-z0-9 ,()\-\/]{2,120})/gi;
    const matches = Array.from(text.matchAll(headingRegex));

    if (!matches.length) {
      return [{ section: 'full_document', content: text }];
    }

    const sections: Array<{ section: string; content: string }> = [];
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const start = current.index || 0;
      const end = i + 1 < matches.length ? (matches[i + 1].index || text.length) : text.length;
      const sectionHeader = current[1]?.trim() || `section_${i + 1}`;
      const sectionText = text.slice(start, end).trim();

      if (sectionText.length >= 300) {
        sections.push({ section: sectionHeader, content: sectionText });
      }
    }

    return sections.length ? sections : [{ section: 'full_document', content: text }];
  }

  private static async fetchSecFilingText(filing: any): Promise<string | null> {
    const primaryUrl = filing?.reportUrl || filing?.filingUrl;
    const fallbackUrl = filing?.reportUrl && filing?.filingUrl && filing.reportUrl !== filing.filingUrl
      ? filing.filingUrl
      : null;
    if (!primaryUrl) return null;

    const fetchNormalizedText = async (url: string): Promise<string | null> => {
      const response = await fetch(url, { headers: this.getSecHeaders() });
      if (!response.ok) return null;

      const raw = await response.text();
      if (!raw || raw.length < 200) return null;

      const normalized = /<html|<body|<div|<table/i.test(raw)
        ? this.stripHtmlToText(raw)
        : raw.replace(/\s+/g, ' ').trim();

      return normalized.slice(0, 220000);
    };

    try {
      let normalized = await fetchNormalizedText(primaryUrl);

      // If we accidentally parsed an EDGAR index shell, try the fallback URL for richer content.
      if (normalized && /edgar filing documents for/i.test(normalized) && fallbackUrl) {
        const fallback = await fetchNormalizedText(fallbackUrl);
        if (fallback && fallback.length > normalized.length) {
          normalized = fallback;
        }
      }

      return normalized;
    } catch (error) {
      console.warn('Failed to fetch SEC filing text:', primaryUrl, error);
      return null;
    }
  }

  private static async upsertDocumentChunks(document: IngestDocument): Promise<{ inserted: number; deleted: number; skipped: boolean }> {
    const existing = await prisma.$queryRaw<Array<{ content_hash: string | null }>>`
      SELECT metadata->>'content_hash' AS content_hash
      FROM document_embeddings
      WHERE metadata->>'source_id' = ${document.sourceId}
      LIMIT 1
    `;

    const existingHash = existing[0]?.content_hash || null;
    if (existingHash && existingHash === document.metadata.content_hash) {
      return { inserted: 0, deleted: 0, skipped: true };
    }

    let deleted = 0;
    if (existingHash) {
      const deletedRows = await prisma.$queryRaw<Array<{ deleted_count: bigint }>>`
        WITH deleted_rows AS (
          DELETE FROM document_embeddings
          WHERE metadata->>'source_id' = ${document.sourceId}
          RETURNING id
        )
        SELECT COUNT(*)::bigint AS deleted_count FROM deleted_rows
      `;
      deleted = Number(deletedRows[0]?.deleted_count || 0);
    }

    const chunks = (await this.chunkText(document.text)).slice(0, this.getMaxChunksPerDocument(document.type));
    let inserted = 0;

    for (const chunk of chunks) {
      const embedding = await this.generateEmbedding(chunk);
      const embeddingStr = `[${embedding.join(',')}]`;

      await prisma.$executeRaw`
        INSERT INTO document_embeddings (content, embedding, metadata, document_type, source_url)
        VALUES (
          ${chunk},
          ${embeddingStr}::vector,
          ${JSON.stringify(document.metadata)}::jsonb,
          ${document.type},
          ${document.metadata.source || null}
        )
      `;
      inserted++;
    }

    return { inserted, deleted, skipped: false };
  }

  private static async cleanupStaleSecSources(ticker: string, keepSourceIds: string[]): Promise<number> {
    const keepSet = new Set<string | null>(keepSourceIds.filter((id): id is string => Boolean(id)));

    const existing = await prisma.$queryRaw<Array<{ source_id: string | null }>>`
      SELECT DISTINCT metadata->>'source_id' AS source_id
      FROM document_embeddings
      WHERE metadata->>'ticker' = ${ticker}
        AND metadata->>'type' = 'sec_filing'
    `;

    const stale = existing
      .map((row) => row.source_id)
      .filter((sourceId): sourceId is string => {
        if (!sourceId) return false;
        return !keepSet.has(sourceId);
      });

    if (!stale.length) return 0;

    let deletedTotal = 0;
    for (const sourceId of stale) {
      const deletedRows = await prisma.$queryRaw<Array<{ deleted_count: bigint }>>`
        WITH deleted_rows AS (
          DELETE FROM document_embeddings
          WHERE metadata->>'source_id' = ${sourceId}
          RETURNING id
        )
        SELECT COUNT(*)::bigint AS deleted_count FROM deleted_rows
      `;
      deletedTotal += Number(deletedRows[0]?.deleted_count || 0);
    }

    return deletedTotal;
  }

  private static async buildDocumentsToIngest(
    ticker: string,
    profile: any,
    news: any[],
    financials: any,
    secFilings: any[]
  ): Promise<IngestDocument[]> {
    const nowIso = new Date().toISOString();
    const documentsToChunk: IngestDocument[] = [];

    if (profile && profile.name) {
      const sourceId = `profile:${ticker}`;
      const text = `Company Profile for ${profile.name} (${profile.ticker}):\nIndustry: ${profile.finnhubIndustry}\nMarket Cap: ${profile.marketCapitalization}\nDescription: ${profile.description}\nWebsite: ${profile.weburl}`;
      documentsToChunk.push({
        sourceId,
        text,
        metadata: {
          ticker,
          source: 'company_profile',
          type: 'profile',
          source_id: sourceId,
          content_hash: this.hashContent(text),
          ingested_at: nowIso,
        },
        type: 'company_profile',
      });
    }

    if (news && news.length > 0) {
      const topNews = news.slice(0, 10);
      for (const item of topNews) {
        const publishedAt = new Date(item.datetime * 1000).toISOString();
        const sourceId = `news:${ticker}:${item.id || item.url || item.datetime}`;
        const text = `News for ${ticker} on ${publishedAt.split('T')[0]}: ${item.headline}\n${item.summary}`;
        documentsToChunk.push({
          sourceId,
          text,
          metadata: {
            ticker,
            source: item.url || 'news_provider',
            type: 'news',
            date: item.datetime,
            publishedAt,
            source_id: sourceId,
            content_hash: this.hashContent(text),
            ingested_at: nowIso,
          },
          type: 'news',
        });
      }
    }

    if (financials && financials.metric) {
      const asOf = new Date().toISOString().split('T')[0];
      const sourceId = `financials:${ticker}:${asOf}`;
      const text = `Financial Metrics for ${ticker}:\n52 Week High: ${financials.metric['52WeekHigh']}\n52 Week Low: ${financials.metric['52WeekLow']}\nPE Ratio (TTM): ${financials.metric.peBasicExclExtraTTM}\nBeta: ${financials.metric.beta}`;
      documentsToChunk.push({
        sourceId,
        text,
        metadata: {
          ticker,
          source: 'basic_financials',
          type: 'financials',
          publishedAt: asOf,
          source_id: sourceId,
          content_hash: this.hashContent(text),
          ingested_at: nowIso,
        },
        type: 'financials',
      });
    }

    if (secFilings && secFilings.length > 0) {
      const prioritized = this.sortSecFilingsByPriority(secFilings);
      const maxFilings = Math.max(1, Number(process.env.RAG_SEC_MAX_FILINGS || 3));
      const topFilings = prioritized.slice(0, maxFilings);
      for (const filing of topFilings) {
        const filingKey = filing.accessNumber || filing.filedDate || filing.form || 'unknown';
        const filedDate = filing.filedDate || filing.acceptedDate || null;
        const secSourceUrl = filing.filingUrl || filing.reportUrl || 'sec_filing';

        const filingText = await this.fetchSecFilingText(filing);
        const sections = filingText
          ? this.extractSecSections(filingText)
          : [{
              section: 'filing_summary',
              content: [
                `SEC Filing for ${ticker}`,
                `Form: ${filing.form || 'N/A'}`,
                `Access Number: ${filing.accessNumber || 'N/A'}`,
                `Filed Date: ${filing.filedDate || 'N/A'}`,
                `Accepted Date: ${filing.acceptedDate || 'N/A'}`,
                `Report URL: ${filing.reportUrl || 'N/A'}`,
                `Filing URL: ${filing.filingUrl || 'N/A'}`,
              ].join('\n'),
            }];

        const maxSections = Math.max(1, Number(process.env.RAG_SEC_MAX_SECTIONS_PER_FILING || 4));
        const maxSectionChars = Math.max(1200, Number(process.env.RAG_SEC_MAX_SECTION_CHARS || 12000));

        for (const [index, section] of sections.slice(0, maxSections).entries()) {
          const sourceId = `sec:${ticker}:${filingKey}:section_${index + 1}`;
          const sectionText = section.content.slice(0, maxSectionChars);

          documentsToChunk.push({
            sourceId,
            text: sectionText,
            metadata: {
              ticker,
              source: secSourceUrl,
              type: 'sec_filing',
              publishedAt: filedDate || undefined,
              source_id: sourceId,
              content_hash: this.hashContent(sectionText),
              ingested_at: nowIso,
              form_type: filing.form || undefined,
              filing_date: filing.filedDate || undefined,
              section: section.section,
            },
            type: 'sec_filing',
          });
        }
      }
    }

    return documentsToChunk;
  }

  /**
   * Generates embeddings for a given text using Gemini
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set. Cannot generate embeddings.");
      throw new Error("GEMINI_API_KEY is missing");
    }

    const configuredModel = process.env.GEMINI_EMBEDDING_MODEL?.trim();
    const candidateModels = [
      configuredModel,
      "text-embedding-004",
      "embedding-001",
    ].filter(Boolean) as string[];

    let lastError: unknown = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;
        if (embedding && embedding.length > 0) {
          return embedding;
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError && !this.fallbackEmbeddingWarningShown) {
      this.fallbackEmbeddingWarningShown = true;
      console.warn('Falling back to local hash embedding because Gemini embeddings are unavailable.');
    }

    return this.generateLocalEmbedding(text);
  }

  /**
   * Chunks text into smaller pieces for embedding
   */
  static async chunkText(text: string, chunkSize = 1000, chunkOverlap = 200): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
    const docs = await splitter.createDocuments([text]);
    return docs.map((doc) => doc.pageContent);
  }

  /**
   * Ingests a company's profile and recent info into the vector database
   */
  static async ingestCompanyContext(ticker: string): Promise<IngestSummary> {
    try {
      const normalizedTicker = ticker.trim().toUpperCase();
      const secFrom = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const secTo = new Date().toISOString().split('T')[0];

      const profile = await marketDataService.getCompanyProfile(ticker);
      const news = await marketDataService.getCompanyNews(
        normalizedTicker,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
        new Date().toISOString().split('T')[0]
      );
      const financials = await marketDataService.getBasicFinancials(normalizedTicker);
      const secFilings = await marketDataService.getSECFilings(normalizedTicker, secFrom, secTo);

      const documentsToChunk = await this.buildDocumentsToIngest(normalizedTicker, profile, news || [], financials, secFilings || []);
      const secSourceIds = documentsToChunk
        .filter((doc) => doc.type === 'sec_filing')
        .map((doc) => doc.sourceId);
      const staleSecChunksDeleted = await this.cleanupStaleSecSources(normalizedTicker, secSourceIds);

      let chunksInserted = 0;
      let chunksDeleted = staleSecChunksDeleted;
      let documentsSkipped = 0;

      for (const doc of documentsToChunk) {
        const upsertResult = await this.upsertDocumentChunks(doc);
        chunksInserted += upsertResult.inserted;
        chunksDeleted += upsertResult.deleted;
        if (upsertResult.skipped) {
          documentsSkipped++;
        }
      }

      return {
        success: true,
        ticker: normalizedTicker,
        chunksInserted,
        chunksDeleted,
        documentsProcessed: documentsToChunk.length,
        documentsSkipped,
      };
    } catch (error) {
      console.error('Error ingesting company context:', error);
      throw error;
    }
  }

  static async ingestTickers(tickers: string[]): Promise<IngestSummary[]> {
    const sanitizedTickers = Array.from(new Set(tickers.map((t) => t.trim().toUpperCase()).filter(Boolean)));
    const results: IngestSummary[] = [];

    for (const ticker of sanitizedTickers) {
      results.push(await this.ingestCompanyContext(ticker));
    }

    return results;
  }

  static async getIngestionStatus(ticker: string) {
    const normalizedTicker = ticker.trim().toUpperCase();
    const rows = await prisma.$queryRaw<Array<{ document_type: string; chunk_count: bigint; latest_ingested_at: string | null }>>`
      SELECT
        document_type,
        COUNT(*)::bigint AS chunk_count,
        MAX(metadata->>'ingested_at') AS latest_ingested_at
      FROM document_embeddings
      WHERE metadata->>'ticker' = ${normalizedTicker}
      GROUP BY document_type
      ORDER BY document_type
    `;

    return {
      ticker: normalizedTicker,
      byType: rows.map((row) => ({
        documentType: row.document_type,
        chunkCount: Number(row.chunk_count || 0),
        latestIngestedAt: row.latest_ingested_at,
      })),
    };
  }

  static async ensureTickerContextFresh(ticker: string, maxAgeMinutes = Number(process.env.RAG_QUERY_REFRESH_MAX_AGE_MINUTES || 360)): Promise<void> {
    const normalizedTicker = ticker.trim().toUpperCase();
    if (!normalizedTicker) return;

    const existingLock = this.ingestionLocks.get(normalizedTicker);
    if (existingLock) {
      await existingLock;
      return;
    }

    const lock = (async () => {
      const status = await this.getIngestionStatus(normalizedTicker);
      const totalChunks = status.byType.reduce((acc, row) => acc + row.chunkCount, 0);
      const latest = status.byType
        .map((row) => row.latestIngestedAt)
        .filter(Boolean)
        .sort()
        .reverse()[0];

      const nowMs = Date.now();
      const latestMs = latest ? new Date(latest).getTime() : 0;
      const maxAgeMs = maxAgeMinutes * 60 * 1000;
      const lastAttempt = this.lastIngestionAttemptMs.get(normalizedTicker) || 0;
      const withinCooldown = nowMs - lastAttempt < this.tickerIngestionCooldownMs;

      if (totalChunks === 0 || !latestMs || nowMs - latestMs > maxAgeMs) {
        if (withinCooldown) {
          return;
        }
        this.lastIngestionAttemptMs.set(normalizedTicker, nowMs);
        await this.ingestCompanyContext(normalizedTicker);
      }
    })();

    this.ingestionLocks.set(normalizedTicker, lock);
    try {
      await lock;
    } finally {
      this.ingestionLocks.delete(normalizedTicker);
    }
  }

  static async getActivePortfolioTickers(limit = 25): Promise<string[]> {
    const [simHoldings, realHoldings] = await Promise.all([
      prisma.simulatorHolding.findMany({
        distinct: ['assetId'],
        take: limit,
        select: { assetId: true },
      }),
      prisma.holding.findMany({
        distinct: ['assetId'],
        take: limit,
        select: { assetId: true },
      }),
    ]);

    return Array.from(
      new Set(
        [...simHoldings, ...realHoldings]
          .map((row) => String(row.assetId || '').toUpperCase())
          .filter(Boolean)
      )
    ).slice(0, limit);
  }

  static getMvpUniverseTickers(limit = 20): string[] {
    const configured = (process.env.RAG_MVP_TICKERS || '')
      .split(',')
      .map((ticker) => ticker.trim().toUpperCase())
      .filter(Boolean);

    const fallbackUniverse = [
      'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL',
      'META', 'TSLA', 'JPM',
    ];

    const universe = configured.length > 0 ? configured : fallbackUniverse;
    return Array.from(new Set(universe)).slice(0, limit);
  }

  static async refreshMvpUniverseTickers(maxTickers = 10): Promise<RefreshSummary> {
    const tickers = this.getMvpUniverseTickers(maxTickers);
    if (!tickers.length) {
      return { tickers: [], results: [] };
    }

    const results = await this.ingestTickers(tickers);
    return { tickers, results };
  }

  static async refreshActivePortfolioTickers(maxTickers = 20): Promise<RefreshSummary> {
    const tickers = await this.getActivePortfolioTickers(maxTickers);
    if (!tickers.length) {
      return { tickers: [], results: [] };
    }

    const results = await this.ingestTickers(tickers);
    return { tickers, results };
  }

  /**
   * Search for similar documents
   */
  static async searchSimilarDocuments(
    query: string,
    matchCount = 5,
    documentType?: string,
    filters?: SearchFilters
  ) {
    if (!process.env.GEMINI_API_KEY) {
       console.warn("Skipping RAG search because GEMINI_API_KEY is not set.");
       return [];
    }

    const hints = this.deriveQueryIntentHints(query);
    const semanticQuery = this.buildSemanticSearchQuery(query, hints);
    const queryEmbedding = await this.generateEmbedding(semanticQuery);
    const embeddingStr = `[${queryEmbedding.join(',')}]`;
    const isSecSearch = (filters?.sourceTypes || []).some((type) => type.toLowerCase() === 'sec_filing');
    const candidateMultiplier = isSecSearch && (hints.wantsTenK || hints.wantsTenQ || hints.wantsRiskFactors) ? 12 : 3;
    const candidateCount = Math.max(matchCount * candidateMultiplier, matchCount);
    const similarityThreshold = Number(process.env.RAG_MATCH_THRESHOLD || 0.0);
    
    // Call the match_documents function
    const result = await prisma.$queryRaw<RawSearchResult[]>`
      SELECT * FROM match_documents(
        ${embeddingStr}::vector, 
        CAST(${similarityThreshold} AS double precision), 
        CAST(${candidateCount} AS integer), 
        CAST(${documentType || null} AS varchar)
      )
    `;

    const normalized = this.normalizeSearchResults(result);
    const filtered = this.applySearchFilters(normalized, filters);

    let recallSet = filtered;
    if (isSecSearch && (hints.wantsTenK || hints.wantsTenQ)) {
      const desiredForms = hints.wantsTenK
        ? new Set(['10-K', '10K', '10-Q', '10Q'])
        : new Set(['10-Q', '10Q', '10-K', '10K']);

      const preferred = filtered.filter((item) => desiredForms.has(this.getFormType(item)));
      if (preferred.length > 0) {
        recallSet = preferred;
      }
    }

    const reranked = this.rerankResults(query, recallSet);
    return reranked.slice(0, matchCount);
  }
}
