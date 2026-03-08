import api from "./api"
import type { ReviewResult, ConversationReviewResult } from "@/types"

export async function reviewCode(content: string): Promise<ReviewResult> {
  const res = await api.post<ReviewResult>("/api/review", { content })
  return res.data
}

export async function conversationReview(
  sessionId: string,
  content: string,
): Promise<ConversationReviewResult> {
  const res = await api.post<ConversationReviewResult>(
    "/api/review/conversation",
    { sessionId, content },
  )
  return res.data
}
