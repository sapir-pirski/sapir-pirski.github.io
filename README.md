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
  <img src="assets/projects/covers/technion-genai-recruitment-assistant.svg" width="540" alt="AI Recruitment Assistant cover with job documents, candidate chat, and interviews" />
  <img src="assets/projects/covers/bank-assistant.svg" width="540" alt="Bank Assistant cover with documents, retrieval, and cited answers" />
</p>

## What this portfolio highlights

- **LLM systems and agents** — RAG assistants, tool-using agents, RLHF, fine-tuning, and multimodal systems.
- **GPU engineering** — NVIDIA H100 inference, FP8 serving, CUDA Graphs, DDP, NCCL, and distributed training.
- **Evaluation and observability** — Ragas, SWE-bench, MLflow, Langfuse, Prometheus, and Grafana.
- **Applied machine learning** — NLP, text classification, genomic triage, and domain-specific applications.

## Experience

- Automatically loads current public repositories through the GitHub REST API.
- Applies curated project titles, artwork, categories, and five relevant skill tags per card.
- Provides category filtering for LLMs, GPU infrastructure, RAG/evaluation, ML/NLP, and applications.
- Uses a shared 16:9 SVG cover system with a short title and three-stage project visual.
- Keeps detailed project artwork in an accessible Details dialog with full-size image links.
- Displays current GitHub stars, repository update dates, and independent repository links.
- Supports responsive phone, tablet, and desktop layouts.
- Includes accessible light and dark themes with saved user preference.
- Gives covers, Details buttons, star counts, and repository links independent keyboard-accessible actions.

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

The site is intentionally build-free. Repository metadata stays current, while presentation details remain curated in the JSON catalog inside [`index.html`](index.html). Card rendering and dialogs live in [`portfolio.js`](portfolio.js).

## Run locally

```bash
git clone https://github.com/sapir-pirski/sapir-pirski.github.io.git
cd sapir-pirski.github.io
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Project structure

```text
.
├── assets/
│   ├── projects/       # SVG covers and detailed project artwork
│   ├── fonts/          # Variable fonts and licenses
│   ├── screenshots/    # README previews
│   └── github-avatar.png
├── favicon.svg
├── index.html          # Page structure and curated project catalog
├── portfolio.js        # Cards, GitHub metadata, filters, and Details dialog
├── scripts/
│   └── generate-covers.py # Rebuild the SVG cover assets
├── styles.css          # Layout, themes, cards, and responsive behavior
└── README.md
```

## Updating project covers

Edit the JSON catalog in `index.html`, then regenerate the covers:

```bash
python3 scripts/generate-covers.py
```

The generator uses only the Python standard library. Existing detailed artwork stays available through each card’s Details panel.

## Deployment

The `main` branch is published directly with GitHub Pages. No framework build, package installation, or deployment service is required.

---

<div align="center">
  Built by <a href="https://github.com/sapir-pirski">Sapir Pirski</a>.
</div>
