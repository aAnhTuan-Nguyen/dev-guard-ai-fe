"use client"

import { useState } from "react"
import {
  FlaskConical,
  ChevronDown,
  CheckCircle2,
  Hash,
  ArrowRight,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TestCaseResult } from "@/types"

export default function TestCaseResultPanel({
  result,
}: {
  result: TestCaseResult
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const testCases = result.testCases ?? []

  const toggle = (i: number) => {
    setExpandedIndex(expandedIndex === i ? null : i)
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardContent className="pt-5 pb-4 flex items-center gap-4">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <FlaskConical className="size-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Test Cases đã sinh</h3>
              <Badge variant="outline" className="text-[11px]">
                {result.language}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Tổng cộng{" "}
              <span className="font-medium text-foreground">
                {testCases.length}
              </span>{" "}
              test case được tạo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test cases list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="size-4 text-green-500" />
            Danh sách Test Cases
            <Badge variant="secondary" className="text-[11px] ml-auto">
              {testCases.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {testCases.map((tc, i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              {/* Header - clickable */}
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <Hash className="size-3 text-primary" />
                </div>
                <span className="flex-1 text-sm font-medium truncate">
                  {tc.name}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    expandedIndex === i && "rotate-180",
                  )}
                />
              </button>

              {/* Expanded details */}
              {expandedIndex === i && (
                <div className="border-t px-3 py-3 space-y-3 bg-muted/20">
                  {/* Description */}
                  {tc.description && (
                    <div className="flex items-start gap-2">
                      <FileText className="size-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tc.description}
                      </p>
                    </div>
                  )}

                  {/* Input */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Input
                    </span>
                    <div className="rounded-md bg-[#1e1e1e] p-2.5 overflow-x-auto">
                      <pre className="text-xs text-[#d4d4d4] font-mono leading-relaxed whitespace-pre-wrap">
                        {tc.input}
                      </pre>
                    </div>
                  </div>

                  {/* Expected */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <ArrowRight className="size-3" />
                      Expected Output
                    </span>
                    <div className="rounded-md bg-green-500/5 border border-green-500/20 p-2.5 overflow-x-auto">
                      <pre className="text-xs text-foreground font-mono leading-relaxed whitespace-pre-wrap">
                        {tc.expected}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
