# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Important:** This project runs Next.js 16 with React 19 and Tailwind CSS 4 — all have breaking changes from prior versions. Read `node_modules/next/dist/docs/` before writing code. Heed deprecation notices (e.g. `middleware` file convention is deprecated in favor of `proxy`).

## Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build (runs TypeScript check)
npm run lint      # ESLint
npx prisma db push          # Apply schema changes to database (no migrations)
npx prisma generate         # Regenerate Prisma client after schema changes
npx prisma studio           # Visual DB browser at localhost:5555
```

There are no tests. The build (`npm run build`) is the type-check gate — fix all TypeScript errors before deploying.

## Architecture

### Auth flow
Supabase Auth handles authentication. Two clients exist:
- `src/lib/supabase/client.ts` — browser client (use in `'use client'` components)
- `src/lib/supabase/server.ts` — server client (use in Server Components and API routes)

`src/middleware.ts` guards routes using `getSession()` (fast, cookie-based). Protected routes redirect to `/login`; public routes are `/`, `/login`, `/cadastro`, `/api/webhooks/*`.

### Dual identity model
Every authenticated user has **two IDs**:
- `supabase.auth.user.id` — Supabase Auth UUID
- `User.id` — Prisma CUID in the `users` table

API routes and Server Components always resolve the Prisma `User` via `prisma.user.findUnique({ where: { supabaseId } })` before querying owned data. The Prisma user is created on first profile update via `PUT /api/usuario`.

### Data ownership
All models (`Cliente`, `Atendimento`, `Cobranca`) have a `userId` foreign key. Every query must filter by `userId` to enforce tenant isolation. Never query without a `where: { userId }` clause.

### Prisma + Decimal serialization
Prisma returns `Decimal` objects for `valorHonorario` and `valor`. These cannot be passed directly as props to Client Components. Always serialize:
```ts
valorHonorario: Number(c.valorHonorario),
```
Similarly, nullable Prisma fields (`string | null`) must be converted to `string | undefined` before passing to typed props:
```ts
email: c.email ?? undefined,
```

### Page pattern (Server → Client)
Dashboard pages follow a consistent pattern:
1. Server Component (`page.tsx`) fetches data from Prisma using the authenticated Supabase user
2. Serializes Prisma output (Decimals → numbers, Dates → ISO strings, null → undefined)
3. Passes serialized data to a Client Component (`*-view.tsx`) that handles interactions

### API routes
All API routes in `src/app/api/` share the same auth helper pattern:
```ts
async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return prisma.user.findUnique({ where: { supabaseId: user.id } })
}
```

Key routes:
- `POST /api/atendimentos` — creates session + optionally creates a `Cobranca` and a customer in Asaas
- `POST /api/cobrancas/[id]/pagar` — marks paid, sends WhatsApp confirmation, generates receipt URL
- `POST /api/cobrancas/[id]/lembrete` — sends WhatsApp reminder (pre-due or overdue)
- `GET /api/recibo/[id]` — returns HTML receipt (only for PAGO status)
- `POST /api/lembretes` — cron endpoint (requires `Authorization: Bearer $CRON_SECRET`), processes D-3 reminders and overdue updates
- `POST /api/webhooks/asaas` — receives Asaas payment events, auto-confirms payment and sends WhatsApp

### External integrations
Both integrations fail silently (wrapped in `try/catch`) when not configured, so the app works without them:

- **Asaas** (`src/lib/asaas.ts`): payment gateway. Sandbox URL: `https://sandbox.asaas.com/api/v3`. Production: `https://www.asaas.com/api/v3`. Switch via `ASAAS_BASE_URL` env var.
- **WhatsApp** (`src/lib/whatsapp.ts`): Evolution API (self-hosted). Messages sent via `POST /message/sendText/{INSTANCE}`. Phone numbers are normalized to `55{digits}` format.

### UI components
No external component library. All UI components are hand-built in `src/components/ui/` using Radix UI primitives + Tailwind. Tailwind v4 uses `@import "tailwindcss"` in CSS — no `tailwind.config.js`.

Toast notifications use a custom hook at `src/hooks/use-toast.ts` (module-level state, not React context).

### Deployment
- **Vercel** (production): `recebi-khaki.vercel.app`. Auto-deploys from `master` branch pushes.
- Prisma uses the transaction-mode pooler (`port 6543`, `?pgbouncer=true`) for the app. Use the session-mode pooler (`port 5432`) for `prisma db push`.
- The `DATABASE_URL` in `.env` (not `.env.local`) is used by the Prisma CLI.

### Plan limits
`STARTER` plan is limited to 5 active clients. This is enforced in `POST /api/clientes`. `PRO` = 50 clients, `CLINICA` = 200 clients + 3 users.
