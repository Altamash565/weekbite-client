# DESIGN.md — Visual & UI Specification

**Calm Culinary Minimal** — Machine-readable design specification engineered for low visual clutter, kitchen ergonomics, and high legibility.

---

## 1. Color System & Design Tokens

### Brand Palette
| Token | Hex | NativeWind Class | Role & Strict Rules |
| :--- | :--- | :--- | :--- |
| `primary` | `#32CD32` | `bg-primary`, `text-primary` | Main CTA fill, active day indicator, accent mark |
| `primary-dark` | `#1F8A1F` | `text-primary-dark`, `border-primary-dark` | Pressed state, focused input border, inline links |
| `primary-tint` | `#E9F8E9` | `bg-primary-tint` | Badge fills, active icon background squircle |
| `on-primary` | `#0F2A0F` | `text-on-primary` | **MANDATORY**: Text on `#32CD32` buttons (NEVER white) |

### Neutrals & Surfaces (Light Theme)
| Token | Hex | NativeWind Class | Role |
| :--- | :--- | :--- | :--- |
| `background` | `#F8FAF7` | `bg-background` | Viewport canvas background, soft organic tint |
| `surface` | `#FFFFFF` | `bg-surface` | Cards, bottom sheets, form input backgrounds |
| `surface-low` | `#F2F5EE` | `bg-surface-low` | Inactive chip fills, disabled input backgrounds |
| `border` | `#E6EAE4` | `border-border` | 1px dividers, input borders, unselected card strokes |
| `text-primary` | `#1B1F1B` | `text-text-primary` | Primary headings, meal titles, high-emphasis copy |
| `text-secondary`| `#6B726B` | `text-text-secondary`| Prep times, ingredient weights, captions, labels |

### Semantic & Validation
| Token | Hex | NativeWind Class | Role |
| :--- | :--- | :--- | :--- |
| `error` | `#D64545` | `text-error`, `border-error` | Validation alerts, warning states |
| `error-tint` | `#FDF2F2` | `bg-error-tint` | Error notification banners |
| `success` | `#1F8A1F` | `text-success` | Grocery checklist completion, confirmed state |

---

## 2. Typography Specification

- **Font Family:** `Plus Jakarta Sans` (`@expo-google-fonts/plus-jakarta-sans`)
- **Weights:** Regular (400), Medium (500), SemiBold (600), Bold (700)

| Style | Size | Line Height | Weight | NativeWind Class |
| :--- | :--- | :--- | :--- | :--- |
| **Display Title** | 28px | 36px | Bold (700) | `text-2xl font-bold tracking-tight` |
| **Section Header** | 20px | 28px | SemiBold (600) | `text-xl font-semibold` |
| **Card Title** | 16px | 22px | Medium (500) | `text-base font-medium` |
| **Body / Input** | 14px | 20px | Regular (400) | `text-sm font-normal` |
| **Button Label** | 14px | 18px | SemiBold (600) | `text-sm font-semibold tracking-wide` |
| **Caption / Tag** | 12px | 16px | Medium (500) | `text-xs font-medium` |

---

## 3. Layout Grid & Spacing Constraints

- **8-pt Incremental Grid**: `8px` (`p-2`), `16px` (`p-4`), `24px` (`p-6`), `32px` (`p-8`), `40px` (`p-10`), `48px` (`p-12`).
- **Screen Padding**: Fixed `20px` (`px-5`) horizontal side margins on mobile frames.
- **Corner Radii**:
  - Cards, inputs, buttons: `12px` (`rounded-xl`).
  - Brand squircles: `24px` (`rounded-3xl`).
  - Chips & pills: `9999px` (`rounded-full`).
- **Elevation & Shadows**:
  - **Zero heavy shadows**: Visual hierarchy must be established through surface contrast (`#FFFFFF` on `#F8FAF7`) and crisp `1px border` (`#E6EAE4`).
- **Ergonomics & Touch Targets**:
  - **Minimum Hit Box**: `48x48pt` on all touchable elements (`hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`).

---

## 4. Permitted Component Architecture

### Permitted Component Primitives
- **Tamagui Primitives**: `XStack`, `YStack`, `Stack`, `Separator`, `Theme`.
- **React Native Primitives**: `View`, `Text`, `Pressable`, `TextInput`.
- **List Primitives**: `@shopify/flash-list` (`FlashList`).

### Component Contracts
1. **Primary Button**:
   - Height: `52px` (`h-[52px]`).
   - Fill: `#32CD32` (`bg-primary`).
   - Text: `#0F2A0F` (`text-on-primary font-semibold`).
   - Border radius: `12px` (`rounded-xl`).
2. **Secondary Button**:
   - Height: `52px` (`h-[52px]`).
   - Fill: `#FFFFFF` (`bg-surface`).
   - Stroke: `1px solid #E6EAE4` (`border border-border`).
   - Text: `#1F8A1F` or `#1B1F1B`.
3. **Form Input**:
   - Height: `52px` (`h-[52px]`).
   - Background: `#FFFFFF` (`bg-surface`).
   - Border: `1px solid #E6EAE4` (Focus: `#1F8A1F`, Error: `#D64545`).
   - Controlled via `react-hook-form` with Zod schema resolvers.

---

## 5. Strict Styling Hard Rules

1. **NO Arbitrary Hex Codes**: Never generate inline hex colors (e.g. `style={{ backgroundColor: '#2b9348' }}`). Always use NativeWind utility classes or tokens mapped in `tokens.ts`.
2. **NO Web CSS or Classes**: Do not use `className="cursor-pointer"`, `grid`, `hover:*` (unless wrapped in responsive mobile states), or HTML tag selectors.
3. **WCAG Compliance**: Never place `#FFFFFF` text on top of `#32CD32` (fails contrast). Always use `#0F2A0F` (`text-on-primary`).

