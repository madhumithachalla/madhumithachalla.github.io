# 4. JavaScript features in detail

> **© 2026 Madhumitha Challa. All rights reserved.** Part of the portfolio
> build documentation — see [`../LICENSE`](../LICENSE) for reuse terms.

[← Back to docs index](./README.md)

All JS lives in `<script>` tags near the end of `index.html`, organized
as a series of self-contained IIFEs (`(function(){ ... })();`) — each
one owns one feature and doesn't depend on the others, so any single
feature can be deleted or modified without breaking the rest.

## Smooth scroll for internal links
Intercepts clicks on any `a[href^="#"]`, computes the target's position
minus the fixed header's height (so the header never overlaps the
target), and calls `window.scrollTo({ top, behavior: 'smooth' })`. Also
pushes the hash to browser history manually. Done in JS rather than
relying on native `scroll-behavior: smooth` + anchor links because some
sandboxed/embedded preview contexts block native hash navigation.

## Mobile nav toggle
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

## Hero stat count-up
Each `.stat-num` element carries `data-target`, and optionally
`data-prefix`, `data-suffix`, `data-decimals` attributes (e.g.
`data-target="700" data-prefix="$" data-suffix="K"` for "$700K"). An
`IntersectionObserver` watches `.stats-inner`; the first time it enters
the viewport, every stat animates from 0 to its target over 1.4s using
`requestAnimationFrame` with a cubic ease-out curve, then disconnects
(runs once, not on every scroll). Respects
`prefers-reduced-motion: reduce` by rendering the final value immediately
instead of animating.

## Meteor shower (hero canvas)
A small particle system on `<canvas id="meteor-canvas">`: a handful of
line-segment "meteors" with fading trails, spawned on a loose interval,
animated via `requestAnimationFrame`. Purely decorative, `aria-hidden`.

## Ambient starfield (background canvas)
A second, separate canvas (`#starfield`) — small static/slow-drifting
dots — sits behind the whole page at `z-index:-1`. Distinct from the
meteor canvas: this one is a full-page ambient layer, the meteors are
scoped to the hero only.

## Coffee tab toggle + scheduler embeds
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

**Important limitation:** `mailto:` links only work if the visitor's
device/browser has a default email client configured. There's no way for
site JS to detect or fix this — it's a platform limitation, not a bug in
the code. If a "click to email" link seems to do nothing, that's almost
always the visitor's device having no mail app set as default, not
broken code.

## Mailto-based forms
Both "Send a message" and the coffee scheduler's fallback build a
`mailto:` URL from the form fields (name, email, subject, message) with
everything pre-filled, then set `window.location.href` to it on submit —
this opens the visitor's own email client with a ready-to-send draft.
Nothing is transmitted to or stored by this site; there is no backend to
store it in.

## Built-in FAQ chat assistant
A static array of `{ keys: [...], a: "..." }` objects. On sending a
message, the input text is lowercased and checked against each entry's
`keys` array (simple substring matching); the first match's answer is
shown. If nothing matches, a fallback message runs — which explicitly
says this is "a lightweight assistant built into this page (no live AI
backend)" rather than letting a visitor think they're talking to a real
model. No API calls, no cost, no external dependency.

## Scroll-reveal for project cards
An `IntersectionObserver` adds a "revealed" class to project cards as
they scroll into view, paired with a CSS transition, for a subtle
fade/slide-in effect rather than everything being visible instantly on
page load.

## Floating chat button visibility
The chat toggle button hides itself (and closes its panel if open)
whenever the coffee-scheduler section or the footer is on screen, since
both have their own form fields/links that the floating button would
otherwise visually cover on smaller screens.

---
[← Previous: Sections](./03-sections.md) · [Back to docs index](./README.md) · [Next: Resume & deployment →](./05-resume-and-deployment.md)
