import api from "./api"
import type {
  ChatSessionDto,
  ChatMessageDto,
  CreateSessionRequest,
  SessionType,
} from "@/types"

export async function createSession(
  data: CreateSessionRequest,
): Promise<{ id: string }> {
  const res = await api.post<{ id: string }>("/api/chat/session", data)
  return res.data
}

export async function getSessions(
  sessionType: SessionType,
): Promise<ChatSessionDto[]> {
  const res = await api.get<ChatSessionDto[]>("/api/chat/sessions", {
    params: { sessionType },
  })
  return res.data
}

export async function getSessionMessages(
  sessionId: string,
): Promise<ChatMessageDto[]> {
  const res = await api.get<ChatMessageDto[]>(
    `/api/chat/sessions/${sessionId}/messages`,
  )
  return res.data
}
