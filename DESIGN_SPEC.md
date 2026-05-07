# RFM Model Flowchart — Design Specification

> Aesthetic Direction: **"Refined Clarity"**
> A premium analytical tool that feels like opening a beautifully designed report from a top-tier consulting firm — clean enough to breathe, warm enough to invite exploration, precise enough to trust.

---

## 1. Typography System

### 1.1 Font Stack Strategy

Thai requires careful font selection. On macOS, the system Thai font (Thonburi / SF Thai) is excellent. On Windows, Leelawadee UI is the best system Thai font. We layer these strategically.

```css
/* Primary — For headings and UI elements */
--font-display: "SF Pro Display", -apple-system, BlinkMacSystemFont, 
                "Segoe UI", "Leelawadee UI", system-ui, sans-serif;

/* Secondary — For body text and long-form reading */
--font-body: "SF Pro Text", -apple-system, BlinkMacSystemFont,
             "Segoe UI", "Leelawadee UI", system-ui, sans-serif;

/* Mono — For values, numbers, variable names (R, S, N, T) */
--font-mono: "SF Mono", ui-monospace, "Cascadia Code", 
             "Segoe UI Mono", Menlo, monospace;
```

**Why this works:**
- macOS: Resolves to SF Pro (Display/Text) which has superb Thai glyphs via the system
- Windows: Falls through to Segoe UI → Leelawadee UI for Thai characters
- The mono stack gives technical values (R=60, T≤90) a distinct, precise feel

### 1.2 Type Scale

Using a **1.333 ratio (Perfect Fourth)** — sophisticated without being dramatic.

| Role | Size | Weight | Line Height | Letter Spacing | Font |
|------|------|--------|-------------|----------------|------|
| Hero Title | 56px / 3.5rem | 700 | 1.1 | -0.03em | display |
| Section Title | 40px / 2.5rem | 600 | 1.2 | -0.02em | display |
| Subtitle | 24px / 1.5rem | 500 | 1.35 | -0.01em | display |
| Body Large | 19px / 1.1875rem | 400 | 1.6 | 0 | body |
| Body | 16px / 1rem | 400 | 1.65 | 0 | body |
| Caption | 13px / 0.8125rem | 400 | 1.5 | 0.01em | body |
| Label | 12px / 0.75rem | 600 | 1.4 | 0.06em | display |
| Button | 15px / 0.9375rem | 500 | 1 | 0.01em | display |
| Mono Value | 15px / 0.9375rem | 500 | 1.4 | 0.02em | mono |

**Thai-specific adjustments:**
- Thai text naturally sits taller due to vowel marks above/below. The generous line-heights (1.6–1.65 for body) accommodate this without clipping.
- Thai doesn't use letter-spacing, so `letter-spacing` values apply primarily to English text. Thai characters will use their natural spacing.
- `font-feature-settings: "kern" 1, "liga" 1;` for refined character relationships.

### 1.3 Font Weight Usage

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Body text, descriptions, popup content |
| 500 | Medium | Buttons, node labels, subtle emphasis |
| 600 | Semibold | Section titles, group names, active states |
| 700 | Bold | Hero title only — used sparingly for maximum impact |

> **Rule:** Never use Bold for anything smaller than 28px. It creates visual noise in Thai script.

---

## 2. Color Palette

### 2.1 Base Colors

```css
/* Backgrounds */
--bg-primary:      #FFFFFF;      /* Main background */
--bg-secondary:    #F5F5F7;      /* Alternate sections */
--bg-tertiary:     #FAFAFA;      /* Subtle card backgrounds */
--bg-elevated:     #FFFFFF;      /* Cards, popups (with shadow for depth) */

/* Text */
--text-primary:    #1D1D1F;      /* Headings, primary content */
--text-secondary:  #6E6E73;      /* Descriptions, secondary info */
--text-tertiary:   #AEAEB2;      /* Placeholders, disabled states */

/* Borders & Dividers */
--border-light:    #E8E8ED;      /* Card borders, dividers */
--border-subtle:   #F0F0F5;      /* Very subtle separators */
--border-focus:    #0071E3;      /* Focus rings */

/* Surfaces */
--surface-hover:   rgba(0, 0, 0, 0.03);   /* Hover background */
--surface-active:  rgba(0, 0, 0, 0.06);   /* Active/pressed background */
```

### 2.2 Accent Color

```css
--accent:          #0071E3;      /* Primary interactive — links, buttons, highlights */
--accent-hover:    #0077ED;      /* Hover state */
--accent-active:   #006ADB;      /* Active/pressed state */
--accent-light:    rgba(0, 113, 227, 0.08);  /* Subtle accent backgrounds */
```

### 2.3 Campaign Group Colors

Designed as a **gradient spectrum** — moving from neutral (Raw) through vitality (New) to urgency (Excavate). Each color has been selected to feel premium and work harmoniously together, not as random swatches.

#### Group 0: Raw — *"Unclassified Slate"*
```css
--group-0:         #8E8E93;      /* Primary — neutral, unprocessed */
--group-0-light:   #F2F2F4;      /* Card/node background */
--group-0-dark:    #636366;      /* Text on light background */
--group-0-glow:    rgba(142, 142, 147, 0.25);  /* Breathing/hover glow */
```

#### Group 1: New — *"Fresh Emerald"*
```css
--group-1:         #28A745;      /* Primary — fresh, beginning */
--group-1-light:   #EBF7EE;      /* Card/node background */
--group-1-dark:    #1E7E34;      /* Text on light background */
--group-1-glow:    rgba(40, 167, 69, 0.25);
```

#### Group 2: Relationship — *"Trust Sapphire"*
```css
--group-2:         #007AFF;      /* Primary — connection, trust, depth */
--group-2-light:   #E5F1FF;      /* Card/node background */
--group-2-dark:    #0055B3;      /* Text on light background */
--group-2-glow:    rgba(0, 122, 255, 0.25);
```

#### Group 3: Warm — *"Amber Signal"*
```css
--group-3:         #E8850C;      /* Primary — warmth, opportunity, attention */
--group-3-light:   #FEF3E2;      /* Card/node background */
--group-3-dark:    #A65E08;      /* Text on light background */
--group-3-glow:    rgba(232, 133, 12, 0.25);
```

#### Group 4: Cool — *"Dusk Indigo"*
```css
--group-4:         #5856D6;      /* Primary — cooling, fading, needs energy */
--group-4-light:   #EEEEF9;      /* Card/node background */
--group-4-dark:    #3634A3;      /* Text on light background */
--group-4-glow:    rgba(88, 86, 214, 0.25);
```

#### Group 5: Excavate — *"Deep Rose"*
```css
--group-5:         #D64045;      /* Primary — urgency, excavation, last chance */
--group-5-light:   #FDECEC;      /* Card/node background */
--group-5-dark:    #A8282D;      /* Text on light background */
--group-5-glow:    rgba(214, 64, 69, 0.25);
```

### 2.4 Glassmorphism Palette

```css
/* For popup cards, floating panels */
--glass-bg:        rgba(255, 255, 255, 0.72);
--glass-border:    rgba(255, 255, 255, 0.35);
--glass-blur:      20px;
--glass-shadow:    0 8px 32px rgba(0, 0, 0, 0.08),
                   0 2px 8px rgba(0, 0, 0, 0.04);

/* For overlay/backdrop when popup is open */
--overlay-bg:      rgba(0, 0, 0, 0.25);
--overlay-blur:    8px;

/* For node hover states — lighter glass */
--glass-node-bg:   rgba(255, 255, 255, 0.65);
--glass-node-hover: rgba(255, 255, 255, 0.85);
```

### 2.5 Semantic Colors

```css
--color-success:   #28A745;   /* Matches Group 1 — intentional cohesion */
--color-warning:   #E8850C;   /* Matches Group 3 */
--color-error:     #D64045;   /* Matches Group 5 */
--color-info:      #007AFF;   /* Matches Group 2 */
```

### 2.6 Color Usage on Alternate Backgrounds

On `--bg-secondary` (#F5F5F7):
- Card backgrounds become `#FFFFFF` (elevated feel with subtle shadow)
- Group light tints remain the same (they have enough contrast)
- Borders shift to `--border-light` for visibility
- Text colors remain unchanged

---

## 3. Spacing System

### 3.1 Base Scale

Using an **8px base unit** with a fluid scale. Generous by default — Apple-style breathing room.

```css
--space-1:    4px;     /* Micro — icon-to-label gaps */
--space-2:    8px;     /* Tight — inline element gaps */
--space-3:    12px;    /* Compact — related element groups */
--space-4:    16px;    /* Default — standard padding, gaps */
--space-5:    24px;    /* Comfortable — card padding, section gaps */
--space-6:    32px;    /* Roomy — between content blocks */
--space-7:    48px;    /* Generous — between major sections */
--space-8:    64px;    /* Expansive — section top/bottom padding */
--space-9:    96px;    /* Dramatic — hero section padding */
--space-10:   128px;   /* Maximum — page-level vertical rhythm */
```

### 3.2 Component Spacing

| Component | Padding | Gap (between children) |
|-----------|---------|----------------------|
| Page horizontal | 80px (sides) | — |
| Hero section | 128px top, 96px bottom | — |
| Content section | 96px vertical | — |
| Card (flowchart node) | 20px 24px | 8px |
| Popup modal | 32px 36px | 16px |
| Button | 12px 28px | 8px (icon + text) |
| Input field | 12px 16px | — |
| Tooltip | 10px 14px | 4px |
| Nav/header | 16px 80px | 32px (between items) |

### 3.3 Flowchart-Specific Spacing

| Element | Value |
|---------|-------|
| Vertical gap between node rows | 60px |
| Horizontal gap between sibling nodes | 40px |
| Decision branch spread angle | ~30° from center |
| Node min-width | 180px |
| Node max-width | 260px |
| Connection line thickness | 2px |
| Animated dot size | 4px |
| Dot travel gap | 20px |

### 3.4 Shadows (Elevation System)

```css
/* Level 0 — Flat (default state) */
--shadow-0:    none;

/* Level 1 — Subtle lift (cards, nodes at rest) */
--shadow-1:    0 1px 3px rgba(0, 0, 0, 0.04),
               0 1px 2px rgba(0, 0, 0, 0.06);

/* Level 2 — Hover state (nodes on hover) */
--shadow-2:    0 4px 12px rgba(0, 0, 0, 0.06),
               0 2px 4px rgba(0, 0, 0, 0.04);

/* Level 3 — Elevated (popups, active panels) */
--shadow-3:    0 8px 32px rgba(0, 0, 0, 0.08),
               0 2px 8px rgba(0, 0, 0, 0.04);

/* Level 4 — Floating (modal overlays) */
--shadow-4:    0 16px 48px rgba(0, 0, 0, 0.12),
               0 4px 16px rgba(0, 0, 0, 0.06);
```

### 3.5 Border Radius

```css
--radius-sm:    8px;     /* Small elements — tags, badges */
--radius-md:    12px;    /* Buttons, input fields */
--radius-lg:    16px;    /* Cards, nodes */
--radius-xl:    20px;    /* Popup modals, large panels */
--radius-full:  9999px;  /* Pills, circular elements */
```

---

## 4. Animation Timing

```css
/* Easing curves */
--ease-out:      cubic-bezier(0.25, 1, 0.5, 1);        /* Apple's signature smooth out */
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);    /* Bouncy popup entrance */
--ease-smooth:   cubic-bezier(0.4, 0, 0.2, 1);         /* Standard smooth */

/* Durations */
--duration-fast:    150ms;   /* Hover color changes, opacity toggles */
--duration-normal:  300ms;   /* Scale transforms, slide-ins */
--duration-slow:    500ms;   /* Section reveals, major transitions */
--duration-reveal:  800ms;   /* Scroll-triggered entrances */
```

---

## 5. Visual Identity Notes

### What makes this feel "Apple" without copying Apple:
1. **Restraint** — Every element earns its place. If removing something doesn't hurt, remove it.
2. **Precision** — Pixel-perfect alignment. No "close enough."
3. **Hierarchy through size, not decoration** — Big text is important. Small text is secondary. No underlines, no boxes around headings, no decorative borders.
4. **Color as signal** — Color means something (a group, an action, a state). It's never decorative.
5. **Motion as feedback** — Every animation responds to user action or reveals content. Nothing moves for the sake of moving.

### What makes this NOT a generic Apple clone:
1. **The group color spectrum** — A warm-to-cool emotional gradient that gives the analytical data a human quality.
2. **Glassmorphism on the flowchart** — Apple uses solid cards; we use glass nodes with visible depth.
3. **Living flowchart** — Breathing nodes, flowing particles. Apple's site is beautiful but static between scroll events. Ours breathes.
4. **Monospace accents** — Technical values (R, S, N, T) get a monospace treatment that Apple never uses. This signals "precision tool" alongside the premium feel.
