# 5. Resume download system and deployment

> **© 2026 Madhumitha Challa. All rights reserved.** Part of the portfolio
> build documentation — see [`../LICENSE`](../LICENSE) for reuse terms.

[← Back to docs index](./README.md)

## Resume download system

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

## Deployment

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
[← Previous: JavaScript features](./04-javascript-features.md) · [Back to docs index](./README.md) · [Next: Reproducing this & limitations →](./06-reproducing-and-limitations.md)
