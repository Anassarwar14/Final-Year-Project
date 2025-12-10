/**
 * Advisor API Service
 * Handles all API calls to the AI Financial Advisor backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: string[]
  timestamp: Date
}

export interface ChatSession {
  id: string
  title: string
  preview?: string
  createdAt: Date
  updatedAt: Date
  messageCount?: number
  messages?: ChatMessage[]
}

export interface SendMessageRequest {
  sessionId?: string
  message: string
  includePortfolio?: boolean
}

export interface SendMessageResponse {
  success: boolean
  data: {
    message: string
    sources: string[]
    sessionId: string
  }
}

export interface SessionsResponse {
  success: boolean
  data: Array<{
    id: string
    title: string
    preview: string
    timestamp: Date
    messageCount: number
  }>
}

export interface SessionResponse {
  success: boolean
  data: {
    id: string
    title: string
    createdAt: Date
    updatedAt: Date
    messages: ChatMessage[]
  }
}

export class AdvisorApiService {
  /**
   * Send a message to the AI advisor
   */
  static async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await fetch(`${API_BASE}/api/advisor/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to send message" }))
      throw new Error(error.error || "Failed to send message")
    }

    return response.json()
  }

  /**
   * Send a message with streaming response
   */
  static async sendMessageStream(
    request: SendMessageRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/api/advisor/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error("Failed to stream message")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let sessionId = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          onComplete()
          break
        }

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))

            if (data.type === "session") {
              sessionId = data.sessionId
            } else if (data.type === "chunk") {
              onChunk(data.content)
            } else if (data.type === "done") {
              onComplete()
            } else if (data.type === "error") {
              onError(new Error(data.message))
            }
          }
        }
      }

      return sessionId
    } catch (error) {
      onError(error instanceof Error ? error : new Error("Unknown error"))
      throw error
    }
  }

  /**
   * Get all chat sessions for the current user
   */
  static async getSessions(): Promise<SessionsResponse> {
    const response = await fetch(`${API_BASE}/api/advisor/sessions`, {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch sessions")
    }

    return response.json()
  }

  /**
   * Get a specific chat session with all messages
   */
  static async getSession(sessionId: string): Promise<SessionResponse> {
    const response = await fetch(`${API_BASE}/api/advisor/sessions/${sessionId}`, {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch session")
    }

    return response.json()
  }

  /**
   * Create a new chat session
   */
  static async createSession(initialMessage?: string): Promise<{ success: boolean; data: { id: string; title: string; createdAt: Date } }> {
    const response = await fetch(`${API_BASE}/api/advisor/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ initialMessage }),
    })

    if (!response.ok) {
      throw new Error("Failed to create session")
    }

    return response.json()
  }

  /**
   * Delete a chat session
   */
  static async deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/api/advisor/sessions/${sessionId}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to delete session")
    }

    return response.json()
  }

  /**
   * Get a quick action prompt
   */
  static async getQuickAction(action: "portfolio_analysis" | "market_update" | "risk_check" | "investment_ideas"): Promise<{ success: boolean; data: { prompt: string } }> {
    const response = await fetch(`${API_BASE}/api/advisor/quick-action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ action }),
    })

    if (!response.ok) {
      throw new Error("Failed to get quick action")
    }

    return response.json()
  }
}

export const advisorApi = AdvisorApiService
