# Hlophe Outdoor Media — Design System

> iOS-26 Liquid Glass · Professional Enterprise Grade
> Single source of truth for tokens, components, and patterns. Everything below is wired to `css/style.css` — if it's not a token here, don't hardcode it.

---

## 1. Design Tokens

All tokens live in the `:root` block of `css/style.css`. Reference them via `var(--token)` — never hardcode a hex, px, or rgba value that a token already covers.

### 1.1 Color — Backgrounds
| Token | Value | Use |
|-------|-------|-----|
| `--bg-base` | `#05051a` | Page background (near-black indigo) |
| `--bg-raised` | `#09091f` | Raised surfaces / sections |
| `--bg-overlay` | `rgba(9,9,31,0.85)` | Modal & menu scrims |

### 1.2 Color — Accent (Brand Purple)
| Token | Value | Use |
|-------|-------|-----|
| `--accent` | `#7c3aed` | Primary brand, button base, links-active |
| `--accent-mid` | `#9b59d6` | Gradient partner for `--accent` |
| `--accent-light` | `#a78bfa` | Hover text, highlights |
| `--accent-pale` | `#c4b5fd` | Emphasis text on dark, link hover |
| `--accent-glow` | `rgba(124,58,237,0.30)` | Shadows & glows |

**Partner brand accent:** Nuuhaven credit only → `#dfff00` (`.nuuhaven-link`). Not for general UI.

### 1.3 Color — Text Hierarchy
| Token | Value | Use |
|-------|-------|-----|
| `--t1` | `rgba(255,255,255,0.97)` | Headings, nav links, primary copy |
| `--t2` | `rgba(255,255,255,0.85)` | Body / paragraph text |
| `--t3` | `rgba(255,255,255,0.65)` | Labels, footer meta, form hints |
| `--t4` | `rgba(255,255,255,0.45)` | Fine print, disabled, faint captions |

> **Contrast rule:** Text sitting on the hero image or a transparent navbar (no glass behind it) must use `--t1`. Reserve `--t3`/`--t4` for text on solid dark surfaces only.

### 1.4 Color — Glass Surfaces & Borders
| Token | Value | | Token | Value |
|-------|-------|--|-------|-------|
| `--glass-1` | `rgba(255,255,255,0.04)` | | `--border-dim` | `rgba(255,255,255,0.08)` |
| `--glass-2` | `rgba(255,255,255,0.07)` | | `--border-soft` | `rgba(255,255,255,0.14)` |
| `--glass-3` | `rgba(255,255,255,0.11)` | | `--border-bright` | `rgba(255,255,255,0.26)` |
| `--glass-4` | `rgba(255,255,255,0.16)` | | | |

### 1.5 Layout & Spacing
| Token | Value | Use |
|-------|-------|-----|
| `--max-w` | `1200px` | Container max width |
| `--gutter` | `64px` → 40 → 24 → 16 (responsive) | Horizontal padding |
| `--section-v` | `120px` → 96 → 64 → 52 (responsive) | Vertical section rhythm |

### 1.6 Radius
| Token | Value | Typical use |
|-------|-------|-------------|
| `--r-sm` | `10px` | Inputs, chips |
| `--r-md` | `16px` | Small cards |
| `--r-lg` | `22px` | `.glass`, standard cards |
| `--r-xl` | `32px` | `.glass-deep`, feature panels |
| `--r-2xl` | `48px` | Hero / oversized panels |
| pill | `50px` | Buttons, labels, badges |

### 1.7 Motion (Easing)
| Token | Curve | Feel |
|-------|-------|------|
| `--ease-spring` | `cubic-bezier(0.16,1,0.3,1)` | Entrances, reveals |
| `--ease-out` | `cubic-bezier(0.33,1,0.68,1)` | Buttons, hovers |
| `--ease-io` | `cubic-bezier(0.45,0,0.55,1)` | Loops, marquee |

Standard transition: `all 0.3s var(--ease-out)`. Nav/scroll shifts: `0.4s var(--ease-out)`.

### 1.8 Typography
| Role | Family | Weights |
|------|--------|---------|
| Display / headings | `Syne` | 600 / 700 / 800 |
| Body / UI | `Inter` | 300–700 |

Fluid sizing via `clamp()`. Base body `line-height: 1.6`. Labels use `letter-spacing: 0.1em` + `text-transform: uppercase`.

---

## 2. Core Components

### 2.1 Glass Surfaces
Three elevation tiers — pick by importance, don't stack blur manually.

| Class | Blur | Radius | Use |
|-------|------|--------|-----|
| `.glass` | 32px | `--r-lg` | Default cards, nav-when-scrolled |
| `.glass-deep` | 48px | `--r-xl` | Elevated / hero-adjacent panels |
| `.glass-accent` | 32px | `--r-lg` | Purple-tinted call-out surfaces |

All include layered inset highlight + drop shadow and a brighter top border (`border-top-color: --border-bright`) to fake a light source from above.

### 2.2 Button — `.btn`
Base: pill, `14px 28px`, weight 600, `--ease-out`, optional 16px leading `svg`.

| Variant | Class | Use |
|---------|-------|-----|
| Primary | `.btn-primary` | One per view — the main action (accent gradient + glow) |
| Ghost | `.btn-ghost` | Secondary actions (glass-2 + soft border) |

| Size | Class | Padding |
|------|-------|---------|
| Large | `.btn-lg` | `18px 36px` |
| Default | — | `14px 28px` |
| Small | `.btn-sm` | `10px 20px` |

**States**
| State | Behavior |
|-------|----------|
| Hover | `translateY(-2px)` + deeper shadow / brighter border |
| Active | Press (no separate rule — relies on transform settle) |
| Loading | JS swaps label to `Sending…`, `disabled=true` (see form handler) |
| Success/Error | JS sets green/red gradient bg for 5–6s, then restores |

**Groups:** `.hero-ctas` / `.cta-banner-btns` — row with `gap:20px`, `flex-wrap:nowrap`; stack to full-width column below 580px. Always ≥40px gap between the preceding text and the button row.

### 2.3 Navbar — `#navbar`
Fixed, transparent at top → `.scrolled` adds `rgba(5,5,26,0.82)` + 40px blur + bottom border. Brand lockup left (`--t1` name, `--t1` subtitle "OOH Advertising · Gauteng"), links right (`--t1`). Below 768px links collapse into `.nav-toggle` → full-screen `#mobile-menu` (Syne 2.2rem links).

### 2.4 Section Label — `.section-label`
Pill eyebrow above section headings: purple-tint bg, `0.72rem`, weight 700, `0.1em` tracking, uppercase.

### 2.5 Footer
4-col `.footer-grid` (collapses 2-col @1100, 1-col @768). `.footer-bottom` is a 3-zone grid: copyright (start) · badges (center) · "Designed & built by Nuuhaven" (end). Column headings `--t1`, links `--t2`, reg/copy `--t3`.

---

## 3. Patterns

- **Ambient background** (`.bg-ambient`): fixed 3-layer radial purple glow behind everything, `z-index:0`, `pointer-events:none`.
- **Hero layering** (homepage): 6 explicit z-index layers — `img`(1) → grade(2) → vignette(3) → accent(4) → canvas(5) → content(6). Never let the particle canvas share z-index with the photo.
- **Scroll reveal**: `.reveal` + IntersectionObserver adds `.visible`; entrances use `--ease-spring`.
- **Client marquee**: infinite CSS translate loop, `--ease-io`, duplicated track for seamless wrap.
- **Count-up stats**: `[data-counter][data-target][data-suffix]` animate when scrolled into view.

---

## 4. Responsive Breakpoints
`1100px` · `900px` · `768px` (nav collapse) · `600px` · `580px` (button stack) · `520px` · `480px` · `420px`.
Global guards: `overflow-x:hidden` on **both** `html` and `body`; `box-sizing:border-box` everywhere; `img{max-width:100%}`.

---

## 5. Rules of the System
1. **Token or nothing** — no raw hex/rgba/px where a token exists.
2. **`--t1` over imagery** — anything on the hero/transparent nav goes full-brightness.
3. **One `.btn-primary` per view** — everything else is ghost.
4. **Three glass tiers only** — don't invent a fourth blur; pick `.glass` / `.glass-deep` / `.glass-accent`.
5. **No em dashes in body copy** (brand voice); use commas or full stops.
6. **Web-safe asset names** — no spaces/colons in files that get served (breaks GitHub Pages).
