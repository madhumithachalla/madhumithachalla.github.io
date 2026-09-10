# Implementation Guide

> **Copyright (c) 2026 Madhumitha Challa. All rights reserved.**
> This document explains, in detail, how this portfolio site was designed and
> built — so the approach can be understood, learned from, and (with
> permission) adapted. See [`LICENSE`](./LICENSE) for the terms: you're
> welcome to read and learn from this, but copying or reproducing it
> (the code, the design, or this document) elsewhere requires asking first.

This is the "how it actually works" doc. If `README.md` is the quick-start,
this is the full build log — detailed enough that someone with basic web
dev knowledge could follow the same approach to build their own version
from scratch, without needing to reverse-engineer the minified thinking
behind each decision.

---

## 1. Philosophy

Three constraints shaped every decision here:

1. **No build step.** One `index.html` file — HTML, CSS, and JS all inline.
   No npm, no bundler, no framework. Anyone (including a non-developer)
   can open the file, find the text they want to change, and edit it
   directly, or hand the whole file to an AI coding assistant and ask for
   changes in plain English.
2. **No backend.** Every "form" (contact, coffee scheduling) either opens
   the visitor's own email client (`mailto:`) or hands off to a real
   third-party service (Calendly, Google Calendar). Nothing is submitted
   to or stored on any server this site owns — there's no server.
3. **Real content only.** Every number, project, and claim on the site
   traces back to something real and verifiable. No placeholder Lorem
   Ipsum, no invented metrics. Where a fact wasn't confirmed, the site
   says less rather than guessing.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Markup | Plain HTML5, single file | No build step needed |
| Styling | Plain CSS3 (custom properties, Grid, Flexbox) | No CSS framework — full control, zero dependency risk |
| Behavior | Vanilla JavaScript (ES6+, no framework) | No React/Vue overhead for what's fundamentally a static page with light interactivity |
| Fonts | Google Fonts CDN — Fraunces, Space Grotesk, IBM Plex Sans, IBM Plex Mono | Loaded via `<link>` in `<head>`, no local font files |
| Animation | `<canvas>` 2D API (meteor shower + starfield), CSS `@keyframes` (ticker, count-up via JS + CSS transitions) | Canvas for particle-style effects, CSS for everything else |
| Scheduling | Calendly inline widget (`widget.js` / `widget.css` from `assets.calendly.com`), Google Calendar Appointment Schedule (iframe) | Both are free tiers of real third-party scheduling products, not custom-built |
| Hosting | GitHub Pages (static hosting, free) | Matches the "no backend" constraint exactly |
| Resume delivery | Two static files (`.pdf`, `.docx`) linked directly, no base64 embedding | Keeps `index.html` lean and lets the resume be swapped independently |
| Sub-projects | Separate `projects` repo, each project in its own folder with its own README, some with standalone demo HTML files under `projects/demos/` | Keeps portfolio-site code separate from the actual project code it showcases |

No package.json, no `node_modules`, no CI/CD pipeline. `git push` to `main`
is the entire deploy process (GitHub Pages serves `main` directly).

---

## 3. File structure

```
madhumithachalla.github.io/
├── index.html                              # everything: markup, CSS, JS
├── README.md                                # quick-start / editing guide
├── IMPLEMENTATION.md                        # this file
├── LICENSE                                  # copyright terms
├── .nojekyll                                # disables GitHub's Jekyll processing
│                                             #   (needed so nested folders like
│                                             #    projects/demos/ serve as plain
│                                             #    static files, not Jekyll-parsed)
├── Madhumitha_Challa_Intern_Graduate.pdf    # resume, linked directly
├── Madhumitha_Challa_Intern_Graduate.docx   # resume, linked directly
└── projects/
    └── demos/
        ├── birdtag-demo.html                 # standalone interactive walkthroughs
        ├── esaver-demo.html                  #   (each is its own self-contained
        ├── ocr-demo.html                     #    HTML file, no shared build)
        ├── spotify-demo.html
        ├── spotify_data.js / spotify_sample.json
        └── ielts-band-lab/                   # the one real full app: a Vite +
            └── ...                           #   React build, output committed
                                                #   as static files so GitHub Pages
                                                #   can serve it with zero build step
```

The source code for each project card (BirdTag, ESaver, Spotify analysis,
OCR pipeline, IELTS tool, LinkedIn banner generator) lives in a **separate
repo** (`projects`), not in this one. `index.html` links out to it. This
keeps the portfolio site's own repo small and focused on the site itself.

---

## 4. Design system

### 4.1 Color tokens

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

### 4.2 Typography

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

### 4.3 Spacing & shape

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

## 5. Section-by-section breakdown

### 5.1 Header / nav (`<header class="nav">`)
Fixed-position bar with the name on the left, links on the right,
including a hover/click dropdown for Projects (desktop: `:hover`,
mobile: tap-to-toggle via JS, since `:hover` doesn't fire reliably on
touch). Mobile nav is a full-screen overlay — see §6.2 for the CSS
containing-block bug that had to be fixed here.

### 5.2 Hero (`<section class="hero">`)
- `<canvas id="meteor-canvas">` — ambient decorative animation (see §6.4).
- A **ticker strip above the hero name** (identity/goals-flavored words,
  scrolling right-to-left) and **another ticker below the stats strip**
  (achievement/personality-flavored words, scrolling left-to-right,
  reversed direction on purpose for visual variety) — two separate
  `.ticker` elements with different content, not one reused twice.
- Hero name, tagline, sub-line, CTA buttons (View projects / Resume PDF /
  Resume DOCX / Get in touch / View source).
- Circular portrait photo with a conic-gradient ring border, embedded as
  a base64 data URI directly in `<img src="data:image/jpeg;base64,...">`
  so there's no separate image file that could go missing in a preview
  context that can't see sibling files.
- **Stats strip** (`.stats-inner`) — four numbers that count up from
  zero via `requestAnimationFrame` once scrolled into view (see §6.3).

### 5.3 About (`#about`)
Two-column grid: prose on the left, a **fact-grid** of five icon tiles on
the right (location, nationality, education, focus area, languages) —
each tile is a small inline SVG icon (hand-drawn `<path>` data, no icon
library/font) plus a label, colored per the five-accent rotation. This
replaced an earlier plain vertical list of text rows, which read as
flat/monotonous.

### 5.4 Skills (`#skills`)
Four category groups (Enterprise Systems & Cloud, IT Operations & Service
Management, Infrastructure & Administration, Technical & Programming),
each a colored category header + a wrapped row of skill tiles. Each tile
shows the skill name **and a 5-segment dash meter** (`.skill-dashes`,
five `<span class="dash">` elements, filled ones get `.on`) indicating
how much that skill is actually used day-to-day — a deliberately
low-stakes "how often, not how expert" signal rather than a numeric
self-rating out of 10.

### 5.5 Experience (`#experience`)
A CSS Grid of **tiles** (`.exp-grid` → `.exp-tile`), two columns on
desktop collapsing to one on mobile, instead of a long single-column
vertical timeline. Each tile: a colored top border (5-accent rotation),
monospace date range, role, org, and a condensed 1–2 sentence summary
that keeps the real numbers (dollar figures, percentages, headcounts)
but drops secondary detail — this was a direct response to the original
version being "too much scroll" as a long vertical list.

### 5.6 "Right now" juggling grid (`#juggling`)
A compact 4-card grid of *current, ongoing* commitments (mentoring,
volunteer IT roles) — deliberately separate from the Experience section,
which is chronological history. Only side/volunteer commitments live
here; primary jobs/internships stay in Experience only, to avoid
duplicating the same role in two places.

### 5.7 Projects (`#projects`)
Repeating `.project` card pattern: pills (team size / solo, category),
title, role line, description, a bullet list of specifics, tech tags,
and a `.project-side` column with 2–3 quantified metrics plus links
("View source" → the `projects` repo folder on GitHub, and where a demo
exists, "Try live demo" / "Try interactive walkthrough" → a file under
`projects/demos/`). One card (`.project.upcoming`) uses a dashed border
and "Upcoming" pill for a planned-but-not-yet-built project, so it's
honestly labeled as not finished rather than pretending it exists.

### 5.8 Leadership (`#leadership`)
Three cards, each led by a large number (`.leader-metric`) — mentee
counts, volunteer hours — with role, org, and a short description below.

### 5.9 Recommendations (`#recs`)
Three testimonial cards, each a direct quote plus attribution (name,
role, relationship to the site owner). These are real quotes from real
people and are intentionally **not** rewritten/simplified the way the
rest of the site's prose is — someone else's words stay as they gave them.

### 5.10 Coffee / scheduling (`#coffee`)
Two-column: a `mailto:`-based contact form on the left (see §6.7), and a
tabbed scheduler on the right — **Calendly** tab (inline widget embed)
and **Google Calendar** tab (Appointment Schedule iframe, URL supplied
via a `GOOGLE_CALENDAR_LINK` constant near the top of that script block —
empty by default, falls back to a mailto link until set). See §6.6.

### 5.11 Footer (`<footer id="contact">`)
Two link groups side by side: a **"Jump to" nav** (repeats the header's
section anchors, so links exist at both the top and bottom of the page)
and a **contact-links list** (email, LinkedIn, GitHub, and the portfolio's
own URL — useful when the page is shared/printed and someone needs to
find their way back to the live version). Below that, a thin `.foot-bottom`
bar with location, a small aside (kept deliberately minor / de-emphasized
relative to the professional content above it), and a last-updated note.

### 5.12 Floating chat widget
A button (bottom-right) that opens a small panel with a static,
keyword-matched FAQ (see §6.8) — not a live AI backend, just a lookup
table, clearly labeled as such in its own fallback message so it never
pretends to be smarter than it is.

### 5.13 Ambient background
`<canvas id="starfield">`, `position:fixed`, `z-index:-1` — sits behind
the entire page (visible through any section without its own opaque
background), a quieter/slower version of the hero's meteor animation.

---

## 6. JavaScript features in detail

All JS lives in `<script>` tags near the end of `index.html`, organized
as a series of self-contained IIFEs (`(function(){ ... })();`) — each
one owns one feature and doesn't depend on the others, so any single
feature can be deleted or modified without breaking the rest.

### 6.1 Smooth scroll for internal links
Intercepts clicks on any `a[href^="#"]`, computes the target's position
minus the fixed header's height (so the header never overlaps the
target), and calls `window.scrollTo({ top, behavior: 'smooth' })`. Also
pushes the hash to browser history manually. Done in JS rather than
relying on native `scroll-behavior: smooth` + anchor links because some
sandboxed/embedded preview contexts block native hash navigation.

### 6.2 Mobile nav toggle
Click-based (not `:hover`-based, since hover doesn't fire on touch)
open/close for both the hamburger menu and the Projects dropdown inside
it. One subtle bug worth knowing about if you build something similar:
the mobile full-screen menu uses `position:fixed` with
`height:calc(100vh - 60px)`. An **earlier version** used `bottom:0`
instead of an explicit height, which broke because the header had
`backdrop-filter:blur(...)` on it — in CSS, applying `backdrop-filter`
(or `filter`, or `transform`) to an ancestor makes *that ancestor* the
containing block for any `position:fixed` descendant, instead of the
viewport. So `bottom:0` was resolving against the header's own ~60px
height, not the screen's, and the menu collapsed to a sliver. Fixed by
using an explicit calculated height instead of relying on `bottom:0`.

### 6.3 Hero stat count-up
Each `.stat-num` element carries `data-target`, and optionally
`data-prefix`, `data-suffix`, `data-decimals` attributes (e.g.
`data-target="700" data-prefix="$" data-suffix="K"` for "$700K"). An
`IntersectionObserver` watches `.stats-inner`; the first time it enters
the viewport, every stat animates from 0 to its target over 1.4s using
`requestAnimationFrame` with a cubic ease-out curve, then disconnects
(runs once, not on every scroll). Respects
`prefers-reduced-motion: reduce` by rendering the final value immediately
instead of animating.

### 6.4 Meteor shower (hero canvas)
A small particle system on `<canvas id="meteor-canvas">`: a handful of
line-segment "meteors" with fading trails, spawned on a loose interval,
animated via `requestAnimationFrame`. Purely decorative, `aria-hidden`.

### 6.5 Ambient starfield (background canvas)
A second, separate canvas (`#starfield`) — small static/slow-drifting
dots — sits behind the whole page at `z-index:-1`. Distinct from the
meteor canvas: this one is a full-page ambient layer, the meteors are
scoped to the hero only.

### 6.6 Coffee tab toggle + scheduler embeds
Two buttons (`#cal-tab-calendly`, `#cal-tab-gcal`) toggle `hidden` on two
wrapper divs. The Calendly tab holds a `<div class="calendly-inline-widget"
data-url="...">` — Calendly's own `widget.js` (loaded via `<script>` from
`assets.calendly.com`) finds that div and renders the booking UI into it
automatically; no custom Calendly integration code needed beyond that one
div and the two `<script>`/`<link>` tags in `<head>`. The Google Calendar
tab holds an `<iframe>` whose `src` is set from a `GOOGLE_CALENDAR_LINK`
JS constant — if that constant is empty (the default, until a real
Appointment Schedule link is supplied), the iframe stays hidden and a
fallback message with a mailto link shows instead.

### 6.7 Mailto-based forms
Both "Send a message" and the coffee scheduler's fallback build a
`mailto:` URL from the form fields (name, email, subject, message) with
everything pre-filled, then set `window.location.href` to it on submit —
this opens the visitor's own email client with a ready-to-send draft.
Nothing is transmitted to or stored by this site; there is no backend to
store it in.

### 6.8 Built-in FAQ chat assistant
A static array of `{ keys: [...], a: "..." }` objects. On sending a
message, the input text is lowercased and checked against each entry's
`keys` array (simple substring matching); the first match's answer is
shown. If nothing matches, a fallback message runs — which explicitly
says this is "a lightweight assistant built into this page (no live AI
backend)" rather than letting a visitor think they're talking to a real
model. No API calls, no cost, no external dependency.

### 6.9 Scroll-reveal for project cards
An `IntersectionObserver` adds a "revealed" class to project cards as
they scroll into view, paired with a CSS transition, for a subtle
fade/slide-in effect rather than everything being visible instantly on
page load.

### 6.10 Floating chat button visibility
The chat toggle button hides itself (and closes its panel if open)
whenever the coffee-scheduler section or the footer is on screen, since
both have their own form fields/links that the floating button would
otherwise visually cover on smaller screens.

---

## 7. Resume download system

Two plain files at the repo root, linked directly:

```html
<a class="btn btn-ghost" href="Madhumitha_Challa_Intern_Graduate.pdf"
   download="Madhumitha_Challa_Intern_Graduate.pdf">Resume (PDF)</a>
<a class="btn btn-ghost" href="Madhumitha_Challa_Intern_Graduate.docx"
   download="Madhumitha_Challa_Intern_Graduate.docx">Resume (DOCX)</a>
```

An earlier version embedded the resume as a giant base64 `data:` URI
directly in the `<a href>` — this bloated `index.html` by hundreds of KB
and, worse, `download` + `data:` URIs are handled inconsistently by
mobile browsers (some silently fail to actually save the file). Plain
file links fixed both problems and made updating the resume as simple as
overwriting two files with the same names.

---

## 8. Deployment

GitHub Pages, serving directly from the `main` branch root — no build
step, no Actions workflow. `.nojekyll` is required at the repo root so
GitHub doesn't run its default Jekyll processing over the repo (which
would otherwise ignore/mangle folders starting with underscores and
interfere with serving nested static demo files as-is).

```bash
git add .
git commit -m "..."
git push origin main
```
GitHub Pages picks up the new commit automatically, typically live
within a minute or two.

---

## 9. If you wanted to build something like this yourself

Roughly the order this was actually built in, if you're using this as a
reference for your own from-scratch build (with permission — see
`LICENSE`):

1. **Start with structure, not style.** Get every section's real content
   in as plain unstyled HTML first — hero, about, skills, experience,
   projects, contact. Placeholder-free: use your actual numbers and
   project names from day one, even if the copy is rough.
2. **Define the design tokens before writing component CSS.** Pick your
   color palette (and make sure the "different" colors are actually
   different hues, not shades of the same one), pick 2–4 typefaces with
   distinct jobs, decide on a border-radius personality (sharp vs. soft),
   and put all of it in `:root` custom properties before styling
   anything else.
3. **Build one card pattern and reuse it everywhere.** The
   "hairline border + colored top accent" pattern here is used for
   project cards, experience tiles, leadership cards, and fact-grid
   tiles — decide your one reusable card shape early and lean on it hard
   instead of inventing a new visual treatment per section.
4. **Add motion last, and make it skippable.** Canvas ambient animation,
   count-up numbers, scroll-reveal — none of these carry information, so
   they're the last layer added and every one respects
   `prefers-reduced-motion`.
5. **Never let a broken/misleading link ship.** Every "live demo" link
   and every "view source" link on this site points somewhere that
   actually works, checked with a real browser (Playwright, in this
   build's case) before shipping — not assumed to work because the code
   looks right.
6. **Keep a running README and a doc like this one.** Cheaper to write
   as you go than to reconstruct after the fact.

---

## 10. Known limitations / deliberately out of scope

- No CMS or data file — all content is hardcoded directly in `index.html`.
  Fine for a single-owner portfolio; wouldn't scale to a multi-author site.
- The FAQ chat widget is keyword-matching, not a real language model —
  by design, to keep the site free to run with zero backend cost.
- No automated tests. Verification is manual (visual review + Playwright
  screenshots during development), appropriate for a static single-page
  site, not a substitute for real test coverage on anything with actual
  business logic.
- Google Calendar integration requires the site owner to manually paste
  in a booking-page URL (`GOOGLE_CALENDAR_LINK`) — there's no OAuth flow,
  by design, since this is a static site with no backend to hold
  credentials securely.

---

## License reminder

This document, and the code/design it describes, are copyright Madhumitha
Challa. See [`LICENSE`](./LICENSE). You're welcome to read this and learn
from the approach — please ask first if you want to reuse or reproduce it.
