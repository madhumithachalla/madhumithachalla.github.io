# 3. Section-by-section breakdown

> **© 2026 Madhumitha Challa. All rights reserved.** Part of the portfolio
> build documentation — see [`../LICENSE`](../LICENSE) for reuse terms.

[← Back to docs index](./README.md)

## Header / nav (`<header class="nav">`)
Fixed-position bar with the name on the left, links on the right,
including a hover/click dropdown for Projects (desktop: `:hover`,
mobile: tap-to-toggle via JS, since `:hover` doesn't fire reliably on
touch). Mobile nav is a full-screen overlay — see the mobile nav toggle
section in [`04-javascript-features.md`](./04-javascript-features.md) for
the CSS containing-block bug that had to be fixed here.

## Hero (`<section class="hero">`)
- `<canvas id="meteor-canvas">` — ambient decorative animation.
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
  zero via `requestAnimationFrame` once scrolled into view.

## About (`#about`)
Two-column grid: prose on the left, a **fact-grid** of five icon tiles on
the right (location, nationality, education, focus area, languages) —
each tile is a small inline SVG icon (hand-drawn `<path>` data, no icon
library/font) plus a label, colored per the five-accent rotation. This
replaced an earlier plain vertical list of text rows, which read as
flat/monotonous.

## Skills (`#skills`)
Four category groups (Enterprise Systems & Cloud, IT Operations & Service
Management, Infrastructure & Administration, Technical & Programming),
each a colored category header + a wrapped row of skill tiles. Each tile
shows the skill name **and a 5-segment dash meter** (`.skill-dashes`,
five `<span class="dash">` elements, filled ones get `.on`) indicating
how much that skill is actually used day-to-day — a deliberately
low-stakes "how often, not how expert" signal rather than a numeric
self-rating out of 10.

## Experience (`#experience`)
A CSS Grid of **tiles** (`.exp-grid` → `.exp-tile`), two columns on
desktop collapsing to one on mobile, instead of a long single-column
vertical timeline. Each tile: a colored top border (5-accent rotation),
monospace date range, role, org, and a condensed 1–2 sentence summary
that keeps the real numbers (dollar figures, percentages, headcounts)
but drops secondary detail — this was a direct response to the original
version being "too much scroll" as a long vertical list.

## "Right now" juggling grid (`#juggling`)
A compact 4-card grid of *current, ongoing* commitments (mentoring,
volunteer IT roles) — deliberately separate from the Experience section,
which is chronological history. Only side/volunteer commitments live
here; primary jobs/internships stay in Experience only, to avoid
duplicating the same role in two places.

## Projects (`#projects`)
Repeating `.project` card pattern: pills (team size / solo, category),
title, role line, description, a bullet list of specifics, tech tags,
and a `.project-side` column with 2–3 quantified metrics plus links
("View source" → the `projects` repo folder on GitHub, and where a demo
exists, "Try live demo" / "Try interactive walkthrough" → a file under
`projects/demos/`). One card (`.project.upcoming`) uses a dashed border
and "Upcoming" pill for a planned-but-not-yet-built project, so it's
honestly labeled as not finished rather than pretending it exists.

## Leadership (`#leadership`)
Three cards, each led by a large number (`.leader-metric`) — mentee
counts, volunteer hours — with role, org, and a short description below.

## Recommendations (`#recs`)
Three testimonial cards, each a direct quote plus attribution (name,
role, relationship to the site owner). These are real quotes from real
people and are intentionally **not** rewritten/simplified the way the
rest of the site's prose is — someone else's words stay as they gave them.

## Coffee / scheduling (`#coffee`)
Two-column: a `mailto:`-based contact form on the left, and a
tabbed scheduler on the right — **Calendly** tab (inline widget embed)
and **Google Calendar** tab (Appointment Schedule iframe, URL supplied
via a `GOOGLE_CALENDAR_LINK` constant near the top of that script block —
empty by default, falls back to a mailto link until set). See the
scheduler section in
[`04-javascript-features.md`](./04-javascript-features.md).

## Footer (`<footer id="contact">`)
Two link groups side by side: a **"Jump to" nav** (repeats the header's
section anchors, so links exist at both the top and bottom of the page)
and a **contact-links list** (email, LinkedIn, GitHub, and the portfolio's
own URL — useful when the page is shared/printed and someone needs to
find their way back to the live version). Below that, a thin `.foot-bottom`
bar with location, a small aside (kept deliberately minor / de-emphasized
relative to the professional content above it), and a last-updated note.

## Floating chat widget
A button (bottom-right) that opens a small panel with a static,
keyword-matched FAQ — not a live AI backend, just a lookup table, clearly
labeled as such in its own fallback message so it never pretends to be
smarter than it is.

## Ambient background
`<canvas id="starfield">`, `position:fixed`, `z-index:-1` — sits behind
the entire page (visible through any section without its own opaque
background), a quieter/slower version of the hero's meteor animation.

---
[← Previous: Design system](./02-design-system.md) · [Back to docs index](./README.md) · [Next: JavaScript features →](./04-javascript-features.md)
