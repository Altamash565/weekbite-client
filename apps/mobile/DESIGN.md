# WeekBite Design System

**Calm Culinary Minimal** — A clean, calm, and distraction-free design system crafted for weekly meal planning, conscious grocery management, and effortless dietary routines.

---

## 1. Brand & Aesthetic Principles

- **Calm & Unhurried:** Meal planning should reduce mental load, not add stress. We prioritize generous whitespace, soft neutral surfaces, and zero visual clutter.
- **Intentional Contrast:** Vibrant green accents highlight active steps and successful states, grounded by deep forest green typography.
- **Micro-Structure over Heavy Decoration:** Crisp 1px borders, subtle 8-pt grid alignment, and flat geometry—avoid heavy drop shadows or decorative gradients on UI cards.
- **Dual-Mode Compatibility:** Built to immerse seamlessly across clean light themes and ambient dark modes.

---

## 2. Color Palette & Design Tokens

### Core Brand Colors
| Token | Hex | Usage / Role |
| :--- | :--- | :--- |
| `primary` | `#32CD32` | Main brand call-to-action, active indicators, accent marks |
| `primary-dark` | `#1F8A1F` | Link text, pressed button states, success affirmations |
| `primary-tint` | `#E9F8E9` | Light badge backgrounds, success icon containers |
| `on-primary` | `#0F2A0F` | **Dark green text on primary buttons (Never white)** |

### Neutrals & Surfaces (Light Theme)
| Token | Hex | Usage / Role |
| :--- | :--- | :--- |
| `background` | `#F8FAF7` | App viewport background, soft organic tint |
| `surface` | `#FFFFFF` | Container cards, modals, input backgrounds |
| `surface-container-low` | `#F2F5EE` | Subtle card sections, inactive chip fills |
| `border` | `#E6EAE4` | 1px dividers, input borders, unselected card outlines |
| `text-primary` | `#1B1F1B` | Primary titles, body text, high-emphasis copy |
| `text-secondary` | `#6B726B` | Subtitles, field labels, captions, metadata |

### Semantic & Feedback Colors
| Token | Hex | Usage / Role |
| :--- | :--- | :--- |
| `error` | `#D64545` | Error borders, warning banners, validation text |
| `error-tint` | `#FDF2F2` | Error banner background fills |
| `success` | `#1F8A1F` | Confirmed state indicators, checkmark badges |
| `success-tint` | `#E9F8E9` | Success alert containers |

---

## 3. Typography

- **Font Family:** `Lexend`, sans-serif (Google Fonts)
- **Characteristics:** Clean geometric structure with wide letter spacing, engineered for instant legibility and reading comfort.

| Style | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Title** | 28px | SemiBold (600) | 1.25 | -0.02em | Screen hero titles, major welcome headers |
| **Section** | 20px | Medium (500) | 1.35 | -0.01em | Modal headers, group titles, card headings |
| **Body** | 14px | Regular (400) | 1.5 | 0 | Descriptions, helper paragraphs, list items |
| **Body Medium** | 14px | Medium (500) | 1.4 | 0 | Input fields, active toggles, highlighted copy |
| **Button** | 14px | Medium (500) | 1.0 | +0.01em | CTA labels, tab titles |
| **Caption** | 12px | Regular (400) | 1.4 | +0.01em | Validation messages, timestamps, category tags |

---

## 4. Spacing & Layout Grid

- **Base Unit:** 8-pt incremental system (`8px`, `16px`, `24px`, `32px`, `40px`, `48px`).
- **Screen Margins:** Fixed `20px` horizontal side margins on mobile frames (390px viewport width).
- **Corner Radii:**
  - Standard cards & inputs: `12px` (`rounded-xl`).
  - Buttons & pills: `12px` or full pill (`9999px`) for chips.
  - Logo squircle container: `24px`.
- **Borders & Elevation:**
  - Standard borders: `1px solid #E6EAE4`.
  - Shadows: **None** (`shadow-none` default) — visual depth is achieved via surface contrast and clean outlines.
- **Touch Target:** Minimum `44px × 44px` for all interactive elements.

---

## 5. Component Patterns & States

### Primary Button
- **Height:** 48px – 52px
- **Fill:** `#32CD32`
- **Text:** `#0F2A0F` (SemiBold / Medium 14px)
- **Radius:** 12px
- **States:**
  - *Default:* `#32CD32`
  - *Pressed / Hover:* `#28B528`
  - *Loading:* Spinner in `#0F2A0F` with disabled pointer events
  - *Disabled:* Opacity 50%, `#E6EAE4` fallback

### Secondary Button
- **Height:** 48px – 52px
- **Fill:** `#FFFFFF`
- **Border:** 1px solid `#E6EAE4`
- **Text:** `#1B1F1B` (Medium 14px)

### Form Inputs
- **Height:** 48px
- **Background:** `#FFFFFF`
- **Border:** 1px solid `#E6EAE4` (`12px` radius)
- **Padding:** 12px 16px
- **Error State:** Border `#D64545`, alert icon appended, caption text `#D64545` below field with dedicated warning icon (never color alone).

### Feedback & Notifications
- **Toast / Alert Banners:** Surface tint with 1px soft border, icon accompanying title and descriptive reason, dismissible `×` trigger.
