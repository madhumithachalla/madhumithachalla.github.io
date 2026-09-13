# 2. Design system

> **© 2026 Madhumitha Challa. All rights reserved.** Part of the portfolio
> build documentation — see [`../LICENSE`](../LICENSE) for reuse terms.

[← Back to docs index](./README.md)

## Color tokens

Defined once as CSS custom properties on `:root`, referenced everywhere
else via `var(--name)` — change a value here and it propagates site-wide:

```css
:root{
  --paper:#F3EEFA;       /* off-white text on dark backgrounds */
  --bg:#100D18;           /* page background, near-black violet */
  --bg-panel:#1C1729;     /* slightly lighter panel background (cards, footer) */
  --ink:#1B1130;          /* dark text-on-light contexts */
  --ink-soft:#C7BEDB;     /* softened body text */
  --coral:#FF6F5E;        /* accent 1 */
  --amber:#F5A623;        /* accent 2 */
  --teal:#2DD4BF;         /* accent 3 */
  --violet:#9B7EDE;       /* accent 4 */
  --green:#4ADE80;        /* accent 5 */
  --slate:#9E90B8;        /* muted labels/metadata */
  --line:rgba(255,255,255,0.14);  /* hairline borders */
  --line-dark:#4A3968;
  --radius:2px;           /* intentionally sharp corners, not rounded */
  --maxw:1080px;           /* page content max-width */
}
```

The five accents (coral/amber/teal/violet/green) are used deliberately
in **rotation**, not randomly — any place there's a repeated grid of
items (skill categories, experience tiles, leadership cards, About's
fact-grid) cycles through all five via `:nth-child()` selectors, so nothing
reads as monochrome. This was a direct fix for an earlier version of the
site where "coral," "amber," and "teal" were accidentally all shades of
the same violet hue — worth watching for if you reuse this pattern.

## Typography

Four typefaces, each with a specific job — never mixed arbitrarily:

- **Fraunces** (serif, display) — the hero name, section headings, nav
  logotype. Used at heavy weights (600–800) for the "this is a real
  human, not a template" feel.
- **Space Grotesk** — secondary display font, paired with Fraunces in a
  couple of spots (hero name font stack fallback).
- **IBM Plex Sans** — all body text and UI labels.
- **IBM Plex Mono** — anything meant to read as "data" or "system output":
  timestamps, stat numbers, tags/pills, the ticker, nav-bar links. This
  is a deliberate visual metaphor (a systems/cloud engineer's portfolio
  should look a little like a terminal here and there).

## Spacing & shape

- `--radius: 2px` — nearly-square corners everywhere, not the soft
  16px-rounded-corner look common in generic templates. It's a small
  detail but it's part of what keeps the site from reading as an
  AI-template default.
- Section vertical rhythm: `section{padding: 76px 0;}` as the baseline,
  with a few sections overriding it for tighter/looser spacing.
- Card patterns (project cards, experience tiles, leadership cards,
  fact-grid tiles) all use a thin `1px solid var(--line)` border plus a
  **colored top border** (2–3px, cycling through the five accents) — this
  one visual idea (hairline border + colored top accent) is reused across
  five or six different components so the whole page feels like one
  system instead of five different UI kits stapled together.

---
[← Previous: Philosophy & stack](./01-philosophy-and-stack.md) · [Back to docs index](./README.md) · [Next: Sections →](./03-sections.md)
