# Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        SvelteKit                         │
│              (shadcn-svelte + Tailwind v4)               │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                       Convex Cloud                       │
│  • Better Auth  • Workpools  • Workflows  • Storage     │
└────────┬────────────────┬───────────────────────────────┘
         │                │
         │          ┌─────▼─────┐
         │          │  Docling  │
         │          │  (Python  │
         │          │   HTTP)   │
         │          └───────────┘
         │
    ┌────▼────────────────────┐
    │     LLM Router          │
    │  (Convex HTTP Action)   │
    │  • OpenRouter API       │
    │  • Config-driven rules  │
    │  • Auto-fallback        │
    └─────────────────────────┘
```
