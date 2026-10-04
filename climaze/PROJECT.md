# CliMaze Food Planner

**Prevent food waste before it exists. Read the batch, not just the date.**

Food businesses rotate perishables by the date on the label. Two crates with the same date can have very different lives left if one sat in a warm loading bay. CliMaze combines **Madhumitha Challa's demand and stock planning** for retail, hospitality and food production with **Abhishek's temperature-history Expiry Twin**. Every batch is planned against its *real* remaining quality, so stock gets used, sold or donated before it becomes landfill methane.

COP31 "Build for 2035" priority: **Zero Waste & Methane Reduction**.

## Why it matters

- Food loss and waste produces an estimated **8–10 % of global greenhouse-gas emissions**; households, food service and retail wasted about **1.05 billion tonnes** of food in 2022 ([UNEP Food Waste Index Report 2024](https://www.unep.org/resources/publication/food-waste-index-report-2024)).
- Landfilled food decays into **methane**. The [Global Methane Pledge](https://www.globalmethanepledge.org/) targets a 30 % cut from 2020 levels by 2030, and Australia's [National Food Waste Strategy](https://www.dcceew.gov.au/environment/protection/waste/food-waste) aims to halve food waste by 2030.
- Each kilogram of food sent to landfill is counted at **2.1 kg CO₂-e** in the [Australian National Greenhouse Accounts Factors 2023](https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-account-factors-2023.pdf). CliMaze uses this as its default, and you can edit it.

## What's new in this version

| Feature | What it does |
|---|---|
| **Climate lens** | Compares kg *at risk of waste* under ordinary receipt-order rotation with the best freshness-aware option, and converts the difference to modelled CO₂-e using the cited landfill factor. In the demo: **24 kg → 0 kg, ≈ 50 kg CO₂-e**. Recorded discards show their landfill-equivalent emissions. |
| **Rescue ladder** | For each at-risk batch, picks the next best action from the food recovery hierarchy: **Prevent** (use first / mark down) → **Feed people** (donate if collection time fits) → **Check** (inspect) → **Recover** (compost or anaerobic digestion, never landfill). One click prefills a proposal, and staff approval is still required. |
| **Freshness curve + what-if** | The Expiry Twin draws each batch's quality curve from its sensor history, against "now" and the date limit. A slider asks *what if it is stored at X °C from now?* and updates the window live. |
| **Waste-risk scenarios** | Ordinary rotation, freshness-first, markdown and transfer are ranked by kg at risk before the next use, and the lowest is highlighted. |
| **Guided demo** | A six-step in-app tour (▶ Guided demo) tells the story for judges in about two minutes. |

## How it maps to the judging criteria

| Criterion | Weight | Where to look |
|---|---|---|
| COP31 alignment | 30 % | Zero Waste & Methane priority. Climate lens with a cited national emissions factor. Food recovery hierarchy. Modelled vs recorded impact kept strictly separate (no greenwashing). |
| Build quality | 30 % | Dependency-free ES modules. Pure, tested domain core (`core.js`). 36 unit/UI tests plus a real-browser end-to-end journey. GitHub Actions CI. Schema-validated backups with migration. Formula-safe CSV. Escaped HTML. Stale-approval guards. Responsive down to 390 px. |
| Creativity | 20 % | Freshness-aware planning that couples a temperature digital twin to demand, a what-if cold-chain slider, and hierarchy-ranked rescue actions in one workflow. |
| Presentation | 20 % | Guided demo, a [two-minute pitch script](docs/DEMO.md), and screenshots. Every number on screen says whether it is modelled or recorded. |

## Try it live

**https://madhumithachalla.github.io/CliMaze/**

Nothing to install. It works in any modern browser, on desktop or phone.

1. Open the link and press **▶ Guided demo** (top right). Six steps walk you through the product in about two minutes.
2. Or explore on your own:
   - **Overview:** the Climate lens (waste at risk and CO₂-e) and the Rescue ladder (next best actions).
   - **Expiry Twin:** pick ST-B and drag the "What if it is stored at…" slider.
   - **Actions & approvals:** compare scenarios, then propose and approve an action.
   - **Outcomes & evidence:** record what actually happened.
3. All data is synthetic demo data stored only in your browser. To start over, go to **Project & backup → Model clock and demo reset**.

The site redeploys automatically on every push to `main` (`.github/workflows/pages.yml`).

## Run locally

Requirements: Python 3 for the static server and Node.js 20+ for tests. No npm install, API key or build step is needed.

```bash
npm start            # = python3 -m http.server 8080 --directory dist
# open http://localhost:8080 and press "▶ Guided demo"
npm test             # 36 unit + UI tests
```

Optional real-browser check (needs Playwright: `npm install --no-save playwright && npx playwright install chromium`):

```bash
npm start &          # in one terminal
npm run e2e          # guided demo, what-if, prefill → approve → outcome, phone layout
```

On Windows, `py -m http.server 8080 --directory dist` also works. Serve over HTTP; double-clicking `index.html` will not load the ES modules.

## The full workflow

1. **Overview**: the Climate lens and Rescue ladder show today's risk and the next best actions.
2. **Batch inventory**: receive batches, search, and place or release holds.
3. **Expiry Twin**: temperature history → effective age (Q10 = 2) → remaining window, freshness curve and what-if storage.
4. **Demand forecast**: seven-day observed-day baseline, or covers/output units × kg per unit ÷ yield.
5. **Stock planner**: earliest-quality-first allocation, eligible carryover, confirmed inbound and replenishment.
6. **Actions & approvals**: waste-risk scenarios, then propose an action and have a reviewer approve it against current data.
7. **Outcomes & evidence**: record what actually happened, with a reference. Export to CSV.
8. **Project & backup**: idea credits, epics, JSON backup/restore, model clock and audit trail.

## Honest boundaries

This is a complete local demonstration, not a production retailer service. The synthetic model clock is 4 October 2026, 06:00 UTC. There is no live sensor feed, and data lives in one browser (export JSON to move it). Q10 parameters and quality windows are illustrative and unvalidated. Demand is a transparent average or user input, not trained ML. The CO₂-e figures are **modelled** from scenario differences and an editable landfill factor. They assume the at-risk stock would otherwise be landfilled, and are not verified reductions. Recorded sales, use and donations never receive an avoided-emissions credit, and transfers are not counted as consumed. Production gates are listed in [docs/EPICS.md](docs/EPICS.md).

## File map

- `dist/index.html`, `dist/styles.css`: app shell and responsive design.
- `dist/core.js`: pure calculations: quality and what-if, curve, plan, scenarios with at-risk, rescue ladder, climate impact, validation.
- `dist/app.js`: screens, Climate lens, freshness chart, guided demo, forms, storage and import/export.
- `dist/PROJECT.md`: downloadable in-app handover (copy of this README).
- `tests/core.test.mjs`, `tests/ui-smoke.test.mjs`: domain and UI tests (`npm test`).
- `e2e/journey.mjs`: real-browser journey (`npm run e2e`).
- `.github/workflows/test.yml`: CI for unit and browser tests.
- `docs/`: [requirements](docs/REQUIREMENTS.md), [architecture](docs/ARCHITECTURE.md), [epics and owners](docs/EPICS.md), [demo script](docs/DEMO.md), [idea provenance](docs/IDEAS.md), [validation record](docs/VALIDATION.md), screenshots.
- `.openai/hosting.json`: existing Site identity. Do not reuse it to create a different hosted project.

## Team and credits

Madhumitha Challa: food-business demand and stock planning. Abhishek: Smart Cold-Chain Expiry Twin. Proposed delivery owners for each epic, including Shyam, Vijayaraja and Nithilan, are in [docs/EPICS.md](docs/EPICS.md). Vijay's separate Rot Clock idea is preserved in [docs/IDEAS.md](docs/IDEAS.md).
