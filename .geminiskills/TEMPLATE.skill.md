# Skill Template: [Domain / Workflow Name]

> **Progressive Disclosure Contract:**
> This skill file provides deep, on-demand domain expertise. 
> **When to read this file:** Read ONLY when executing tasks specifically involving `[Domain Keyword / Workflow Trigger]`.
> **When to ignore this file:** Do NOT load or reference this file during standard UI updates, routine bugfixes, or unrelated domain work.

---

## 1. Trigger Criteria & Activation

- **Activated by:** Explicit user intent matching `[e.g., Clerk Auth Migration, Grocery Cache Optimization, Offline Sync]`.
- **Target Workspaces:** `[e.g., apps/mobile/src/features/auth]`
- **Required Prerequisites:** `[e.g., EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY set in .env]`

---

## 2. Invariants & Guardrails Specific to this Skill

1. **[Domain Invariant 1]**: e.g., All auth tokens must be read through `tokenCache.getToken()`.
2. **[Domain Invariant 2]**: e.g., Mutations must implement optimistic updates before remote network calls.
3. **[Domain Invariant 3]**: e.g., Zod schemas must validate both client input and API server response shapes.

---

## 3. Step-by-Step Execution Recipe

### Step 1: Pre-Condition Check
```bash
# Check dependencies and environment configuration
pnpm --filter mobile list [dependency-name]
```

### Step 2: Implementation Pattern
```typescript
// Production pattern with typed error handling and zero-any policy
import { z } from 'zod';

export const DomainSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
});

export type DomainDto = z.infer<typeof DomainSchema>;
```

### Step 3: Verification & Compilation
```bash
# Compile workspace to verify 0 regressions
pnpm --filter mobile exec tsc --noEmit
```

---

## 4. Anti-Patterns to Avoid

- ❌ **Anti-Pattern 1**: [Specific mistake models commonly make in this domain].
- ❌ **Anti-Pattern 2**: [Bypassing cache / direct store mutation].

