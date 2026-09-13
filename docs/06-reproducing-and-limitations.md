# 6. If you wanted to build something like this yourself, and what's out of scope

> **© 2026 Madhumitha Challa. All rights reserved.** Part of the portfolio
> build documentation — see [`../LICENSE`](../LICENSE) for reuse terms. This
> page in particular is a step-by-step "how you'd do it" guide — reading it
> and applying the same *approach* to your own original content is fine;
> copying this site's actual code, text, or design is not, without asking
> first.

[← Back to docs index](./README.md)

## If you wanted to build something like this yourself

Roughly the order this was actually built in, if you're using this as a
reference for your own from-scratch build (with permission — see
[`../LICENSE`](../LICENSE)):

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

## Known limitations / deliberately out of scope

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
- `mailto:`-based forms depend entirely on the visitor's device having a
  default email client configured — there is no code-level fix for a
  visitor whose device has none.

---
[← Previous: Resume & deployment](./05-resume-and-deployment.md) · [Back to docs index](./README.md)
