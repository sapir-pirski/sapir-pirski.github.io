<div align="center">
  <img src="assets/github-avatar.png" width="88" height="88" alt="Sapir Pirski" />

  # Sapir Pirski — AI Engineer Portfolio

  **LLM engineering · GPU systems · RAG · evaluation · AI agents**

  A fast, responsive portfolio that turns public GitHub repositories into a curated visual showcase of production-minded AI and machine-learning work.

  [![Live portfolio](https://img.shields.io/badge/Live_Portfolio-0969DA?style=for-the-badge&logo=githubpages&logoColor=white)](https://sapir-pirski.github.io/)
  [![GitHub Pages](https://img.shields.io/badge/Hosted_on-GitHub_Pages-22272E?style=for-the-badge&logo=github&logoColor=white)](https://pages.github.com/)
  ![Responsive](https://img.shields.io/badge/UI-Responsive-1F883D?style=for-the-badge)
  ![Dark mode](https://img.shields.io/badge/Theme-Light_%2F_Dark-8250DF?style=for-the-badge)

  [View portfolio](https://sapir-pirski.github.io/) · [GitHub profile](https://github.com/sapir-pirski) · [LinkedIn](https://www.linkedin.com/in/sapir-pirski)
</div>

## Cover preview

<p align="center">
  <img src="assets/projects/covers/ai-recruitment-assistant-illustrated.webp" width="540" alt="Colorful recruitment illustration with candidate chat, job documents, and an interview calendar; the live card adds its title in HTML" />
  <img src="assets/projects/covers/bank-assistant-illustrated.webp" width="540" alt="Colorful banking policy illustration with documents, a conversation, linked sources, and a vault; the live card adds its title in HTML" />
</p>

## What this portfolio highlights

- **LLM systems and agents** — RAG assistants, tool-using agents, RLHF, fine-tuning, and multimodal systems.
- **GPU engineering** — NVIDIA H100 inference, FP8 serving, CUDA Graphs, DDP, NCCL, and distributed training.
- **Evaluation and observability** — Ragas, SWE-bench, MLflow, Langfuse, Prometheus, and Grafana.
- **Applied machine learning** — NLP, text classification, genomic triage, and domain-specific applications.

## Experience

- Starts directly with a clear introduction and project explorer, followed by a brief engineering approach, LinkedIn contact actions, and a portrait in the footer.
- Automatically loads current public repositories through the GitHub REST API.
- Applies curated project titles, artwork, categories, and five repository-backed skill tags per card. Implementation evidence, confirmed LinkedIn name matches, and related skills are documented separately in [docs/linkedin-skills.json](docs/linkedin-skills.json); an unconfirmed LinkedIn match never changes the technology displayed.
- Searches project titles, descriptions, and technology stacks, combined with category filtering.
- Shows category counts and a search clear control; filtered result counts are announced to screen readers without a visible status line.
- Offers Grid and Compact views with a saved visitor preference; first-time visitors see the illustrated grid.
- Curates categories by project purpose for LLMs, GPU infrastructure, RAG/evaluation, ML/NLP, and applications.
- Uses consistent 16:9 frames with colorful project artwork on dark backgrounds.
- Gives every curated project its own text-free 3D illustration and a crisp two-line white/teal HTML title.
- Displays current GitHub stars and orders projects by their latest repository update.
- Separates the GitHub-reported repository language from the curated project technology stack.
- Supports responsive phone, tablet, and desktop layouts.
- Includes accessible light and dark themes with saved user preference.
- Links project titles to their GitHub repositories and star counts to their stargazers pages, in the current tab.
- Keeps covers static and cards compact, ending with technology tags without a footer divider, date, or GitHub button.

## Technology

| Layer | Tools |
| --- | --- |
| Structure | Semantic HTML5 |
| Styling | Modern CSS, responsive grid, CSS custom properties |
| Client logic | Vanilla JavaScript |
| Project data | GitHub REST API |
| Typography | Locally served Geist Sans and JetBrains Mono |
| Hosting | GitHub Pages |

## How it works

```text
GitHub REST API
      │
      ▼
Public repository metadata
      │
      ├── Category rules
      ├── Curated titles
      ├── Project artwork
      └── Skill mappings
      │
      ▼
Responsive portfolio cards
```

The site is intentionally build-free. Repository metadata stays current, while presentation details remain curated in the JSON catalog inside [`index.html`](index.html). Card rendering lives in [`portfolio.js`](portfolio.js).

Each catalog entry has an explicit `category`; this overrides the fallback rules for uncatalogued repositories. Search matches every entered word across the displayed title, summary, and stack. Category badges count all search matches before the category filter is applied, while the screen reader status compares visible cards with the full project collection. Last updated, newest first remains the display order for every search and category.

The Grid / Compact toggle changes the layout of the same cards without resetting search, categories, or ordering. Compact rows show a thumbnail, linked title, category, linked stars, readable summary, and technology stack. The chosen view is saved locally as `portfolio-view`; switching continues to work when browser storage is unavailable.

## Run locally

```bash
git clone https://github.com/sapir-pirski/sapir-pirski.github.io.git
cd sapir-pirski.github.io
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

Run the browsing and navigation checks with Node's built-in test runner (no dependencies required):

```bash
node --test tests/portfolio.test.cjs
```

## Project structure

```text
.
├── assets/
│   ├── projects/       # Original artwork, optimized covers, and generation prompts
│   ├── fonts/          # Variable fonts and licenses
│   ├── screenshots/    # README previews
│   └── github-avatar.png
├── favicon.svg
├── index.html          # Page structure and curated project catalog
├── portfolio.js        # Cards, GitHub metadata, and filters
├── scripts/
│   └── generate-covers.py # Legacy SVG cover generator
├── styles.css          # Layout, themes, cards, and responsive behavior
├── tests/portfolio.test.cjs # Search, category, metadata, and navigation checks
└── README.md
```

## Updating project covers

Edit the JSON catalog in `index.html`. `coverImage` selects the card image and falls back to the retained original `detailImage`. Prefer optimized WebP assets; preserve the original artwork. Covers fill a 16:9 frame.

For illustrations with a clean title area, set `titleOverlay` to `true` and supply two `coverTitle` lines. The title is rendered in HTML, white on the first line and teal on the second. Generate artwork without text and reserve the upper third for that heading.

All 19 illustrated covers were created with the built-in image generation tool and optimized to 1440 × 810 WebP files. The [Recruitment Assistant prompt](assets/projects/prompts/recruitment-illustration.txt) and [prompt set for the other 18 covers](assets/projects/prompts/illustrated-covers.json) are retained with their asset paths. The approved Recruitment illustration is the style reference for the set. Original artwork and the legacy SVG generator are retained but are not used for the curated project covers.

## Deployment

The `main` branch is published directly with GitHub Pages. No framework build, package installation, or deployment service is required.

---

<div align="center">
  Built by <a href="https://github.com/sapir-pirski">Sapir Pirski</a>.
</div>
