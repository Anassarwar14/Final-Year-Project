# AI Financial Advisor Module

## Overview
The AI Financial Advisor module provides intelligent, context-aware financial advice powered by Groq's ultra-fast LLM inference. It integrates with the user's portfolio data to deliver personalized investment recommendations, market analysis, and risk assessments.

## Features
- 🤖 **Groq-Powered AI**: Uses `llama-3.3-70b-versatile` for superior financial reasoning
- 💼 **Portfolio-Aware**: Automatically includes user's holdings in context
- 💬 **Session Management**: Maintains conversation history across multiple chats
- 🚀 **Streaming Responses**: Real-time message streaming for better UX
- 📊 **Quick Actions**: Pre-defined prompts for common financial queries
- 🔒 **Secure**: Protected by Better Auth middleware
- 📝 **RAG-Ready**: Architecture prepared for vector database integration

## API Endpoints

### Chat Endpoints

#### `POST /api/advisor/chat`
Send a message and get AI response.

**Request:**
```json
{
  "sessionId": "session_123" // optional, auto-generated if not provided
  "message": "How is my portfolio performing?",
  "includePortfolio": true // optional, defaults to true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Your portfolio has shown a 12.5% growth...",
    "sources": [], // RAG sources (future)
    "sessionId": "session_123"
  }
}
```

#### `POST /api/advisor/chat/stream`
Send a message with streaming response (Server-Sent Events).

**Request:** Same as `/chat`

**Response:** SSE stream
```
data: {"type":"session","sessionId":"session_123"}

data: {"type":"chunk","content":"Your "}

data: {"type":"chunk","content":"portfolio "}

data: {"type":"done"}
```

### Session Management

#### `GET /api/advisor/sessions`
Get all chat sessions for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "session_123",
      "title": "Portfolio Analysis Discussion",
      "preview": "How is my portfolio performing?",
      "timestamp": "2025-12-10T10:30:00Z",
      "messageCount": 8
    }
  ]
}
```

#### `GET /api/advisor/sessions/:id`
Get a specific session with all messages.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session_123",
    "title": "Portfolio Analysis Discussion",
    "createdAt": "2025-12-10T10:00:00Z",
    "updatedAt": "2025-12-10T10:30:00Z",
    "messages": [
      {
        "id": "msg_1",
        "role": "user",
        "content": "How is my portfolio?",
        "sources": [],
        "timestamp": "2025-12-10T10:00:00Z"
      },
      {
        "id": "msg_2",
        "role": "assistant",
        "content": "Your portfolio is performing well...",
        "sources": [],
        "timestamp": "2025-12-10T10:00:15Z"
      }
    ]
  }
}
```

#### `POST /api/advisor/sessions`
Create a new chat session.

**Request:**
```json
{
  "initialMessage": "I want to discuss my portfolio" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session_456",
    "title": "Portfolio Discussion",
    "createdAt": "2025-12-10T11:00:00Z"
  }
}
```

#### `DELETE /api/advisor/sessions/:id`
Delete a chat session.

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

### Quick Actions

#### `POST /api/advisor/quick-action`
Get pre-defined prompts for common actions.

**Request:**
```json
{
  "action": "portfolio_analysis" // or "market_update", "risk_check", "investment_ideas"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prompt": "Please provide a comprehensive analysis of my current portfolio..."
  }
}
```

## Groq Models

### Primary Model: `llama-3.3-70b-versatile`
- **Best for**: Complex financial reasoning, portfolio analysis
- **Strengths**: Superior accuracy, nuanced understanding
- **Speed**: ~100 tokens/second
- **Context Window**: 32,768 tokens

### Alternative Models Available:
- `llama-3.1-70b-versatile` - Excellent balance
- `mixtral-8x7b-32768` - Large context for RAG
- `llama-3.1-8b-instant` - Ultra-fast for simple queries

### Model Comparison for Finance:
| Model | Speed | Accuracy | Finance Knowledge | Best Use Case |
|-------|-------|----------|-------------------|---------------|
| llama-3.3-70b | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Main advisor |
| llama-3.1-70b | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Alternative |
| mixtral-8x7b | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | RAG queries |
| llama-3.1-8b | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Title generation |

## Setup Instructions

### 1. Get Groq API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up for free account
3. Create new API key
4. Copy the key

### 2. Configure Environment
Add to your `.env` file:
```bash
GROQ_API_KEY="gsk_your_key_here"
```

### 3. Run Database Migrations
```bash
npm run prisma:migrate
```

This creates the necessary tables:
- `AiChatSession` - Stores conversation sessions
- `AiChatMessage` - Stores individual messages

### 4. Test the API
```bash
curl -X POST http://localhost:3000/api/advisor/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "message": "What stocks should I invest in?",
    "includePortfolio": true
  }'
```

## Architecture

### Service Layer (`service.ts`)
- Handles LLM interactions with Groq
- Manages conversation context
- Integrates portfolio data
- Prepares for RAG implementation

### Controller Layer (`controller.ts`)
- Validates requests with Zod schemas
- Handles HTTP concerns
- Manages streaming responses
- Error handling

### Routes Layer (`index.ts`)
- Defines API endpoints
- Applies authentication middleware
- Routes requests to controllers

## Portfolio Context Integration

The advisor automatically includes user portfolio data in the system prompt:

```typescript
## User's Current Portfolio:
**Total Value:** $100,149.88
**Cash Balance:** $5,000.00
**Total P&L:** +$8,149.88 (8.87%)
**Holdings:** 5 positions

### Current Holdings:
- **AAPL**: 50 shares @ $150.00 | Current: $175.50 | P&L: +$1,275.00 (+17.0%)
- **MSFT**: 30 shares @ $300.00 | Current: $380.20 | P&L: +$2,406.00 (+26.7%)
...
```

This enables personalized advice like:
- "Your AAPL position is up 17%, consider taking partial profits"
- "You're overweight in tech (65% of portfolio), diversify into other sectors"
- "Based on your current holdings, NVDA would complement your tech exposure"

## Future: RAG Implementation

### Phase 1: Vector Database Setup (Supabase pgvector)
```sql
-- Enable pgvector extension
CREATE EXTENSION vector;

-- Create embeddings table
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI ada-002 dimensions
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for similarity search
CREATE INDEX ON document_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Phase 2: Document Ingestion
Sources to embed:
- SEC filings (10-K, 10-Q)
- Company news articles
- Analyst reports
- Learning hub content
- Market research

### Phase 3: Retrieval Integration
```typescript
// Pseudo-code for RAG
async sendMessage(userId, sessionId, message) {
  // 1. Generate embedding for user query
  const queryEmbedding = await generateEmbedding(message);
  
  // 2. Search vector database
  const relevantDocs = await vectorSearch(queryEmbedding, limit: 5);
  
  // 3. Enhance system prompt with retrieved context
  const enhancedPrompt = `
    ${systemPrompt}
    
    ## Relevant Information:
    ${relevantDocs.map(doc => doc.content).join('\n\n')}
  `;
  
  // 4. Generate response with citations
  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: enhancedPrompt },
      { role: "user", content: message }
    ]
  });
  
  return {
    message: response,
    sources: relevantDocs.map(d => d.metadata.source)
  };
}
```

## Groq Free Tier Limits

- **Requests per minute**: 30
- **Requests per day**: 14,400
- **Tokens per minute**: 6,000
- **Tokens per day**: 2,880,000

**Tip**: For production, implement rate limiting per user to stay within limits.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "details": {} // Validation errors if applicable
}
```

Common errors:
- `401 Unauthorized` - Invalid or missing authentication
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Session not found
- `500 Internal Server Error` - LLM or database error

## Best Practices

### 1. Session Management
- Auto-generate session IDs on first message
- Clean up old sessions periodically
- Limit messages per session to manage context size

### 2. Context Window Management
- Current: Last 20 messages included in context
- For longer conversations, implement summarization
- Monitor token usage to avoid context overflow

### 3. Portfolio Data Freshness
- Portfolio data fetched on each message
- Consider caching for 5-10 minutes
- Invalidate cache on trades

### 4. Rate Limiting
- Implement per-user query limits (e.g., 500/month)
- Track usage in database
- Show remaining queries in UI

### 5. Streaming Best Practices
- Use streaming for responses > 100 tokens
- Implement client-side buffering
- Handle connection drops gracefully

## Testing

### Unit Tests (Future)
```typescript
describe('AdvisorService', () => {
  it('should generate personalized advice with portfolio context', async () => {
    const response = await advisorService.sendMessage(
      'user_123',
      'session_test',
      'Should I buy more AAPL?',
      true
    );
    
    expect(response.message).toContain('AAPL');
    expect(response.sessionId).toBe('session_test');
  });
});
```

### Integration Tests
```bash
# Test chat endpoint
npm run test:integration -- advisor.test.ts
```

## Monitoring

Key metrics to track:
- Response latency (target: <3s for non-streaming)
- Token usage per query
- User satisfaction (thumbs up/down)
- Session length (messages per session)
- Most common queries

## Troubleshooting

### "Unauthorized" error
- Check if `GROQ_API_KEY` is set in `.env`
- Verify API key is valid on Groq console
- Ensure Better Auth session is active

### "Failed to fetch portfolio"
- Check if user has initialized simulator profile
- Verify portfolio service is working
- Check database connection

### Slow responses
- Switch to faster model (`llama-3.1-8b-instant`)
- Reduce `max_tokens` parameter
- Disable portfolio context for general queries

### Rate limiting errors
- Implement request queuing
- Cache common responses
- Upgrade Groq plan

## Contributing

When adding new features:
1. Update service methods
2. Add controller endpoints
3. Register routes
4. Update API documentation
5. Add tests

## License
Part of Final Year Project - Trading Simulator Platform
