# Utility Hub — Product Requirements Document (PRD)

> A private, low‑cost, multi‑tool workspace built on a single Next.js codebase and deployed on Vercel. The first page is a searchable directory of internal apps, with Google login restricted to a small allowlist of users.

## 1) Vision & Goals

**Vision.** Centralize many small, focused utilities in one cohesive, secure, and fast personal workspace. Every utility shares a common look & feel, infra, and auth so new tools can be added in minutes, not days.

**Primary goals (MVP).**

* Single Next.js app on Vercel (Hobby) with **Edge-first** routing where practical.
* **Directory home page** that lists all utilities, supports search (name/description/tags) and user favorites.
* **Google login** via Auth.js; **only allow approved users** (allowlist of emails). No public access.
* **Shared UI/design system** for cohesive visuals and zero duplicated components.
* **MongoDB database** for users (with embedded favorites) and allowlist.
* **AI calls** routed through **Vercel AI Gateway** (primary) and **OpenAI** (fallback) with a single helper.
* Each sub‑app lives in its own folder and ships with **PRD.md** and **plan.md**, plus its own **AGENTS.md**.
* Be **frugal**: small bundle, minimal server compute, streaming where useful, inexpensive DB queries.

**Non‑goals (MVP).**

* Public or multi‑tenant distribution.
* Complex roles/permissions beyond allowlisted access.
* Heavy background job runners or cron fleets.

## 2) Users & Access Control

* **Owner:** full control (can manage allowlist, create/edit apps, see all analytics).
* **Approved users:** read/launch apps, star favorites. (Optional per‑app write access can be added later.)

**Auth & ACL.**

* Google OAuth via Auth.js.
* A MongoDB collection (or env var for bootstrap) holds **allowed emails**. Login succeeds only if email is found and active.
* Middleware short‑circuits all routes for unauthenticated or unapproved users.

## 3) Information Architecture

* **Home (/):** Directory of apps, global search, filters by tag, favorites section.
* **App detail (/apps/[slug]):** About card (from local `meta.ts`), quick links to its PRD/plan/AGENTS, Launch button.
* **App runtime (/tools/[slug]):** The actual sub‑app UI.
* **Account (/account):** Profile, favorites management.
* **Admin (/admin):** Allowlist management (owner only).

## 4) Functional Requirements

### 4.1 Directory & Search

* List all apps with name, short description, tags, created/updated timestamps.
* Search across name + description + tags (case‑insensitive) over the static list.
* Tag filter, sort by: most used, most recent, alphabetical.
* Favorite/unfavorite from card and detail view.
* Keyboard nav: ⌘/Ctrl‑K to open quick search.

### 4.2 Favorites

* Persist per‑user favorites on the user document keyed by app slug.
* Favorites appear in a pinned section and sort to the top of results.

### 4.3 Authentication & Authorization

* Google OAuth only. Sessions via Auth.js JWT (no DB session storage to save costs).
* Allowlist table guards post‑login. Unauthorized users see a friendly “not allowed” screen.
* Admin UI to add/remove approved users by email.

### 4.4 App Packaging

* One Next.js repo. Each utility under `apps/<slug>` containing:

  * `page.tsx` (or a route group) for `/tools/<slug>`
  * `meta.ts` (name, description, tags, icon, feature flags)
  * `PRD.md`, `plan.md`, and `AGENTS.md`
* `apps/*/meta.ts` descriptors are read at build time to produce a static app list; favorites persist in DB keyed by app slug.

### 4.5 Shared Design System

* Tailwind + tokens + a small wrapper on **shadcn/ui** + Radix primitives.
* Components live in `packages/ui` (or `/src/ui`) and are consumed by all apps.
* Provide primitives: `Button`, `Input`, `Textarea`, `Badge`, `Card`, `Dialog`, `Tabs`, `Dropdown`, `Table`, `EmptyState`, `AppShell`, `CommandPalette`.

### 4.6 AI Gateway Integration

* All AI calls go through `lib/ai.ts` with:

  * Provider resolution (Vercel AI Gateway first, provider fallback).
  * Streaming support.
  * Tracing hooks.
* Models selected per‑app via config; default model from env.

### 4.7 Observability & Cost Controls

* Structured server logs; edge logs for auth decisions.
* Basic request counters by app/user (DB table) for awareness.
* Feature flag to disable heavy apps on Hobby if needed.

## 5) Non‑Functional Requirements

* **Performance:** TTFB < 200ms on directory (Edge, cached); initial JS < 120KB for home.
* **Accessibility:** WCAG AA for shared components.
* **Security:** HTTPS only; strict CSP; no client‑side secrets; validate all inputs server‑side.
* **Privacy:** No analytics beyond self‑hosted basic counters unless opted in.
* **Reliability:** No background workers; idempotent APIs; safe DB migrations.

## 6) Data Model (MongoDB)

```json
// Users (mirrors Auth.js user basics, created on first approved login)
{
  "_id": "uuid",
  "email": "string",
  "name": "string?",
  "image": "string?",
  "role": "owner|member",
  "favorites": [{ "appSlug": "string", "createdAt": "timestamp" }],
  "createdAt": "timestamp"
}

// Allowlist (who can log in at all)
{
  "email": "string",
  "role": "owner|member",
  "active": true,
  "addedBy": "string?",
  "addedAt": "timestamp"
}

// Simple usage counters (optional)
{
  "userId": "uuid",
  "appSlug": "string",
  "action": "open|run|ai_call",
  "meta": {},
  "createdAt": "timestamp"
}
```

**Search vector maintenance**

```json
// no search vector needed; app list is static at build time
```

## 7) API Surface (Route Handlers / Server Actions)

* `GET /api/apps?query=&tags=&sort=` → list/search apps
* `POST /api/favorites` / `DELETE /api/favorites` → toggle favorite
* `GET /api/me` → current user
* `GET/POST /api/admin/allowlist` → CRUD allowlist (owner only)
* `POST /api/ai` → proxy to AI Gateway with app + user context

## 8) Auth Flow (Auth.js + Google)

### Production

1. User hits a protected route → redirected to Google.
2. On callback, email is checked against `allowed_users`.
3. If allowed + active → create or upsert `users` record; establish JWT session.
4. Middleware enforces allowlist on all `/`, `/tools/*`, and `/api/*` except `/_next/*` and `/api/auth/*`.

### Preview deployments

Preview branches cannot complete the OAuth handshake directly because Google only accepts pre‑registered redirect URLs. Preview deployments use the production domain as the OAuth callback:

1. A preview request without a session is redirected to its own `/api/auth/signin?callbackUrl=<previewURL>` route.
2. The sign‑in handler starts the Google OAuth flow using the production `NEXTAUTH_URL` as the callback and embeds the preview host in the OAuth `state`.
3. Google redirects to the production `/api/auth/callback` endpoint. Middleware on production reads the `state` and forwards the request to the preview host with the same path and query.
4. The preview deployment receives the callback, completes the login normally, and sets its own session cookie.
5. Subsequent preview requests present the session cookie and are authorized locally.

Preview and production share `NEXTAUTH_URL` pointing to the production host and the same `AUTH_SECRET` so tokens are valid in both environments.

**Required env vars** (examples):

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
MONGODB_URI=
AI_GATEWAY_URL=
AI_GATEWAY_API_KEY=
OPENAI_API_KEY=
DEFAULT_AI_MODEL=
OWNER_EMAIL=
```

## 9) UI/UX Notes (Design System)

* Light/dark theme toggle; system default.
* Card‑based directory grid with inline star (favorite) and tag chips.
* Global command palette (⌘K) for quick app open.
* Consistent `AppShell` (sidebar/header) used by all sub‑apps.
* Zero layout shift; predictable spacing scale and radii.

## 10) Performance & Cost Guardrails

* Prefer RSC + Edge where possible; server actions for DB mutations.
* Cache app directory query with `revalidate: 60`; client shows optimistic favorite toggles.
* Stream AI responses; default small context window; truncate inputs.
* Avoid long‑running functions; cap file uploads; no image processing in MVP.

## 11) Risks & Mitigations

* **Vercel Hobby limits:** keep cold starts low (Edge), cap memory; avoid large deps.
* **AI cost drift:** enforce per‑app hard limits and max tokens; visible usage counters.
* **Auth lockout:** always keep `OWNER_EMAIL` bypass in middleware as fallback.

## 12) Rollout Plan

**MVP (Week 1–2)**

* Repo scaffolding, Auth + allowlist, DB schema, UI kit, directory & search, favorites, one sample app.

**Phase 2**

* Admin UI polish, analytics counters, PR templates for agents, per‑app doc links and badges.

## 13) Templates to Include in Repo

`/apps/_templates/PRD.template.md`

```
# <App Name> — PRD
## Problem
## Goals
## Users & Permissions
## UX Outline
## Functional Requirements
## Non‑functional Requirements
## Data Model (if any)
## API (if any)
## Risks
## Rollout & Metrics
```

`/apps/_templates/plan.template.md`

```
# <App Name> — Implementation Plan
- Milestone 1 (scaffold)
- Milestone 2 (core feature)
- Milestone 3 (polish/tests)
- Out of scope
- Acceptance criteria
```

`/apps/_templates/AGENTS.template.md`

```
# Agents for <App Name>
- Planner: expand PRD → tasks
- UI Engineer: pages & components
- Backend Engineer: routes, DB
- QA: test plan & checks
- Doc Bot: readme, screenshots
## Working Agreement
- Small PRs, pass checks, avoid heavy deps
```

---

**Definition of Done (MVP):**

* Auth + allowlist works on Vercel preview & prod.
* Directory lists apps, search returns expected results, favorites persist per user.
* One sub‑app shipped using shared components.
* Docs and templates present; deploy succeeds with minimal cold start and low bundle size.
