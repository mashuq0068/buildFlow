# BuildFlow

A full-stack project management tool in the same space as Linear, Plane, and Asana — issues, boards, cycles, goals, real-time comments and chat, analytics, and workspace/member management. Built as three independent apps in one repo: the product itself, its API, and its marketing site.

See [FEATURES.md](./FEATURES.md) for the detailed feature matrix and build roadmap.

## What's in this repo

```
project-management/
├── client/              Next.js 16 app — the actual BuildFlow product (board, issues, chat, analytics...)
├── server/              Express 5 API — auth, data, real-time (Socket.IO)
├── buildFlow-website/   Vite + React marketing/landing site (fully independent, no shared code)
├── docker-compose.yml   Local Postgres for development
└── FEATURES.md          Feature scope and build status
```

`client/` and `server/` are the actual application and talk to each other over REST + WebSockets. `buildFlow-website/` is a separate, standalone marketing site with its own dependencies and its own deployment — it doesn't import anything from `client/` or `server/` and doesn't need to run for the app to work.

## Tech stack

| | |
|---|---|
| **Client** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, Tiptap (rich text), dnd-kit (drag & drop), Framer Motion, Socket.IO client |
| **Server** | Express 5, TypeScript, Prisma 6 + PostgreSQL, Socket.IO, JWT auth (access + refresh cookies), Zod validation, Nodemailer |
| **Marketing site** | Vite, React 18, TypeScript, Tailwind CSS v3, Framer Motion |

## Prerequisites

- Node.js 20+
- npm
- A PostgreSQL database — either run one locally with Docker (included), or use a hosted one (e.g. [Neon](https://neon.tech))

## Running it locally

### 1. Database

Start a local Postgres with the included Docker Compose file:

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with user/password `postgres` and database `project_management`. If you'd rather use a hosted database (Neon, Supabase, RDS, etc.), skip this step and just use that database's connection string in the next step.

### 2. Server (API)

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` — at minimum set `DATABASE_URL` to point at your database (the Docker Compose values already match `.env.example`'s defaults if you used step 1 as-is), and set real values for `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` (any long random string works for local dev). See [Environment variables](#environment-variables) below for what each one does.

Then create the schema and load demo data:

```bash
npx prisma migrate dev
npm run seed
```

Start the API:

```bash
npm run dev
```

The server runs on `http://localhost:4000` (health check: `http://localhost:4000/api/health`).

### 3. Client (the app)

In a new terminal:

```bash
cd client
npm install
```

Create `client/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start it:

```bash
npm run dev
```

Open `http://localhost:3000` — you'll land on the login screen.

### 4. Log in

The seed script creates 12 demo accounts, all sharing the password **`Demo1234!`**:

| Email | Role |
|---|---|
| `maya@acme.dev` | Admin |
| `alex@acme.dev` | Admin |
| `nadia@acme.dev` | Member |
| `jordan@acme.dev` | Member |

(the rest are listed in the seed script's console output after `npm run seed`, and in the login screen's account picker)

### 5. Marketing site (optional)

Only needed if you're working on the landing page — it's unrelated to the app itself:

```bash
cd buildFlow-website
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## Environment variables

### `server/.env`

| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on locally (default `4000`) |
| `CLIENT_ORIGIN` | The client's URL — used for CORS and Socket.IO's allowed origin |
| `DATABASE_URL` | Postgres connection string (Prisma) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Signing secrets for auth tokens — use long random values, especially in production |
| `ACCESS_TOKEN_TTL_MIN` / `REFRESH_TOKEN_TTL_DAYS` | Token lifetimes |
| `COOKIE_SECURE` | Set to `true` in production (HTTPS) so auth cookies get `Secure`/`SameSite=None`, required when the client and server are on different domains. Keep `false` for local HTTP dev |
| `SMTP_*` | Nodemailer config for sending workspace invite emails — optional locally, invites just won't send without it |
| `INVITE_TOKEN_TTL_DAYS` | How long an invite link stays valid |
| `NODE_ENV` | Also doubles as the real-time toggle — see [Real-time behavior](#real-time-behavior) below |

### `client/.env.local`

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the API, including `/api` (e.g. `http://localhost:4000/api`). Socket.IO connects to the same host with `/api` stripped off, so this one variable covers both REST and WebSocket traffic |

## Real-time behavior

Comments, project chat, and reactions update live via Socket.IO, running in the same Express process as the REST API (no separate server). This only runs when `NODE_ENV` isn't `production` — Socket.IO needs a long-lived process, which doesn't fit serverless hosts like Vercel, so in production the app automatically falls back to plain REST (every mutation still works, it just won't live-broadcast to other open tabs). Locally (`npm run dev`), real-time is always on.

## Deployment

- **Client**: deploys to Vercel as a standard Next.js app. Set `NEXT_PUBLIC_API_URL` to your deployed API's URL.
- **Server**: also deploys to Vercel — it has a native zero-config Express preset that just needs `src/index.ts` to export the app or call `.listen()` (this one does both). Set the `server/.env` variables above as Vercel project environment variables, with `COOKIE_SECURE=true` if the client and server are on different domains.
- **Database**: any hosted Postgres works — this project has been run against [Neon](https://neon.tech). Point `DATABASE_URL` at it and run `npx prisma migrate deploy` once against it before first use.
- **Marketing site**: deploys independently to Vercel (or any static host) — it's a plain Vite build with no backend dependency.

## Scripts reference

**`server/`**
| Command | What it does |
|---|---|
| `npm run dev` | Start the API with hot reload |
| `npm run build` | Type-check and compile to `dist/` |
| `npm start` | Run the compiled build (`dist/index.js`) |
| `npm run seed` | Wipe and reseed the database with demo data |
| `npm run prisma:migrate` | Create/apply a Prisma migration |
| `npm run prisma:studio` | Open Prisma Studio (DB browser GUI) |

**`client/`**
| Command | What it does |
|---|---|
| `npm run dev` | Start Next.js with hot reload |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

**`buildFlow-website/`**
| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
