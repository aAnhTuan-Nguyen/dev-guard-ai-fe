"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ShieldCheck,
  Code2,
  FlaskConical,
  History,
  LogOut,
  LogIn,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { href: "/review", label: "Code Review", icon: Code2 },
  { href: "/testcase", label: "Test Case", icon: FlaskConical },
  { href: "/history", label: "Lịch sử", icon: History },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { email, logout, isAuthenticated } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5">
        <ShieldCheck
          className="size-6"
          style={{ color: "oklch(0.636 0.131 46)" }}
        />
        <span className="font-bold text-base tracking-tight text-sidebar-foreground">
          DevGuard<span style={{ color: "oklch(0.636 0.131 46)" }}>AI</span>
        </span>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <Separator />

      {/* User info + logout */}
      {isAuthenticated ? (
        <div className="px-4 py-4 space-y-2">
          <p className="text-xs text-muted-foreground truncate px-1">{email}</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </div>
      ) : (
        <div className="px-4 py-4">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/login">
              <LogIn className="size-4 mr-2" />
              Đăng nhập
            </Link>
          </Button>
        </div>
      )}
    </aside>
  )
}
