<!-- .github/copilot-instructions.md - guidance for AI coding assistants -->
# Copilot Instructions — idauto

Short, actionable notes to help AI agents make safe, correct changes in this repo.

- Project type: Next.js (App Router) + TypeScript + Tailwind CSS. Key entrypoints: `package.json`, `src/app`, `next.config.ts`, `tsconfig.json`.
- Build & dev commands (from `package.json`):
  - dev: `npm run dev` → starts Next.js dev server (uses Turbopack via `next dev --turbopack`).
  - build: `npm run build` → `next build --turbopack`.
  - start: `npm run start` → `next start` for production.

Important code areas and conventions
- UI components: reusable primitives live in `src/components/ui/` (example: `card.tsx`). Follow existing prop patterns (pass className, spread props, use `data-slot` attributes).
- Styling: Tailwind + `cn` helper. Utility `cn` is in `src/lib/utils.ts` and wraps `clsx` + `tailwind-merge`. Use it for conditional class composition to preserve merge behavior.
- App Router: pages/components use the App Router layout under `src/app`. Global styles are imported in `src/app/globals.css` and fonts configured in `src/app/layout.tsx`.
- Dashboards: identity dashboards live at `src/app/idauto/*` (Azure and Google). These are client components (`'use client'`) that rely on `recharts`, `lucide-react`, and `framer-motion` for visuals and animation. Keep those libraries when editing charts or UI.

Patterns to follow
- Components are small, presentational and accept `className` + spread props. Example: `Card` in `src/components/ui/card.tsx`.
- Charts use `recharts` components inside `ResponsiveContainer` for layout; preserve container wrapper to keep responsive behavior.
- Client vs server: dashboards are client components (start with `'use client'`). Avoid converting them to server components without adjusting imports (framer-motion and many UI libs require client runtime).
- Data: current dashboards use hard-coded example data arrays inside component files. If adding real data fetching, prefer using client-side fetch in effects or migrate to server components with async fetch if removing client-only libs.

Dev & debugging notes
- Lint: `npm run lint` (ESLint configured via `eslint.config.mjs` and `eslint-config-next`). Fix lint errors locally before commit.
- Fast refresh: `npm run dev` uses Turbopack—expect near-instant updates but occasional cache issues; restart dev server if hot-reload misbehaves.
- TypeScript: `tsconfig.json` uses strict mode. Run the TypeScript compiler via your editor or `npm run build` to catch type errors.

Testing & CI
- There are no tests included. Avoid adding heavyweight test infra without asking—start with lightweight unit tests if required.

External deps & integration
- UI libraries: `recharts`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`, and `class-variance-authority` are used across the UI.
- Publishing: `npm run deployToGitHub` builds and pushes `src` to GitHub Pages via `gh-pages` (branch `master`) — verify branch settings before using.

When making changes
- Keep changes minimal and isolated. Update one component or page per PR.
- Preserve existing component API (props and className) unless refactoring across the project.
- For visual changes, run `npm run dev` and verify interactive behavior in the browser. When changing chart structures, keep `ResponsiveContainer` and dataKey names consistent.

Files to reference when editing
- `package.json` — scripts & deps
- `src/app/layout.tsx`, `src/app/globals.css` — global app layout and fonts
- `src/components/ui/card.tsx` — example of component patterns
- `src/lib/utils.ts` — `cn` helper
- `src/app/idauto/azure/AzureDashboard.tsx` and `src/app/idauto/google/GoogleDashboard.tsx` — primary pages to reference for UI and client-only behavior

If unsure
- Ask for clarification about desired runtime (client vs server) before moving client-only libs into server components.
- If a build error appears after edits, run `npm run build` and paste the full error into the PR for triage.

Examples, common edits, and troubleshooting

- Add a new dashboard Card (recommended small change):
  1. Create or edit a client component under `src/app/idauto/` (dashboards are client components; file should start with `'use client'`).
 2. Reuse the `Card` primitives from `src/components/ui/card.tsx`. Keep the prop pattern: accept `className` and spread remaining props. Example structure:

   - File: `src/app/idauto/my/NewWidget.tsx`
     - Use `Card`, `CardHeader`, `CardTitle`, `CardContent` and `ResponsiveContainer` for charts.
     - Keep visual libraries (e.g., `recharts`) imports in client components.

- Data fetching notes:
  - Current dashboards use hard-coded arrays inside components. If you add fetching:
    - For client-side UI that uses `framer-motion` or `recharts`, fetch in a React effect (useSWR or fetch inside `useEffect`) and keep the component as `'use client'`.
    - If you convert to a server component to use Next.js `fetch` on the server, remove client-only libs or split UI: server fetch + client visual component.

- Turbopack / dev tips:
  - `npm run dev` runs Next with Turbopack. Hot-reload is fast but can cache stale state. If changes do not reflect:
    - Stop dev server and restart `npm run dev`.
    - If layout/fonts or global CSS changes fail to apply, consider clearing `.next` or restarting the dev server.

- Vercel deployment (recommended)
  - This repo is Next.js-ready and works well with Vercel. Recommended Vercel settings:
    - Framework preset: Next.js
    - Build command: `npm run build`
    - Output directory: leave default
    - Node.js version: match `engines` in `package.json` if present, otherwise Node 18+ is safe for Next 15
    - Environment variables: add API keys/secrets via Vercel dashboard (Project > Settings > Environment Variables). Do not commit secrets.
    - Preview deployments: Vercel creates preview builds for PRs—use these to sanity-check UI changes.

If you want more
- I can add a short PR checklist (lint, ts build, visual smoke test) into this file.
- I can add a concrete code snippet showing a minimal Card widget file and the recommended import paths.

End of instructions.
