"use client"

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  Code2,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { ReviewResult } from "@/types"

function severityColor(
  severity: string,
): "destructive" | "default" | "secondary" | "outline" {
  switch (severity.toLowerCase()) {
    case "critical":
    case "error":
      return "destructive"
    case "warning":
      return "default"
    case "info":
    case "suggestion":
      return "secondary"
    default:
      return "outline"
  }
}

function severityIcon(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical":
    case "error":
      return <AlertTriangle className="size-4 text-destructive" />
    case "warning":
      return <AlertTriangle className="size-4 text-yellow-500" />
    default:
      return <Info className="size-4 text-blue-500" />
  }
}

function ScoreRing({ score }: { score: number }) {
  const pct = (score / 10) * 100
  let ringColor = "text-green-500"
  if (score < 5) ringColor = "text-destructive"
  else if (score < 7) ringColor = "text-yellow-500"

  return (
    <div className="relative size-16 shrink-0">
      <svg className="size-16 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted/30"
        />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={ringColor}
          strokeDasharray={`${pct} ${100 - pct}`}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-lg font-bold",
          ringColor,
        )}
      >
        {score}
      </span>
    </div>
  )
}

export default function ReviewResultPanel({
  result,
}: {
  result: ReviewResult
}) {
  const [showAllIssues, setShowAllIssues] = useState(false)
  const issues = result.issues ?? []
  const suggestions = result.suggestions ?? []
  const visibleIssues = showAllIssues ? issues : issues.slice(0, 4)

  return (
    <div className="space-y-4">
      {/* Score + Summary */}
      <Card>
        <CardContent className="pt-5 pb-4 flex gap-4 items-start">
          <ScoreRing score={result.score} />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Kết quả Review</h3>
              <Badge variant="outline" className="text-[11px]">
                {result.language}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Issues */}
      {issues.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="size-4" />
              Issues
              <Badge variant="secondary" className="text-[11px] ml-auto">
                {issues.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {visibleIssues.map((issue, i) => (
              <div key={i} className="rounded-lg border p-3 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {severityIcon(issue.severity)}
                  <Badge
                    variant={severityColor(issue.severity)}
                    className="text-[11px]"
                  >
                    {issue.severity}
                  </Badge>
                  {issue.line != null && (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Line {issue.line}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{issue.message}</p>
                {issue.suggestion && (
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                    <Lightbulb className="size-3.5 mt-0.5 shrink-0 text-yellow-500" />
                    <span className="leading-relaxed">{issue.suggestion}</span>
                  </div>
                )}
              </div>
            ))}

            {issues.length > 4 && !showAllIssues && (
              <button
                type="button"
                onClick={() => setShowAllIssues(true)}
                className="w-full flex items-center justify-center gap-1 text-xs text-primary hover:underline py-1.5"
              >
                <ChevronDown className="size-3" />
                Xem thêm {issues.length - 4} issues
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="size-4 text-yellow-500" />
              Gợi ý cải thiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="text-sm flex items-start gap-2 leading-relaxed"
                >
                  <span className="text-primary mt-1">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improved Code */}
      {result.improvedCode && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code2 className="size-4 text-green-500" />
              Code cải thiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-[#1e1e1e] p-4 overflow-x-auto">
              <pre className="text-sm text-[#d4d4d4] font-mono leading-relaxed">
                <code>{result.improvedCode}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
