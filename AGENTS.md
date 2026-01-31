# Alpha Study App - Agent Knowledge Base

**Generated:** 2026-01-31  
**Stack:** SvelteKit 5 + Convex + TypeScript  
**Package Manager:** Bun  

---

## OVERVIEW

AI-powered study platform with document processing, flashcards, quizzes, and summaries. Phase 1 MVP complete with SM-2 spaced repetition, LLM-generated content via OpenRouter, and vector search.

---

## STRUCTURE

```
.
├── apps/
│   ├── web/              # SvelteKit frontend (Node adapter)
│   └── docling/          # Python document processing microservice
├── packages/
│   ├── backend/          # Convex functions + schema
│   ├── ui/               # shadcn-svelte components (~70 components)
│   ├── ai/               # LLM router + prompts
│   ├── assets/           # Logo assets
│   └── config/           # Shared TypeScript config
├── AGENTS.md             # This file
├── tasks.md              # Feature tracker
└── turbo.json            # Monorepo pipeline
```

---

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add UI component | `packages/ui/src/lib/components/ui/` | Use `bun run shadcn` |
| Add Convex query/mutation | `packages/backend/convex/functions/` | Follow existing patterns |
| Add workflow | `packages/backend/convex/workflows/` | AI generation workflows |
| Add AI prompt | `packages/ai/src/prompts/` | Include Zod schema |
| Add web route | `apps/web/src/routes/` | SvelteKit file-based routing |
| Add test | `packages/ai/src/**/*.test.ts` or `packages/ui/e2e/` | Vitest unit, Playwright e2e |
| Schema changes | `packages/backend/convex/schema.ts` | 368 lines, comprehensive |

---

## CONVENTIONS (Non-Standard)

### TypeScript
- **Always prefer `type` over `interface`**
- Strict mode: `noUncheckedIndexedAccess`, `noUnusedLocals`
- **NO type assertions** (`as any`, `as Type`, `as unknown`)
- **NO `@ts-*` comments** (ignore, expect-error, nocheck)

### Imports
- Use `$lib` for internal imports within a package
- Use `@lib` in `packages/ui` for cross-package imports
- Workspace deps: `workspace:*` for internal, `catalog:` for shared

### Components
- shadcn-svelte pattern: `component/` folder with `component.svelte` + `index.js`
- Custom components alongside shadcn in `packages/ui/src/lib/components/ui/`

### Backend
- Convex queries/mutations: export const functionName = query({...})
- Workflows for async AI processing
- Vector search: 1536-dim OpenAI embeddings in `documentChunks`

---

## ANTI-PATTERNS (Explicitly Forbidden)

```
DO NOT:
- Skip writing tests
- Use npm/yarn/pnpm (Bun only)
- Mark tasks complete before tests pass
- Work on multiple tasks simultaneously
- Use dependencies without installing first
- Commit without running `bun run build`
- Use type assertions or @ts-* comments
```

---

## COMMANDS

```bash
# Development
bun run dev              # Start all dev servers
bun run dev:web          # Web only
bun run dev:server       # Convex only
bun run dev:setup        # Configure Convex

# Build & Check
bun run build            # Build all packages
bun run check-types      # TypeScript check
bun run check            # Lint + format (oxlint + oxfmt)

# Testing
bun run test:unit        # Vitest (in package)
bun run test:e2e         # Playwright (in packages/ui)

# UI Components
bun run shadcn add <component>   # Add shadcn component
```

---

## NOTES

- **No spec directory exists** despite AGENTS.md mentioning it
- **Single contributor** (Fractal-Tess) - no complex git workflows
- **No CI/CD** configured yet
- **progress.txt** should be created if missing
- **517 source files**, ~23k lines of TypeScript/Svelte
- **2 large files** (>500 lines): schema.ts, router.ts

---

## WORKFLOW

1. Read `tasks.md`, pick incomplete task (`[ ]`)
2. Write tests first (TDD)
3. Implement feature
4. Run tests to confirm pass
5. Run `bun run build` to validate
6. Update `progress.txt` with timestamp + commit hash
7. Mark task complete in `tasks.md`
8. Commit with conventional format: `feat:`, `fix:`, `test:`

---

## DATABASE SCHEMA (Key Tables)

| Table | Purpose |
|-------|---------|
| `users` | Auth via Better Auth |
| `subjectGroups` | Top-level organization |
| `subjects` | Within groups |
| `folders` | Nested within subjects |
| `documents` | Uploaded files (PDF/DOC/DOCX) |
| `generations` | AI-generated content (flashcards/quiz/notes/summary) |
| `flashcardItems` | With SM-2 algorithm fields |
| `quizItems` | Multiple choice questions |
| `documentChunks` | Vector embeddings (1536-dim) |
| `dailyStats`, `streaks` | Progress tracking |

See `packages/backend/convex/schema.ts` for full schema (368 lines).
