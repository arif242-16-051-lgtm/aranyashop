# AranyaShop — Frontend

Next.js (App Router) frontend for the AranyaShop project.
Communicates with the Spring Boot backend via a dev proxy (no CORS issues).

---

## Prerequisites

| Tool     | Version  |
|----------|----------|
| Node.js  | **20.x** (use nvm) |
| npm      | 10.x     |
| Backend  | Spring Boot running on **http://localhost:8080** |

---

## Setup

```bash
# 1. Switch to Node 20
nvm use 20

# 2. Enter frontend directory
cd frontend/

# 3. Install dependencies
npm install

# 4. Copy env template
cp .env.local.example .env.local
# default values work for local dev — no changes needed
```

---

## Run (local dev)

```bash
npm run dev
```

Frontend: **http://localhost:3000**

> Start the backend in a separate terminal from the repo root:
> ```bash
> ./mvnw spring-boot:run
> ```
> Backend: **http://localhost:8080**

---

## How the proxy works

`next.config.ts` rewrites every `/api/*` request to `http://localhost:8080/api/*`
so browser code only ever calls relative paths:

```ts
fetch("/api/health")  // proxied → http://localhost:8080/api/health
```

In **production** (Nginx), the reverse proxy routes `/api/*` directly to
Spring Boot — frontend code stays exactly the same.

---

## Quick test URLs

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Storefront home |
| http://localhost:3000/admin | Admin panel |
| http://localhost:3000/admin/health | Backend health check UI |
| http://localhost:8080/api/health | Raw backend endpoint |
| http://localhost:8080/actuator/health | Spring Actuator health |
