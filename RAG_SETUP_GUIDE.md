# RAG Setup Guide - Supabase pgvector

## Overview
This guide prepares the foundation for implementing Retrieval-Augmented Generation (RAG) using Supabase's pgvector extension. This will enable the AI advisor to provide context-aware responses based on your document database.

## Why Supabase pgvector?

### Advantages:
✅ **Same Database** - No additional service needed (you're already using Supabase)
✅ **Cost-Effective** - Free tier: 500MB database, 2GB bandwidth/month
✅ **PostgreSQL Native** - Reliable, ACID-compliant, familiar SQL
✅ **Fast Similarity Search** - Optimized vector operations with HNSW/IVFFlat indexes
✅ **Full-Text Search** - Combine vector and keyword search
✅ **Serverless Functions** - Easy integration with existing backend

### vs. Alternatives:
- **Pinecone**: Separate service, free tier limited (1 index, 100K vectors)
- **Weaviate**: Self-hosted complexity
- **Chroma**: Good for prototyping, not production-scale
- **Qdrant**: Another external service to manage

## Architecture

```
User Query
    ↓
Generate Embedding (OpenAI ada-002 or similar)
    ↓
Search pgvector Table (cosine similarity)
    ↓
Retrieve Top K Documents (k=5-10)
    ↓
Inject into LLM Context (System Prompt)
    ↓
Groq LLM Generation
    ↓
Response with Citations
```

## Setup Steps

### 1. Enable pgvector Extension in Supabase

**Option A: Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Database** → **Extensions**
4. Search for "vector"
5. Click **Enable** on `pgvector`

**Option B: SQL Editor**
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Create Vector Embeddings Table

```sql
-- Create table for document embeddings
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-ada-002 dimensions
  metadata JSONB DEFAULT '{}',
  document_type VARCHAR(50), -- 'news', 'filing', 'learning', 'company_profile'
  source_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for fast similarity search (IVFFlat for large datasets)
CREATE INDEX ON document_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100); -- Adjust lists based on dataset size (sqrt of total rows)

-- For smaller datasets or better accuracy, use HNSW instead:
-- CREATE INDEX ON document_embeddings 
-- USING hnsw (embedding vector_cosine_ops);

-- Add GIN index for metadata filtering
CREATE INDEX idx_document_metadata ON document_embeddings USING GIN (metadata);

-- Add index for document type filtering
CREATE INDEX idx_document_type ON document_embeddings (document_type);

-- Create function to search similar documents
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE 
    (filter_type IS NULL OR document_embeddings.document_type = filter_type)
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 3. Create Prisma Schema (Add to `server/prisma/schema.prisma`)

```prisma
// Unsupported type in Prisma, use raw SQL queries instead
// model DocumentEmbedding {
//   id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
//   content      String
//   // embedding is VECTOR type - not natively supported by Prisma
//   metadata     Json     @default("{}")
//   documentType String?  @map("document_type") @db.VarChar(50)
//   sourceUrl    String?  @map("source_url")
//   createdAt    DateTime @default(now()) @map("created_at")
//   updatedAt    DateTime @default(now()) @map("updated_at")
//
//   @@index([documentType])
//   @@map("document_embeddings")
// }

// Note: Due to pgvector's VECTOR type, use raw SQL queries via Prisma.$queryRaw
```

### 4. Install Embedding Dependencies

```bash
npm install openai
# Or use a free alternative:
# npm install @xenova/transformers
```

### 5. Create Embedding Service

```typescript
// server/services/embedding.service.ts
import { OpenAI } from 'openai';
import { prisma } from '../lib/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class EmbeddingService {
  /**
   * Generate embedding for text using OpenAI
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002', // $0.0001 per 1K tokens
      input: text,
    });
    
    return response.data[0].embedding;
  }

  /**
   * Store document with embedding
   */
  static async storeDocument(
    content: string,
    metadata: Record<string, any>,
    documentType: string
  ): Promise<string> {
    const embedding = await this.generateEmbedding(content);
    
    const result = await prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO document_embeddings (content, embedding, metadata, document_type)
      VALUES (${content}, ${embedding}::vector, ${JSON.stringify(metadata)}, ${documentType})
      RETURNING id
    `;
    
    return result[0].id;
  }

  /**
   * Search similar documents
   */
  static async searchSimilar(
    query: string,
    limit: number = 5,
    threshold: number = 0.7,
    documentType?: string
  ): Promise<Array<{ content: string; metadata: any; similarity: number }>> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    const results = await prisma.$queryRaw<any[]>`
      SELECT 
        content,
        metadata,
        1 - (embedding <=> ${queryEmbedding}::vector) as similarity
      FROM document_embeddings
      WHERE 
        (${documentType}::text IS NULL OR document_type = ${documentType})
        AND 1 - (embedding <=> ${queryEmbedding}::vector) > ${threshold}
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT ${limit}
    `;
    
    return results;
  }
}
```

### 6. Environment Variables

Add to `.env`:
```bash
# For embeddings (choose one)
OPENAI_API_KEY="sk-..." # Paid, best quality
# or
HUGGINGFACE_API_KEY="hf_..." # Free alternative
```

## Data Ingestion Strategy

### Priority Sources (Implement First):

#### 1. **Company News** (Already Available)
- Source: `/api/news` endpoints
- Chunk: Title + description + content
- Metadata: `{ symbol, date, sentiment, source }`
- Ingestion: Hourly batch job

#### 2. **SEC Filings** (Already Fetched)
- Source: `/api/trading/market/filings/:symbol`
- Chunk: By section (10-K: Item 1A Risk Factors, Item 7 MD&A)
- Metadata: `{ symbol, form_type, filing_date, section }`
- Ingestion: On-demand when user views filing

#### 3. **Company Profiles**
- Source: `/api/trading/market/company/:symbol`
- Chunk: Description + business summary
- Metadata: `{ symbol, industry, sector }`
- Ingestion: On first user query about company

#### 4. **Learning Content**
- Source: Create financial education articles
- Chunk: By section/paragraph (500-1000 chars)
- Metadata: `{ topic, difficulty, keywords }`
- Ingestion: Seed script

### Chunking Strategy

```typescript
export function chunkDocument(
  text: string,
  chunkSize: number = 800,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap; // Overlap for context continuity
  }
  
  return chunks;
}
```

## Integration with Advisor Service

Update `server/modules/advisor/service.ts`:

```typescript
import { EmbeddingService } from '../../services/embedding.service';

// In generateSystemPrompt method:
async generateSystemPrompt(context: ChatContext): Promise<string> {
  let systemPrompt = `...base prompt...`;
  
  // Add RAG context
  const relevantDocs = await EmbeddingService.searchSimilar(
    context.userQuery, // Pass the user's current query
    5, // Top 5 documents
    0.7 // 70% similarity threshold
  );
  
  if (relevantDocs.length > 0) {
    systemPrompt += `\n\n## Relevant Information:\n`;
    relevantDocs.forEach((doc, i) => {
      systemPrompt += `\n### Source ${i + 1} (${doc.metadata.source || 'Unknown'}):\n`;
      systemPrompt += doc.content + '\n';
    });
    
    systemPrompt += `\n\nUse the above sources to provide accurate, cited information. Reference sources in your response.`;
  }
  
  return systemPrompt;
}
```

## Testing RAG

### 1. Seed Sample Data

```sql
-- Insert sample news article
INSERT INTO document_embeddings (content, metadata, document_type)
SELECT 
  'Apple announces record Q4 earnings, beating analyst expectations...',
  '{"symbol": "AAPL", "date": "2025-12-10", "source": "Reuters"}'::jsonb,
  'news'
RETURNING id;
```

### 2. Test Similarity Search

```typescript
// Test in advisor controller
const results = await EmbeddingService.searchSimilar(
  'How is Apple performing?',
  3
);
console.log('Found:', results);
```

### 3. Monitor Performance

```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans
FROM pg_stat_user_indexes
WHERE tablename = 'document_embeddings';

-- Check table size
SELECT 
  pg_size_pretty(pg_total_relation_size('document_embeddings')) as total_size,
  count(*) as row_count
FROM document_embeddings;
```

## Cost Estimation

### OpenAI Embeddings:
- **Model**: text-embedding-ada-002
- **Cost**: $0.0001 per 1,000 tokens (~750 words)
- **Example**: 1,000 news articles (avg 500 words each) = ~$0.07

### Groq API (LLM):
- **Free Tier**: 14,400 requests/day, 2.88M tokens/day
- **Cost**: FREE (for now)

### Supabase:
- **Free Tier**: 500MB database, 2GB bandwidth
- **Vectors**: ~10KB per embedding (1536 dimensions)
- **Capacity**: ~50,000 documents in free tier

**Estimated Monthly Cost for 10,000 documents:**
- Embeddings: ~$7 one-time
- Supabase: $0 (free tier)
- Groq: $0 (free tier)
- **Total: ~$7 one-time setup**

## Performance Optimization

### 1. Index Tuning
```sql
-- For datasets < 10K vectors, use HNSW (better accuracy)
CREATE INDEX idx_hnsw ON document_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- For datasets > 10K vectors, use IVFFlat (faster)
CREATE INDEX idx_ivfflat ON document_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100); -- lists = sqrt(row_count)
```

### 2. Caching
- Cache embeddings for common queries
- Cache search results for 5 minutes
- Use Redis for distributed cache

### 3. Batch Operations
- Generate embeddings in batches of 100
- Use async/await with concurrency limits
- Implement job queue for background processing

## Next Steps

1. **Phase 1: Setup** ✅ (This guide)
   - Enable pgvector
   - Create tables and indexes
   - Install dependencies

2. **Phase 2: Ingestion** (Next)
   - Create seed script for initial data
   - Implement background jobs
   - Set up webhooks for real-time updates

3. **Phase 3: Integration** (After testing)
   - Update advisor service with RAG
   - Add source citations in responses
   - Implement feedback loop

4. **Phase 4: Optimization** (Production)
   - Fine-tune similarity thresholds
   - Implement hybrid search (vector + full-text)
   - Add re-ranking with LLM

## Troubleshooting

### Error: "extension vector does not exist"
```sql
CREATE EXTENSION vector;
```

### Error: "index method ivfflat does not exist"
Make sure pgvector is properly installed. Try HNSW instead:
```sql
CREATE INDEX ON document_embeddings USING hnsw (embedding vector_cosine_ops);
```

### Slow Queries?
- Check index is being used: `EXPLAIN ANALYZE SELECT ...`
- Increase `lists` parameter for IVFFlat
- Consider upgrading Supabase plan for better performance

### Out of Memory?
- Reduce `match_count` in queries
- Implement pagination
- Archive old embeddings

## Resources

- [Supabase Vector Docs](https://supabase.com/docs/guides/database/extensions/pgvector)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [RAG Best Practices](https://www.anthropic.com/index/retrieval-augmented-generation-best-practices)

---

**Status**: Foundation ready ✅  
**Next Action**: Run SQL scripts in Supabase dashboard  
**Estimated Time**: 15 minutes setup, 2-3 hours for full ingestion pipeline
