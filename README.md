# Portfolio — Madhumitha Challa

A single-file, no-build-step portfolio site. Everything (HTML, CSS, JS) lives in `index.html`, so it's easy to edit yourself or hand to any AI coding tool.

**Live:** [madhumithachalla.github.io](https://madhumithachalla.github.io)
**Full build documentation:** see [`IMPLEMENTATION.md`](./IMPLEMENTATION.md) for a detailed breakdown of the design system, every section, and how each feature works.
**License:** see [`LICENSE`](./LICENSE) — public to view, not licensed for reuse without permission.

## Tech stack

| Layer | Choice |
|---|---|
| Markup | Plain HTML5, single file, no build step |
| Styling | Plain CSS3 (custom properties, Grid, Flexbox) — no framework |
| Behavior | Vanilla JavaScript, no framework |
| Fonts | Google Fonts CDN — Fraunces, Space Grotesk, IBM Plex Sans, IBM Plex Mono |
| Animation | Canvas 2D (meteor shower + starfield), CSS keyframes, `requestAnimationFrame` count-up |
| Scheduling | Calendly inline widget + Google Calendar Appointment Schedule (iframe) |
| Hosting | GitHub Pages, static, no CI/CD |

Full rationale for each choice is in `IMPLEMENTATION.md`.

## What's implemented

- Responsive, mobile-first layout (nav, hero, all sections tested down to ~390px width)
- Dynamic hero stats that count up on scroll into view (respects `prefers-reduced-motion`)
- Dual ticker strips (above the hero name and below the stats), each with different content, scrolling opposite directions
- About section as an icon fact-grid instead of a plain list
- Skills section with per-skill 5-segment "how much I use it" dash meters, grouped by category
- Experience section as a 2-column tile grid (not a long vertical list) with condensed, numbers-first summaries
- Projects section with real GitHub source links and working live demos/interactive walkthroughs for every project that has one
- Leadership, recommendations (real testimonials), and a "right now" grid of current side commitments
- Coffee/scheduling section with a working Calendly tab (real availability, real event types) and a Google Calendar tab (wired up once a real Appointment Schedule link is supplied)
- Resume available as both PDF and DOCX, linked as plain files (not base64-embedded)
- Built-in FAQ chat widget (static keyword matching, clearly labeled as not a live AI backend)
- Ambient canvas animations (hero meteor shower, full-page starfield), both decorative and `prefers-reduced-motion`-aware
- Footer with both a "jump to section" nav and contact links (including this site's own URL), so navigation exists at both the top and bottom of the page

## About the `/projects` folder

Each project card links to a downloadable code file, in a separate `projects` repo:

- **BirdTag & ESaver** (team projects) — these are *representative reconstructions* of the specific piece I personally built, written fresh rather than copied from the team submission. Monash has strict academic integrity policies on group assignments, and I don't want real assignment code circulating where future students could find it.
- **Spotify analysis, the OCR pipeline, the IELTS practice tool, and the LinkedIn banner generator** (solo projects) — real source, not reconstructions. The IELTS tool is a full Vite + React app; the LinkedIn banner generator is plain HTML/CSS rendered to a PNG via Playwright.

## Resume

Two plain files at the repo root — `Madhumitha_Challa_Intern_Graduate.pdf` and `Madhumitha_Challa_Intern_Graduate.docx` — are linked directly from the hero buttons (no base64 embedding). To update the resume, just replace both files, keeping the same names, and the download links keep working automatically.

## Running it locally

No install needed — just open `index.html` in a browser. Or, for a local server (recommended so relative links behave):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying for free on GitHub Pages

1. Create a new repo on GitHub (e.g. `portfolio` or `yourname.github.io`).
2. Push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source → Deploy from branch → main → / (root)**.
4. Your site goes live at `https://YOUR-USERNAME.github.io/YOUR-REPO/` (or `https://YOUR-USERNAME.github.io/` if the repo is named `YOUR-USERNAME.github.io`).

## Editing later

Everything is in one file on purpose — no build tools, no dependencies beyond four Google Fonts loaded via CDN. To change:

- **Colors/fonts** — edit the CSS custom properties on `:root` at the top of the `<style>` block (`--coral`, `--amber`, `--teal`, `--violet`, `--green`, etc.).
- **Content** — text lives directly in the HTML; search for the relevant heading to find it.
- **Add a project** — copy one `<div class="project">...</div>` block and edit it.
- **Add an experience entry** — copy one `<div class="exp-tile">...</div>` block inside `.exp-grid`.
- **Stats strip** — edit the `data-target` / `data-prefix` / `data-suffix` attributes on `.stat-num` elements.
- **Skill proficiency** — edit how many `<span class="dash on">` vs `<span class="dash">` each `.skill-item` has (5 total).

See `IMPLEMENTATION.md` for the full breakdown of how each section and script works before making structural changes.

You can also just paste this whole file into Claude (or any AI tool) and ask for changes in plain English — it's structured so that works cleanly.
