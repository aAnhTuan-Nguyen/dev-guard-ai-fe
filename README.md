# DevGuardAI — Frontend

Ứng dụng AI hỗ trợ **review code** và **generate test cases** tự động.  
Stack: Next.js 16 · React 19 · TypeScript · Tailwind CSS · shadcn/ui

---

## Yêu cầu

| Công cụ           | Version tối thiểu |
| ----------------- | ----------------- |
| Node.js           | 20.x              |
| npm               | 9.x               |
| Docker (tuỳ chọn) | 24.x              |

---

## Cách 1 — Chạy thông thường (Local)

### 1. Clone và cài dependencies

```bash
git clone <repo-url>
cd dev-guard-ai-fe
npm install
```

### 2. Tạo file `.env.local`

```env
NEXT_PUBLIC_API_URL=https://localhost:7257
```

> Thay URL bằng địa chỉ thực của backend ASP.NET Core đang chạy.

### 3. Chạy dev server

```bash
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

### 4. Build production (tuỳ chọn)

```bash
npm run build
npm run start
```

---

## Cách 2 — Chạy bằng Docker

### Build image

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://<địa-chỉ-backend>:7257 \
  -t devguard-ai-fe \
  .
```

> **Quan trọng:** Nếu backend chạy trên cùng máy, dùng `host.docker.internal` thay `localhost` (Windows/Mac).

### Chạy container

```bash
docker run -d \
  --name devguard-fe \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://host.docker.internal:7257 \
  devguard-ai-fe
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

### Dừng và xoá container

```bash
docker stop devguard-fe
docker rm devguard-fe
```

---

## Cách 3 — Docker Compose (FE + BE cùng lúc)

Tạo file `docker-compose.yml` ở **thư mục gốc** chứa cả `DevGuardAI/` và `dev-guard-ai-fe/`:

```yaml
version: "3.9"

services:
  backend:
    build:
      context: ./DevGuardAI
      dockerfile: DevGuardAI.API/Dockerfile
    ports:
      - "5282:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production

  frontend:
    build:
      context: ./dev-guard-ai-fe
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://backend:8080
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8080
```

```bash
# Từ thư mục gốc PRN_GroupProject/
docker compose up --build
```

---

## Cấu trúc thư mục

```
dev-guard-ai-fe/
├── app/
│   ├── (auth)/          # /login, /register
│   └── (dashboard)/     # /review, /testcase, /history
├── components/
│   ├── layout/          # Sidebar
│   └── ui/              # shadcn/ui components
├── services/            # axios API calls
│   ├── api.ts           # axios instance (tự gắn JWT)
│   ├── auth.ts          # POST /api/auth/login|register
│   └── chat.ts          # GET/POST /api/chat/session|sessions|messages
├── stores/
│   └── authStore.ts     # Zustand persist store
└── types/
    └── index.ts         # TypeScript interfaces
```

---

## API Endpoints được sử dụng

| Method | Endpoint                           | Mô tả                  | Auth   |
| ------ | ---------------------------------- | ---------------------- | ------ |
| POST   | `/api/auth/register`               | Đăng ký                | ❌     |
| POST   | `/api/auth/login`                  | Đăng nhập              | ❌     |
| POST   | `/api/chat/session`                | Tạo session mới        | ✅ JWT |
| GET    | `/api/chat/sessions?sessionType=`  | Danh sách sessions     | ✅ JWT |
| GET    | `/api/chat/sessions/{id}/messages` | Tin nhắn của session   | ✅ JWT |
| POST   | `/api/review`                      | Review code (one-shot) | ❌     |
| POST   | `/api/review/conversation`         | Review có context      | ✅ JWT |
| POST   | `/api/testcase/generate`           | Generate test cases    | ❌     |
| POST   | `/api/testcase/conversation`       | Test case có context   | ✅ JWT |

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
