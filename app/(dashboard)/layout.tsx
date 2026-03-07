"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import Sidebar from "@/components/layout/Sidebar"

// Chính xác 2 path này không cần đăng nhập
// /review/[sessionId] và /testcase/[sessionId] vẫn BẮT BUỘC đăng nhập
const PUBLIC_PATHS = ["/review", "/testcase"]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = PUBLIC_PATHS.includes(pathname)

  useEffect(() => {
    if (!isAuthenticated && !isPublic) {
      router.push("/login")
    }
  }, [isAuthenticated, router, isPublic])

  if (!isAuthenticated && !isPublic) return null

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
