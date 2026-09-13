# 1. Philosophy, tech stack, and file structure

> **© 2026 Madhumitha Challa. All rights reserved.** Part of the portfolio
> build documentation — see [`../LICENSE`](../LICENSE) for reuse terms.

[← Back to docs index](./README.md)

## Philosophy

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

## Tech stack

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

## File structure

```
madhumithachalla.github.io/
├── index.html                              # everything: markup, CSS, JS
├── README.md                                # quick-start / editing guide
├── LICENSE                                  # copyright terms
├── docs/                                    # this folder — detailed build docs
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
[← Back to docs index](./README.md) · [Next: Design system →](./02-design-system.md)
