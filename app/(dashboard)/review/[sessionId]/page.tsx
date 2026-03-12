"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Editor from "@monaco-editor/react"
import ReactMarkdown from "react-markdown"
import { useAutoError } from "@/hooks/useAutoError"
import {
  ArrowLeft,
  Code2,
  Loader2,
  Send,
  User,
  Bot,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import ReviewResultPanel from "@/components/review/ReviewResultPanel"
import { conversationReview } from "@/services/review"
import { getSessionMessages } from "@/services/chat"
import type {
  ChatMessageDto,
  ConversationReviewResult,
  ReviewResult,
} from "@/types"
import { cn } from "@/lib/utils"

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "html",
  "css",
  "sql",
  "plaintext",
]

type InputMode = "code" | "text"

interface DisplayMessage {
  role: "user" | "assistant"
  content: string
  review?: ReviewResult | null
}

export default function ConversationReviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const router = useRouter()
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [inputMode, setInputMode] = useState<InputMode>("code")
  const [code, setCode] = useState("")
  const [text, setText] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useAutoError()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load previous messages
  useEffect(() => {
    const load = async () => {
      try {
        const history = await getSessionMessages(sessionId)
        const mapped: DisplayMessage[] = history.map((m: ChatMessageDto) => {
          if (m.role === "AI") {
            try {
              const parsed = JSON.parse(m.content)
              if (parsed && typeof parsed.score === "number") {
                return {
                  role: "assistant" as const,
                  content: parsed.summary ?? "",
                  review: parsed as ReviewResult,
                }
              }
            } catch {
              // not JSON — plain text follow-up answer
            }
            return { role: "assistant" as const, content: m.content }
          }
          return { role: "user" as const, content: m.content }
        })
        setMessages(mapped)
      } catch {
        // Session might be new
      } finally {
        setLoadingHistory(false)
      }
    }
    load()
  }, [sessionId])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const content = inputMode === "code" ? code : text
    if (!content.trim()) return

    const userMsg: DisplayMessage = { role: "user", content }
    setMessages((prev) => [...prev, userMsg])
    setCode("")
    setText("")
    setLoading(true)
    setError(null)

    try {
      const data: ConversationReviewResult = await conversationReview(
        sessionId,
        content,
      )
      const assistantMsg: DisplayMessage = {
        role: "assistant",
        content: data.answer,
        review: data.review,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setError("Không thể gửi tin nhắn. Vui lòng thử lại.")
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => router.push("/review")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Code Review — Hội thoại
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            Gửi code hoặc hỏi thêm để nhận phân tích chuyên sâu
          </p>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-5 pb-4 pr-3">
          {loadingHistory && (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Đang tải lịch sử…</span>
            </div>
          )}

          {!loadingHistory && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <div className="size-16 rounded-full bg-primary/5 flex items-center justify-center">
                <Code2 className="size-8 text-primary/50" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Chưa có tin nhắn
                </p>
                <p className="text-xs">
                  Gửi code hoặc câu hỏi để bắt đầu review.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="flex gap-3">
              {/* Avatar */}
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  msg.role === "assistant" ? "bg-primary/10" : "bg-secondary",
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot className="size-4 text-primary" />
                ) : (
                  <User className="size-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {msg.role === "assistant" ? "AI Assistant" : "Bạn"}
                  </span>
                </div>

                {msg.role === "user" ? (
                  <div className="rounded-lg bg-muted/50 border p-3 overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                      {msg.content}
                    </pre>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}

                {/* Review result */}
                {msg.review && (
                  <div className="mt-2">
                    <ReviewResultPanel result={msg.review} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="size-4 text-primary" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium">AI Assistant</span>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Đang phân tích…
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t pt-4 pb-1 space-y-3">
        <Tabs
          value={inputMode}
          onValueChange={(v) => setInputMode(v as InputMode)}
        >
          <div className="flex items-center justify-between">
            <TabsList className="h-8">
              <TabsTrigger value="code" className="text-xs gap-1.5 px-3">
                <Code2 className="size-3" />
                Code
              </TabsTrigger>
              <TabsTrigger value="text" className="text-xs gap-1.5 px-3">
                <Send className="size-3" />
                Hỏi thêm
              </TabsTrigger>
            </TabsList>

            {inputMode === "code" && (
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs rounded-md border border-input bg-background px-2 py-1 h-8"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            )}
          </div>

          <TabsContent value="code" className="mt-2">
            <div className="rounded-lg overflow-hidden border border-input">
              <Editor
                height="180px"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 8 },
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="text" className="mt-2">
            <Textarea
              placeholder="Hỏi thêm về code hoặc yêu cầu giải thích chi tiết…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              className="resize-none"
            />
          </TabsContent>
        </Tabs>

        <Button
          className="w-full"
          disabled={
            loading || (inputMode === "code" ? !code.trim() : !text.trim())
          }
          onClick={handleSend}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Đang gửi…
            </>
          ) : (
            <>
              <Send className="size-4 mr-2" />
              Gửi
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
