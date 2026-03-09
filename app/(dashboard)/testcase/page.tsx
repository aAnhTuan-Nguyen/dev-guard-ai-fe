"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Editor from "@monaco-editor/react"
import { FlaskConical, Loader2, MessageSquarePlus } from "lucide-react"
import { useAutoError } from "@/hooks/useAutoError"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import TestCaseResultPanel from "@/components/testcase/TestCaseResultPanel"
import { generateTestCases } from "@/services/testcase"
import { createSession } from "@/services/chat"
import { useAuthStore } from "@/stores/authStore"
import type { TestCaseResult } from "@/types"

const LANGUAGES = [
  "javascript", "typescript", "python", "java", "csharp",
  "cpp", "go", "rust", "php", "ruby", "swift", "kotlin",
  "html", "css", "sql", "plaintext",
]

export default function TestCasePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestCaseResult | null>(null)
  const [error, setError] = useAutoError()

  const handleGenerate = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await generateTestCases(code)
      setResult(data)
    } catch {
      setError("Không thể sinh test cases. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleStartConversation = async () => {
    try {
      const { id } = await createSession({
        title: `Test Case — ${new Date().toLocaleString("vi-VN")}`,
        sessionType: "TestCase",
      })
      router.push(`/testcase/${id}`)
    } catch {
      setError("Không thể tạo session. Vui lòng đăng nhập.")
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FlaskConical className="size-6" />
            Test Case Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Dán code và AI tự động sinh test cases. Không cần đăng nhập.
          </p>
        </div>
        {isAuthenticated && (
          <Button variant="outline" size="sm" onClick={handleStartConversation}>
            <MessageSquarePlus className="size-4 mr-2" />
            Sinh theo hội thoại
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Source Code</CardTitle>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs rounded-md border border-input bg-background px-2 py-1"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="rounded-lg overflow-hidden border border-input">
              <Editor
                height="420px"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                }}
              />
            </div>
            <Button
              className="mt-4 w-full"
              disabled={loading || !code.trim()}
              onClick={handleGenerate}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Đang sinh test cases…
                </>
              ) : (
                <>
                  <FlaskConical className="size-4 mr-2" />
                  Sinh Test Cases
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <div className="min-h-0">
          {error && (
            <Card className="border-destructive">
              <CardContent className="py-4 text-sm text-destructive">
                {error}
              </CardContent>
            </Card>
          )}

          {loading && !result && (
            <Card>
              <CardContent className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                AI đang phân tích code và sinh test cases…
              </CardContent>
            </Card>
          )}

          {!result && !loading && !error && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-2 text-muted-foreground">
                <FlaskConical className="size-10" />
                <p className="text-sm">
                  Nhập code và nhấn &quot;Sinh Test Cases&quot; để bắt đầu.
                </p>
              </CardContent>
            </Card>
          )}

          {result && (
            <ScrollArea className="h-[560px] pr-2">
              <TestCaseResultPanel result={result} />
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
}
