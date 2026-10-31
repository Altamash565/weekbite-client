# Agent & Copilot Instructions

> **Single Source of Truth Notice:**
> To eliminate split-brain context and maintain deterministic architectural standards across all AI coding assistants, this project maintains its canonical system instructions in root files.

### Canonical Directives
- **Architecture, Tooling & Strict Invariants:** Read [`GEMINI.md`](GEMINI.md)
- **Visual Design Tokens & UI Component Specifications:** Read [`DESIGN.md`](DESIGN.md)
- **Domain-Specific Workflows & Deep Procedures:** Consult [`.geminiskills/`](.geminiskills/)

### Critical Execution Rules for Agents
1. **Never use web HTML elements** (`div`, `span`, `button`) or web CSS in `apps/mobile`.
2. **Never import across features** directly; isolate modules in `src/features/<feature>` and elevate shared logic to `src/shared/`.
3. **Always verify compilation** using `pnpm --filter mobile exec tsc --noEmit` before concluding work.

