# Automatic project tiles

The existing GitHub Pages publishing setup stays the same: `main`, repository
root. `portfolio-sync.js` runs on portfolio visits and adds tiles for new public
repositories and new project folders in the public `projects` repository. There
is no scheduled Codex task, build service, token, or manual portfolio edit needed
for a new public personal project. Subsequent visits recheck GitHub, so new work,
metadata changes, removals and exclusions take effect on the next successful load.

Handwritten cards remain primary, including the already curated academic
reconstructions. Discovery never duplicates them or automatically adds coursework.
Stuplying (Career Launch) has an explicitly approved handwritten tile. It links
only to the public app; its source stays private. No private repositories are
enumerated or read. Other private repositories require their own explicit approval
and a handwritten public summary before they can be featured.

## New standalone repository

Create a **public**, nonempty repository with a README. The next portfolio visit
discovers it automatically, using its name, description, homepage and GitHub link.
Forks, archived/disabled repositories, empty placeholders, and the portfolio and
collection repositories themselves are skipped. All public repository-list pages
are checked, not just the first 100 repositories.

For a polished title, description, demo and category filters, add `portfolio.json`
at the repository root:

```json
{
  "kind": "personal",
  "title": "My project",
  "description": "One short public description of what it does.",
  "demo": "https://example.com/",
  "categories": ["web", "automation"]
}
```

`kind` accepts `personal`, `professional`, or `competition`. Categories accept
`cloud`, `mobile`, `web`, `data`, `automation`, `design`, and `team`. Demo links
must use HTTPS without embedded credentials. Invalid demo URLs fall back to a
source-only tile. Text is rendered as text, never as HTML.

## New folder in `projects`

Add a top-level folder with a `README.md`. It appears automatically with a source
link. Put the same optional `portfolio.json` inside that folder for a custom title,
description, demo and categories. The repository's default branch is discovered
automatically. Hidden folders and infrastructure folders (`docs`, `assets`,
`images`, `tests`, `scripts`, `node_modules`) are skipped. A folder without a README
or valid metadata is not treated as a project.

## Academic and other exclusions

Keep original coursework in private repositories. Public-only discovery cannot
read them. To explicitly exclude a public repository or collection folder, add:

```json
{ "kind": "academic", "exclude": true }
```

For standalone repositories, GitHub topics `academic`, `coursework`, `assignment`,
`homework`, `university-project`, or `portfolio-exclude` also exclude them. Academic
markers in the name, description, README or metadata exclude a candidate even if
its metadata claims it is personal. BirdTag, ESaver, CloudPose and Spotify analysis
are explicitly excluded from automatic discovery. Existing handwritten showcases
of those projects are intentionally separate from discovery and are unchanged.

Classification cannot infer undisclosed coursework. Keep academic projects private
and/or mark them explicitly rather than depending on wording detection alone.
Only public project descriptions, demo links and source links belong in metadata.
Never add application records, resume contents, credentials, or coursework to it.

## Failure behavior and checks

Unauthenticated GitHub API requests are subject to GitHub's public rate limit.
Unavailable metadata, invalid JSON, or a failed classification request omit that
candidate. One failed project does not block others. If GitHub is unavailable,
handwritten cards (including Stuplying) still work. There is no stale persistent
cache that could resurrect a removed or newly excluded project. This is discovery
on a visit, not a background publisher; GitHub availability determines when a new
automatic tile first appears. No repository visibility is changed by this code.

Run `node --test tests/portfolio-sync.test.cjs` locally. Serve the root with a local
HTTP server to check rendering, mobile layout, and the project category filters.
