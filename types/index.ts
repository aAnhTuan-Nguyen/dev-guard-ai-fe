// ==================== AUTH ====================

export interface AuthResponse {
  token: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

// ==================== CHAT ====================

export type SessionType = "Review" | "TestCase"

export interface ChatSessionDto {
  id: string
  title: string
  sessionType: SessionType
  createdAt: string
  contextSummary: string
}

export interface ChatMessageDto {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

export interface CreateSessionRequest {
  title: string
  sessionType: SessionType
}

// ==================== REVIEW ====================

export interface Issue {
  severity: string
  message: string
  line?: number
  suggestion: string
}

export interface ReviewResult {
  language: string
  score: number
  summary: string
  issues: Issue[]
  suggestions: string[]
  improvedCode: string
}

export interface ConversationReviewResult {
  review: ReviewResult | null
  answer: string
  updatedContextSummary: string
}

// ==================== TEST CASE ====================

export interface TestCase {
  name: string
  input: string
  expected: string
  description: string
}

export interface TestCaseResult {
  language: string
  testCases: TestCase[]
}

export interface ConversationTestCaseResult {
  testCases: TestCaseResult | null
  answer: string
  updatedContextSummary: string
}
