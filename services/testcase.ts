import api from "./api"
import type { TestCaseResult, ConversationTestCaseResult } from "@/types"

export async function generateTestCases(
  content: string,
): Promise<TestCaseResult> {
  const res = await api.post<TestCaseResult>("/api/testcase", { content })
  return res.data
}

export async function conversationTestCase(
  sessionId: string,
  content: string,
): Promise<ConversationTestCaseResult> {
  const res = await api.post<ConversationTestCaseResult>(
    "/api/testcase/conversation",
    { sessionId, content },
  )
  return res.data
}
