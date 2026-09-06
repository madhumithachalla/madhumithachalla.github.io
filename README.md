# Portfolio — Madhumitha Challa

A single-file, no-build-step portfolio site. Everything (HTML, CSS, JS) lives in `index.html`, so it's easy to edit yourself or hand to any AI coding tool.

## About the `/projects` folder

Each project card now links to a downloadable code file:

- **BirdTag & ESaver** (team projects) — these are *representative reconstructions* of the specific piece I personally built, written fresh rather than copied from the team submission. I did this deliberately: Monash has strict academic integrity policies on group assignments, and I don't want real assignment code circulating where future students could find it. If you want the exact wording/scope tightened further, just ask.
- **Spotify analysis, the OCR pipeline, and the IELTS practice tool** (solo projects) — the IELTS tool's `.jsx` is your actual real source file. The Spotify/OCR scripts are realistic placeholders matching the description on the site; swap in your real `.R` and `.py` files (same filenames) whenever you're ready, and the download links will just work.

## Resume

Two plain files at the repo root — `Madhumitha_Challa_Intern_Graduate.pdf` and `Madhumitha_Challa_Intern_Graduate.docx` — are linked directly from the hero buttons (no base64 embedding). To update the resume, just replace both files, keeping the same names, and the download links keep working automatically.

## Before you publish

**Read through every project description once** and confirm it still matches how you'd describe your own contribution — especially BirdTag and ESaver, since those are team projects. Nothing in here quotes or paraphrases assignment briefs; it's all written as "what I built," but you know the details better than I do.

Your photo is already embedded directly inside `index.html` (as a base64 data URI), so there's no separate `photo.jpg` file to manage — it'll always display correctly, including in previews that can't see sibling files. If you ever want to swap the photo, just ask and I'll re-embed a new one.

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

Everything is in one file on purpose — no build tools, no dependencies beyond two Google Fonts loaded via CDN. To change:

- **Colors/fonts** — edit the CSS variables at the top of the `<style>` block (`--paper`, `--ink`, `--amber`, `--teal`).
- **Content** — text lives directly in the HTML; search for the relevant heading to find it.
- **Add a project** — copy one `<div class="project">...</div>` block and edit it.
- **Stats strip / hero terminal lines** — edit the numbers in the `.stats-inner` block, or the `lines` array near the bottom `<script>` for the typing terminal.

You can also just paste this whole file into Claude (or any AI tool) and ask for changes in plain English — it's structured so that works cleanly.
