"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Code2, FlaskConical, Clock, MessageSquare, Plus } from "lucide-react"
import { useAutoError } from "@/hooks/useAutoError"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getSessions } from "@/services/chat"
import type { ChatSessionDto } from "@/types"

function SessionCard({ session }: { session: ChatSessionDto }) {
  const isReview = session.sessionType === "Review"
  const href = isReview ? `/review/${session.id}` : `/testcase/${session.id}`

  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium leading-snug line-clamp-2">
              {session.title || "Untitled"}
            </CardTitle>
            <Badge
              variant={isReview ? "default" : "secondary"}
              className="shrink-0"
            >
              {isReview ? (
                <>
                  <Code2 className="size-3 mr-1" />
                  Review
                </>
              ) : (
                <>
                  <FlaskConical className="size-3 mr-1" />
                  Test Case
                </>
              )}
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-1 text-xs">
            <Clock className="size-3" />
            {new Date(session.createdAt).toLocaleString("vi-VN")}
          </CardDescription>
        </CardHeader>

        {session.contextSummary && (
          <CardContent>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {session.contextSummary}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}

export default function HistoryPage() {
  const [reviewSessions, setReviewSessions] = useState<ChatSessionDto[]>([])
  const [testcaseSessions, setTestcaseSessions] = useState<ChatSessionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useAutoError()

  useEffect(() => {
    const load = async () => {
      try {
        const [reviews, testcases] = await Promise.all([
          getSessions("Review"),
          getSessions("TestCase"),
        ])
        setReviewSessions(reviews)
        setTestcaseSessions(testcases)
      } catch {
        setError("Không thể tải lịch sử sessions. Vui lòng thử lại.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const allSessions = [...reviewSessions, ...testcaseSessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <MessageSquare className="size-6" />
            Lịch sử Sessions
          </h1>
          {!loading && !error && (
            <p className="text-sm text-muted-foreground mt-1">
              {allSessions.length} session —{" "}
              <span className="text-foreground font-medium">
                {reviewSessions.length}
              </span>{" "}
              Review,{" "}
              <span className="text-foreground font-medium">
                {testcaseSessions.length}
              </span>{" "}
              Test Case
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/review">
              <Plus className="size-4 mr-1" />
              Review mới
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/testcase">
              <Plus className="size-4 mr-1" />
              Test Case mới
            </Link>
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-28 animate-pulse bg-muted border-0" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setLoading(true)
                setError(null)
                Promise.all([getSessions("Review"), getSessions("TestCase")])
                  .then(([reviews, testcases]) => {
                    setReviewSessions(reviews)
                    setTestcaseSessions(testcases)
                  })
                  .catch(() => setError("Không thể tải lịch sử sessions."))
                  .finally(() => setLoading(false))
              }}
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && allSessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <MessageSquare className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">
              Chưa có session nào.
            </p>
            <p className="text-sm text-muted-foreground">
              Bắt đầu bằng cách tạo{" "}
              <Link href="/review" className="text-primary hover:underline">
                Code Review
              </Link>{" "}
              hoặc{" "}
              <Link href="/testcase" className="text-primary hover:underline">
                Test Case
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sessions grid */}
      {!loading && !error && allSessions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}
