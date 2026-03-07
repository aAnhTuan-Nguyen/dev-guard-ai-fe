# DevGuardAI — Copilot Agent Instructions

## Project Overview

**DevGuardAI** là ứng dụng AI hỗ trợ review code và generate test cases.  
Backend: ASP.NET Core 8 Web API (JWT Auth, Gemini AI).  
Frontend: Next.js 16 (App Router) + React 19 + TypeScript.

---

## Tech Stack — LUÔN dùng đúng theo danh sách này

| Mục đích         | Thư viện / Công nghệ                                    | KHÔNG dùng thay thế                                               |
| ---------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| Framework        | **Next.js 16 App Router**                               | Không dùng Pages Router                                           |
| UI Components    | **shadcn/ui** (radix-nova style)                        | Không tự tạo component từ đầu nếu shadcn có sẵn                   |
| Styling          | **Tailwind CSS v4** + CSS variables                     | Không dùng inline style, không dùng CSS modules trừ khi cần thiết |
| Icons            | **lucide-react**                                        | Không dùng react-icons hay heroicons                              |
| HTTP Client      | **axios** (instance tại `@/services/api.ts`)            | Không dùng `fetch` trực tiếp                                      |
| State Management | **Zustand**                                             | Không dùng Redux, Recoil, Jotai hay Context đơn lẻ                |
| Form             | **react-hook-form** + **zod** + **@hookform/resolvers** | Không dùng Formik, không dùng useState cho form fields            |
| Code Editor      | **@monaco-editor/react**                                | Không dùng textarea hay CodeMirror                                |
| Code Highlight   | **react-syntax-highlighter** (style: `vscDarkPlus`)     | Không dùng prism-react-renderer                                   |
| Markdown         | **react-markdown**                                      | Không dùng dangerouslySetInnerHTML                                |
| Type Safety      | **TypeScript strict mode**                              | Không dùng `any`, không bỏ qua type errors                        |
| Utility          | `cn()` từ `@/lib/utils` (clsx + tailwind-merge)         | Không concat class string thủ công                                |

---

## Cấu trúc thư mục — Tuân thủ đúng layout này

```
dev-guard-ai-fe/
├── app/
│   ├── globals.css
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Redirect về /login hoặc trang chủ
│   ├── (auth)/                 # Route group — không có layout sidebar
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   └── (dashboard)/            # Route group — có layout sidebar
│       ├── layout.tsx
│       ├── review/
│       │   ├── page.tsx        # One-shot review
│       │   └── [sessionId]/
│       │       └── page.tsx    # Conversation review
│       ├── testcase/
│       │   ├── page.tsx        # One-shot test case generator
│       │   └── [sessionId]/
│       │       └── page.tsx    # Conversation test case
│       └── history/
│           └── page.tsx        # Danh sách sessions
├── components/
│   ├── ui/                     # shadcn/ui components (KHÔNG sửa thủ công)
│   ├── layout/                 # Sidebar, Navbar, etc.
│   └── [feature]/              # Components theo feature
├── services/
│   ├── api.ts                  # axios instance — BASE FILE
│   ├── auth.ts                 # Auth API calls
│   ├── chat.ts                 # Chat/Session API calls
│   ├── review.ts               # Review API calls
│   └── testcase.ts             # Test Case API calls
├── stores/
│   └── authStore.ts            # Zustand store cho auth state
├── hooks/                      # Custom React hooks
├── lib/
│   └── utils.ts                # cn() utility
└── types/
    └── index.ts                # Shared TypeScript types/interfaces
```

---

## API Backend — Base URL: `http://localhost:5282`

### Auth (KHÔNG cần token)

```
POST /api/auth/register    Body: { email: string, password: string }
POST /api/auth/login       Body: { email: string, password: string }
Response: { token: string, email: string }
```

### Chat (CẦN JWT Bearer token)

```
POST /api/chat/session
  Body: { title: string, sessionType: "Review" | "TestCase" }
  Response: { id: string }

GET  /api/chat/sessions?sessionType=Review|TestCase
  Response: ChatSessionDto[]

GET  /api/chat/sessions/{sessionId}/messages
  Response: ChatMessageDto[]
```

### Code Review

```
POST /api/review
  Body: { content: string }
  Response: ReviewResult

POST /api/review/conversation   (cần token nếu có session)
  Body: { sessionId: string, content: string }
  Response: ConversationReviewResult
```

### Test Cases

```
POST /api/testcase/generate
  Body: { content: string }
  Response: TestCaseResult

POST /api/testcase/conversation  (CẦN JWT)
  Body: { sessionId: string, content: string }
  Response: ConversationTestCaseResult
```

---

## TypeScript Types — Dùng từ `@/types/index.ts`

```typescript
// Auth
interface AuthResponse {
  token: string
  email: string
}
interface LoginRequest {
  email: string
  password: string
}
interface RegisterRequest {
  email: string
  password: string
}

// Chat
interface ChatSessionDto {
  id: string
  title: string
  sessionType: "Review" | "TestCase"
  createdAt: string
  contextSummary: string
}
interface ChatMessageDto {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

// Review
interface Issue {
  severity: string
  message: string
  line?: number
  suggestion: string
}
interface ReviewResult {
  language: string
  score: number
  summary: string
  issues: Issue[]
  suggestions: string[]
  improvedCode: string
}
interface ConversationReviewResult {
  review: ReviewResult | null
  answer: string
  updatedContextSummary: string
}

// Test Case
interface TestCase {
  name: string
  input: string
  expected: string
  description: string
}
interface TestCaseResult {
  language: string
  testCases: TestCase[]
}
interface ConversationTestCaseResult {
  testCases: TestCaseResult | null
  answer: string
  updatedContextSummary: string
}
```

---

## Services Layer — Quy tắc gọi API

### `services/api.ts` — LUÔN dùng instance này, KHÔNG tạo axios instance mới

```typescript
import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5282",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

### Quy tắc viết service functions

- Mỗi file service export các async functions, KHÔNG export class
- Xử lý lỗi bằng `try/catch` tại component hoặc hook, KHÔNG trong service
- Return `data` từ response trực tiếp: `return response.data`

---

## Zustand Store — Quy tắc

```typescript
// stores/authStore.ts — Pattern chuẩn
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  token: string | null
  email: string | null
  isAuthenticated: boolean
  setAuth: (token: string, email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      isAuthenticated: false,
      setAuth: (token, email) => set({ token, email, isAuthenticated: true }),
      logout: () => set({ token: null, email: null, isAuthenticated: false }),
    }),
    { name: "auth-storage" },
  ),
)
```

- Dùng `persist` middleware để lưu vào localStorage tự động
- KHÔNG lưu token vào localStorage thủ công bên ngoài store
- Tên store hook: `use[Name]Store`

---

## Form — react-hook-form + zod

```typescript
// Pattern chuẩn
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
})
type FormData = z.infer<typeof schema>

// Trong component:
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

---

## Monaco Editor — Quy tắc

```tsx
import Editor from "@monaco-editor/react"

;<Editor
  height="400px"
  defaultLanguage="javascript"
  theme="vs-dark"
  value={code}
  onChange={(value) => setCode(value ?? "")}
  options={{ minimap: { enabled: false }, fontSize: 14 }}
/>
```

- Luôn dùng `theme="vs-dark"` để đồng bộ giao diện tối
- Wrap trong `Suspense` nếu dùng trong Server Component context

---

## Naming Conventions

| Loại             | Convention                         | Ví dụ                                          |
| ---------------- | ---------------------------------- | ---------------------------------------------- |
| Components       | PascalCase                         | `ReviewPanel.tsx`                              |
| Hooks            | camelCase với prefix `use`         | `useReviewSession.ts`                          |
| Services         | camelCase                          | `reviewService.ts` → functions: `reviewCode()` |
| Stores           | camelCase với prefix `use...Store` | `useAuthStore`                                 |
| Types/Interfaces | PascalCase                         | `ReviewResult`, `ChatSessionDto`               |
| CSS / className  | Tailwind utilities only            | `className="flex gap-4 p-6"`                   |
| Route params     | kebab-case thư mục                 | `[sessionId]`                                  |

---

## Component Rules

1. **Luôn dùng `"use client"`** cho components có state, event handlers, hooks
2. **Server Components** chỉ dùng cho layout, static content, data fetching không cần interaction
3. **KHÔNG dùng `useEffect` để fetch data** — dùng server components hoặc custom hooks
4. **Shadcn components** thêm bằng lệnh: `npx shadcn@latest add [component-name]`
5. **Không hardcode màu sắc** — dùng CSS variables của shadcn: `text-foreground`, `bg-background`, v.v.

---

## Protected Routes

- Route `(dashboard)/*` yêu cầu đăng nhập
- Kiểm tra `isAuthenticated` từ `useAuthStore` trong layout của `(dashboard)`
- Redirect về `/login` nếu chưa đăng nhập dùng `router.push("/login")`

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5282
```

- Prefix `NEXT_PUBLIC_` cho biến expose ra client
- Truy cập: `process.env.NEXT_PUBLIC_API_URL`

---

## Các lệnh hay dùng

```bash
# Dev server
npm run dev

# Thêm shadcn component
npx shadcn@latest add [button|input|card|dialog|textarea|badge|...]

# Build production
npm run build
```

---

## Tóm tắt KHÔNG làm

- ❌ Không dùng `fetch()` trực tiếp — luôn dùng axios instance từ `@/services/api.ts`
- ❌ Không dùng `any` trong TypeScript
- ❌ Không tự viết CSS thuần — dùng Tailwind classes
- ❌ Không tạo Redux store — dùng Zustand
- ❌ Không dùng `useState` để quản lý form fields — dùng react-hook-form
- ❌ Không sửa file trong `components/ui/` — dùng lệnh `npx shadcn add` để thêm mới
- ❌ Không hardcode `http://localhost:5282` trong service files — dùng `api` instance
- ❌ Không lưu JWT vào localStorage thủ công — dùng Zustand `persist`
