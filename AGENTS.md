# Agents.md — Repository‑level AI Agents & Working Agreements

This document defines how autonomous or semi‑autonomous AI agents collaborate in this repo to plan, implement, and maintain the Utility Hub. Each sub‑app also ships its own `AGENTS.md` tailored to that app.

## 0) Principles

* **PRD‑first.** Agents always read the top‑level `PRD.md` and the sub‑app’s `PRD.md` before writing code.
* **Small steps.** Prefer tiny, reviewable PRs with one responsibility.
* **Single source of truth.** Sub‑app `meta.ts` and templates define what’s shipped; DB is a cache/index.
* **Frugality.** Keep dependencies lean, avoid background jobs, use streaming and caching.
* **Security first.** No secrets in code. No new auth surfaces without human approval.

## 1) Agent Roster (Repo Level)

* **Architect Agent**

  * Creates/maintains repo structure, build config, shared UI library, and design tokens.
  * Ensures all pages use the `AppShell` and consistent theming.

* **Planner Agent**

  * For each sub‑app: turns `PRD.md` → `plan.md` with milestones and acceptance criteria.
  * Breaks down work into issues labeled `feat`, `chore`, `fix`, `docs`.

* **Scaffolder Agent**

  * Generates `apps/<slug>` skeleton from templates, including `PRD.md`, `plan.md`, and `AGENTS.md`.
  * Adds `meta.ts` and registers the app (local + DB via sync script).

* **UI Engineer Agent**

  * Builds pages and components using the shared UI kit.
  * Ensures a11y (labels, roles, focus, keyboard navigation) and minimal bundle impact.

* **Backend Engineer Agent**

  * Implements route handlers/server actions, DB schema changes via migrations, and search indexing.
  * Wires Auth.js middleware and allowlist guard.

* **AI Integration Agent**

  * Owns `lib/ai.ts` and `/api/ai` proxy. Adds model configs per app; enforces token/cost caps.

* **QA Agent**

  * Writes e2e “happy path” checks (Playwright Lite or minimal Vitest + React Testing Library) and manual checklists.
  * Verifies auth, search, favorites, and streaming flows on Preview deployments.

* **Docs Agent**

  * Maintains `README.md`, adds screenshots/GIFs, keeps `PRD.md`/templates up to date.

* **Release Steward**

  * Tags PRs for `preview` or `prod`. Checks bundle size and deployment logs.

## 2) Working Agreements

* **Branching.** `main` (protected). Features: `feat/<area>-<short>`.
* **Commits.** Conventional style: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.
* **PR template.** Checklist includes: linked issue, screenshots, a11y notes, perf notes, and risk.
* **CI (lightweight).** Typecheck, lint, build, run minimal tests. Block on failing checks.
* **Ownership.** Each sub‑app names an Owner in its `AGENTS.md`.

## 3) Repository Layout (High Level)

```
/ (Next.js App Router)
├─ apps/
│  ├─ _templates/
│  │  ├─ PRD.template.md
│  │  ├─ plan.template.md
│  │  └─ AGENTS.template.md
│  ├─ <slugA>/
│  │  ├─ meta.ts
│  │  ├─ page.tsx (or route group)
│  │  ├─ PRD.md
│  │  ├─ plan.md
│  │  └─ AGENTS.md
│  └─ <slugB>/ ...
├─ src/ui/ (shared design system)
│  ├─ components/* (Button, Card, Command, etc.)
│  ├─ app-shell/*
│  └─ theme/* (tokens, tailwind config)
├─ src/app/ (app router)
│  ├─ page.tsx              (directory)
│  ├─ tools/[slug]/page.tsx (sub‑app mount)
│  ├─ apps/[slug]/page.tsx  (details, docs links)
│  ├─ admin/*               (allowlist, registry)
│  └─ api/*                 (apps, favorites, ai, admin)
├─ src/lib/
│  ├─ db.ts (Neon client + ORM)
│  ├─ auth.ts (Auth.js config)
│  ├─ ai.ts (Gateway + provider fallback)
│  └─ registry.ts (scan apps/*/meta.ts, sync helpers)
├─ prisma/ or drizzle/ (choose one; see below)
├─ .env.example
└─ docs/ (top‑level docs including PRD.md and this file)
```

## 4) Tech Choices for Agents

* **Framework:** Next.js (App Router). RSC + Server Actions.
* **Styling:** Tailwind + shadcn/ui (Radix). Single theme file and tokens.
* **DB:** Neon Postgres with **Drizzle ORM** (lightweight, SQL‑first) — migrations checked into repo.
* **Auth:** Auth.js (Google provider). JWT sessions.
* **AI:** Central helper that talks to Vercel AI Gateway; provider can be overridden per app.

## 5) Guardrails & Policies

* **Secrets Handling:** Use Vercel Project Environment Variables only. Never commit or print secrets.
* **Allowlist Enforcement:** All protected routes behind middleware; server validates again.
* **Dependency Budget:** Avoid bringing in heavy charts, date libs, or UI frameworks without approval.
* **DB Safety:** Migrations must be idempotent and backward compatible. No destructive changes without Owner approval.
* **Network Costs:** Prefer Edge runtime for lightweight GETs; Node runtime only where needed (e.g., AI SDKs).

## 6) Standard Operating Procedure (SOP)

1. **Create sub‑app**

   * Scaffolder Agent copies templates into `apps/<slug>` and fills `meta.ts`.
   * Planner Agent writes `plan.md` with milestones & acceptance criteria.
2. **Implement**

   * UI Engineer builds `/tools/<slug>` pages using shared components.
   * Backend Engineer adds any `/api` handlers and DB tables (if required by the `PRD.md`).
   * AI Integration Agent wires model calls via `lib/ai.ts`.
3. **Register**

   * Run registry sync to upsert DB from `meta.ts` (exposed as a script and `/api/apps/sync` for admin).
4. **Test**

   * QA Agent runs checklists and minimal tests; attach screenshots to PR.
5. **Ship**

   * Release Steward merges after checks and verifies Vercel Preview/Prod deploy.

## 7) Prompts & Templates

**Planner Agent Prompt (per sub‑app)**

```
You are Planner Agent. Read apps/<slug>/PRD.md and produce apps/<slug>/plan.md with:
- 3 milestones (scaffold, core, polish)
- task list with owners
- risks & mitigations
- acceptance criteria
Keep it minimal and incremental.
```

**UI Engineer Agent Prompt (per sub‑app)**

```
Build pages for apps/<slug> using shared components from src/ui.
- Accessibility (labels, roles, keyboard, focus)
- Performance (no large deps)
- Consistency (AppShell, spacing, typography)
```

**Backend Engineer Agent Prompt (per sub‑app)**

```
Implement required API handlers and DB schema using Drizzle + Neon.
- Validate input on server
- Use server actions where convenient
- Add indexes for any new search fields
```

**AI Integration Agent Prompt**

```
Use lib/ai.ts to call the AI Gateway by default. Stream responses where helpful.
- Enforce token and cost caps
- Allow per‑app model override via meta.ts
```

**QA Agent Prompt**

```
Verify:
- Auth gate works for allowed and disallowed users
- Directory lists and searches apps correctly
- Favorites toggle persists and reorders UI
- Sub‑app loads and basic flows work
```

## 8) Definition of Done (Repo Level)

* Sub‑app has `PRD.md`, `plan.md`, `AGENTS.md`, and `meta.ts`.
* Uses shared UI kit and `AppShell`.
* Passes lint, typecheck, build, and minimal tests.
* Deployed preview works with auth; owner can favorite and open the app.

## 9) Operational Checklists

**Before merging**

* [ ] No secrets or tokens in code or logs
* [ ] Bundle size diff acceptable
* [ ] Env vars documented
* [ ] a11y review for new UI

**After deploy**

* [ ] Login works for approved users
* [ ] Directory and search return expected results
* [ ] Favorites persist
* [ ] Errors produce friendly UI

## 10) Sub‑app AGENTS.md Template

```
# Agents for <App Name>
Owner: <name or email>

## Roles
- Planner — turns PRD into plan.md
- UI Engineer — builds UI with shared kit
- Backend Engineer — APIs & DB
- QA — checklists & tests
- Docs — screenshots & usage

## Rules
- Keep PRs small, reuse components, no heavy deps.
- All AI calls via lib/ai.ts; token caps respected.
- Changes to auth/ACL require Owner approval.

## Milestones (from plan.md)
- M1: Scaffold
- M2: Core feature
- M3: Polish & ship
```

---

**Tooling Defaults**

* Node 20 on Vercel.
* Edge runtime for public GET routes; Node for AI endpoints.
* Drizzle migrations via `pnpm drizzle-kit`.
* Linting with ESLint + Biome (optional) and Prettier.

**How agents decide models**

* Use `DEFAULT_AI_MODEL` from env by default.
* Sub‑apps can specify a `model` in `meta.ts`; `lib/ai.ts` honors it.
* All requests attempt AI Gateway first with fallback provider if configured.
