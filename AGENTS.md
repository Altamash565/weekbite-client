<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": true` in the root `turbo.json` or `turbo.jsonc` to opt in; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# WeekBite Monorepo AI Agent Guidelines

You are an expert AI software engineer working on **WeekBite**, a modern weekly meal compass and kitchen companion application structured as a Turborepo monorepo.

## 1. Monorepo Architecture Overview
```text
weekbite-client/
├── apps/
│   ├── mobile/             # React Native (Expo) mobile application
│   ├── web/                # Next.js web client
│   └── docs/               # Documentation application
├── packages/
│   ├── ui/                 # Shared UI component primitives
│   ├── eslint-config/      # Shared ESLint configurations
│   └── typescript-config/  # Shared tsconfig bases
├── AGENTS.md               # Monorepo-wide AI agent rules (this file)
├── PRODUCT.md              # Brand compass, product identity & design principles
└── README.md               # Developer setup & workspace execution guide
```

## 2. Universal Agent Rules

### Tooling & Package Management
- **Always use `pnpm`**: Never run `npm` or `yarn`. Package installations must respect workspaces (`pnpm --filter <workspace> add <pkg>`).
- **Workspace Dependencies**: Link internal packages using `workspace:*` (e.g., `"@repo/ui": "workspace:*"`).
- **Run Tasks via Turbo**: Run dev, build, lint, and typechecks through Turborepo:
  - Dev: `pnpm dev` or `pnpm --filter <app> dev`
  - Build: `pnpm build`
  - Check types: `pnpm check-types`
  - Lint: `pnpm lint`

### Platform Isolation Rule
- **Mobile (`apps/mobile`)** uses React Native primitives (`View`, `Text`, `StyleSheet`). **NEVER** use web DOM tags (`div`, `p`, `span`, `button`) or web CSS in the mobile workspace.
- **Web (`apps/web`)** uses Next.js, HTML/DOM, and Tailwind CSS.
- For deep mobile-specific guidelines, always consult [`apps/mobile/AGENTS.md`](apps/mobile/AGENTS.md).

### Code Quality & Verification
- **Zero TypeScript Errors**: Always run `pnpm check-types` (or `npx tsc --noEmit` inside the specific workspace) before completing any task.
- **Documentation Integrity**: Keep comments and docstrings concise and accurate. Do not leave dead code or unused imports.
- **Product Alignment**: Read [`PRODUCT.md`](PRODUCT.md) to understand the "Kitchen Calm" design philosophy before proposing or modifying user-facing features.
