# WeekBite Client Monorepo

Welcome to the **WeekBite** client repository. WeekBite is a calm weekly meal compass built with **React Native (Expo)**, **Next.js**, and **Turborepo**.

---

## Workspace Architecture

```text
weekbite-client/
├── apps/
│   ├── mobile/             # React Native Expo app (iOS & Android)
│   ├── web/                # Next.js web application
│   └── docs/               # Documentation application
├── packages/
│   ├── ui/                 # Shared UI component primitives
│   ├── eslint-config/      # Shared ESLint configurations
│   └── typescript-config/  # Shared tsconfig bases
├── AGENTS.md               # Monorepo-wide AI agent instructions
├── PRODUCT.md              # Brand identity, personas & design principles
├── turbo.json              # Turborepo task pipeline configuration
└── pnpm-workspace.yaml     # pnpm workspace definition
```

---

## Prerequisites

- **Node.js**: `v20.x` or later (Node 24 recommended)
- **Package Manager**: [`pnpm`](https://pnpm.io/) (v9 or later)
- **Expo Go** / Android Studio / Xcode (for running `apps/mobile`)

---

## Getting Started

### 1. Install Dependencies
Install all workspace dependencies from the root directory:
```bash
pnpm install
```

### 2. Development

#### Run all apps in parallel:
```bash
pnpm dev
```

#### Run only the Mobile app (Expo):
```bash
pnpm --filter mobile start
```
- Press `a` in terminal to run on an Android emulator/device.
- Press `i` to run on an iOS simulator.
- Press `w` to run in the web browser.
- Scan the QR code using the **Expo Go** app on your physical device.

#### Run only the Web app (Next.js):
```bash
pnpm --filter web dev
```
Open [http://localhost:3000](http://localhost:3000) to view the web client.

---

## Quality Checks & Commands

| Task | Command | Description |
| :--- | :--- | :--- |
| **Build** | `pnpm build` | Compiles all packages and applications |
| **Lint** | `pnpm lint` | Runs ESLint across all workspaces |
| **Type Check** | `pnpm check-types` | Validates TypeScript in parallel without emitting files |
| **Format** | `pnpm format` | Formats TypeScript, TSX, and Markdown files with Prettier |

---

## Documentation Links

- **Product Compass**: Read [`PRODUCT.md`](PRODUCT.md) for brand tone, target audience, and anti-references.
- **Mobile Guidelines**: Read [`apps/mobile/AGENTS.md`](apps/mobile/AGENTS.md) for React Native constraints.
- **Mobile Design System**: Read [`apps/mobile/DESIGN.md`](apps/mobile/DESIGN.md) for exact color tokens, typography, and component specs.
- **Mobile Folder Architecture**: Read [`apps/mobile/ARCHITECTURE.md`](apps/mobile/ARCHITECTURE.md) for Feature-Driven structure rules.
