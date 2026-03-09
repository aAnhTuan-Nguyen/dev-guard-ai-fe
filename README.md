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

### Chuẩn bị

- Đã cài **Docker Desktop** trên Windows (tải tại [docker.com](https://www.docker.com/products/docker-desktop))
- Đã mở **Docker Desktop** và đang chạy
- Backend ASP.NET Core đang chạy ở `https://localhost:7257` (hoặc địa chỉ khác)

### 1. Mở PowerShell/Command Prompt, vào thư mục dự án

```bash
cd D:\Semester_7\PRN_GroupProject\dev-guard-ai-fe
```

### 2. Build image

```bash
docker build -t devguard-ai-fe .
```

> Lệnh này sẽ tạo Docker image từ Dockerfile trong thư mục hiện tại. Quá trình build có thể mất vài phút lần đầu.

### 3. Chạy container

```bash
docker run -d --name devguard-fe -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://host.docker.internal:7257 devguard-ai-fe
```

> **Lưu ý:** Dùng `host.docker.internal` thay vì `localhost` để container Docker có thể kết nối tới backend chạy trên máy Windows của bạn.

### 4. Truy cập ứng dụng

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

### Quản lý container

**Xem container đang chạy:**

```bash
docker ps
```

**Dừng container:**

```bash
docker stop devguard-fe
```

**Khởi động lại:**

```bash
docker start devguard-fe
```

**Xóa container:**

```bash
docker rm devguard-fe
```

---

## Cách 3 — Docker Compose (Frontend + API + Database)

Mục này dành cho Docker Desktop trên Windows, chạy 1 lần ra đủ 3 service: `frontend`, `api`, `sqlserver`.

### 1. Chuẩn bị

- Mở Docker Desktop (đảm bảo đang chạy)
- Bạn có thư mục gốc dạng:

```text
PRN_GroupProject/
  DevGuardAI/
  dev-guard-ai-fe/
```

### 2. Tạo file `docker-compose.yml` tại thư mục `PRN_GroupProject/`

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: devguardai-sqlserver
    restart: unless-stopped
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: ${DB_PASSWORD}
      MSSQL_PID: "Developer"
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql

  api:
    build:
      context: ./DevGuardAI
      dockerfile: Dockerfile
    container_name: devguardai-api
    restart: unless-stopped
    depends_on:
      - sqlserver
    ports:
      - "5282:8080"
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__DefaultConnection: Server=sqlserver,1433;Database=DevGuardAIDB;User Id=sa;Password=${DB_PASSWORD};TrustServerCertificate=True;MultipleActiveResultSets=True;
      Jwt__Key: ${JWT_KEY}
      Jwt__Issuer: ${JWT_ISSUER}
      Jwt__Audience: ${JWT_AUDIENCE}
      Jwt__ExpireMinutes: ${JWT_EXPIRE_MINUTES}
      Gemini__ApiKey: ${GEMINI_API_KEY}

  frontend:
    build:
      context: ./dev-guard-ai-fe
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://localhost:5282
    container_name: devguardai-fe
    restart: unless-stopped
    depends_on:
      - api
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5282

volumes:
  sqlserver_data:
```

### 3. Tạo file `.env` tại thư mục `PRN_GroupProject/`

```env
DB_PASSWORD=YourStrong@Passw0rd
JWT_KEY=DevGuardAI_SuperSecretKey_AtLeast32Chars!
JWT_ISSUER=DevGuardAI
JWT_AUDIENCE=DevGuardAIUsers
JWT_EXPIRE_MINUTES=60
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Chạy compose

```bash
cd D:\Semester_7\PRN_GroupProject
docker compose up --build -d
```

### 5. Truy cập ứng dụng

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:5282](http://localhost:5282)

### 6. Các lệnh thường dùng

```bash
docker compose ps
docker compose logs -f
docker compose down
docker compose down -v
```

`docker compose down -v` sẽ xóa luôn volume DB (mất dữ liệu SQL Server).

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
