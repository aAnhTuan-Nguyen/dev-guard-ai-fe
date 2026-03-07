"use client"

import Link from "next/link"
import { Code2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function ReviewPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Code2 className="size-6" />
          Code Review
        </h1>
        <p className="text-muted-foreground mt-1">
          Phân tích code và nhận phản hồi từ AI.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Code2 className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            Trang này đang được phát triển.
          </p>
          <Link
            href="/history"
            className="text-sm text-primary hover:underline"
          >
            Xem lịch sử sessions
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
