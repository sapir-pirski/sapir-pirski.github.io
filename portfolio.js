const projectCatalog = JSON.parse(document.querySelector('#project-catalog').textContent);
const grid = document.querySelector('#project-grid');
const empty = document.querySelector('#empty');
const themeToggle = document.querySelector('#theme-toggle');
const searchInput = document.querySelector('#project-search');
const clearSearchButton = document.querySelector('#clear-search');
const resultCount = document.querySelector('#project-results');
const filterButtons = Array.from(document.querySelectorAll('.filters button'));
const viewButtons = Array.from(document.querySelectorAll('.view-toggle button'));
const numberFormatter = new Intl.NumberFormat('en-US');
const hiddenProjects = new Set(['nlp-sequence-modeling','ecommerce-llm-eval-pipeline','customer-churn-ml-analysis']);
const starIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.5-4.4 6.3-.9z"/></svg>';
let projects = [];
let filter = 'All';
let projectsLoaded = false;
let projectView = 'grid';
try {
  if (localStorage.getItem('portfolio-view') === 'compact') projectView = 'compact';
} catch {}

function syncProjectView() {
  grid.dataset.view = projectView;
  viewButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.view === projectView));
  });
}
syncProjectView();
viewButtons.forEach(button => {
  button.addEventListener('click', () => {
    projectView = button.dataset.view === 'compact' ? 'compact' : 'grid';
    syncProjectView();
    try { localStorage.setItem('portfolio-view', projectView); } catch {}
  });
});

function escapeHtml(value = '') {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
}

function syncThemeButton() {
  const label = document.documentElement.dataset.theme === 'dark' ? 'Use light theme' : 'Use dark theme';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.setAttribute('title', label);
}
syncThemeButton();
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('portfolio-theme', next); } catch {}
  syncThemeButton();
});

function categoryFor(repository) {
  const curatedCategory = catalogEntry(repository)?.category;
  if (curatedCategory) return curatedCategory;
  const text = `${repository.name} ${repository.description || ''}`.toLowerCase();
  if (/rag|evaluation|eval|financebench|judge|benchmark/.test(text)) return 'RAG & Eval';
  if (/agent|assistant|copilot/.test(text)) return 'LLM & Agents';
  if (/h100|gpu|cuda|ddp|distributed|quantization|vllm/.test(text)) return 'GPU & Infra';
  if (/llm|gpt|finetun|attention|repository-summarizer/.test(text)) return 'LLM & Agents';
  if (/nlp|pytorch|churn|vision|language|classification|sequence/.test(text)) return 'ML & NLP';
  return 'Apps';
}

function catalogEntry(project) {
  const slug = project.name === 'fate' ? 'fate-solana-games' : project.name;
  return projectCatalog[slug];
}

function presentationFor(project) {
  const curated = catalogEntry(project);
  return {
    title: curated?.title || project.name,
    summary: curated?.summary || project.description || 'A public engineering project by Sapir Pirski.',
    skills: curated?.skills || [],
    cover: curated?.coverImage || curated?.detailImage || 'assets/projects/covers/project.svg',
    coverTitle: curated?.titleOverlay ? curated.coverTitle : [],
  };
}

function starCount(project, title) {
  const available = Number.isInteger(project.stargazers_count) && project.stargazers_count >= 0;
  const count = available ? numberFormatter.format(project.stargazers_count) : '—';
  const label = available ? `${title}: ${count} GitHub ${project.stargazers_count === 1 ? 'star' : 'stars'}` : `${title}: GitHub star count unavailable`;
  return `<a class="repo-stars" href="${escapeHtml(project.html_url)}/stargazers" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${starIcon}<span aria-hidden="true">${count}</span></a>`;
}

function technologyStack(skills) {
  return `<div class="card-stack">
    ${skills.length ? `<ul class="skill-list" aria-label="Project technology stack">${skills.map(skill => `<li>${escapeHtml(skill)}</li>`).join('')}</ul>` : ''}
  </div>`;
}

function normalizedText(value) {
  return String(value).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function searchableText(project) {
  const {title, summary, skills} = presentationFor(project);
  return normalizedText([title, summary, ...skills].join(' '));
}

function updateFilterSelection() {
  filterButtons.forEach(button => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function render() {
  clearSearchButton.hidden = searchInput.value.length === 0;
  if (!projectsLoaded) return;
  const terms = normalizedText(searchInput.value).split(' ').filter(Boolean);
  const matching = projects.filter(project => terms.every(term => project.searchText.includes(term)));
  const visible = matching.filter(project => filter === 'All' || project.category === filter);
  filterButtons.forEach(button => {
    const count = matching.filter(project => button.dataset.filter === 'All' || project.category === button.dataset.filter).length;
    button.querySelector('.filter-count').textContent = numberFormatter.format(count);
    button.setAttribute('aria-label', `${button.dataset.filter}, ${count} ${count === 1 ? 'project' : 'projects'}`);
  });
  grid.innerHTML = visible.map((project, index) => {
    const {title, summary, skills, cover, coverTitle} = presentationFor(project);
    return `<article class="project-card" aria-labelledby="project-${project.id}">
      <div class="card-visual">
        <img src="${escapeHtml(cover)}" alt="" width="1440" height="810" loading="${index < 2 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'auto'}" decoding="async">
        ${coverTitle.length ? `<div class="cover-heading" aria-hidden="true">${coverTitle.map(line => `<span>${escapeHtml(line)}</span>`).join('')}</div>` : ''}
      </div>
      <div class="card-content">
        <div class="card-meta"><div class="card-meta-labels"><span class="card-category">${escapeHtml(project.category)}</span><span class="repo-language" data-language="${escapeHtml(project.language || '')}" title="Primary repository language reported by GitHub">${escapeHtml(project.language || 'Not reported')}</span></div>${starCount(project, title)}</div>
        <h3 id="project-${project.id}"><a href="${escapeHtml(project.html_url)}">${escapeHtml(title)}</a></h3>
        <p class="card-summary">${escapeHtml(summary)}</p>
        ${technologyStack(skills)}
      </div>
    </article>`;
  }).join('');
  empty.hidden = visible.length > 0;
  empty.textContent = projects.length ? 'No projects match. Try another search or category.' : 'No public projects to show yet.';
  const message = `${visible.length} of ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`;
  if (resultCount.textContent !== message) resultCount.textContent = message;
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filter = filter === button.dataset.filter ? 'All' : button.dataset.filter;
    updateFilterSelection();
    render();
  });
});

searchInput.addEventListener('input', render);
function clearSearch() {
  searchInput.value = '';
  render();
  searchInput.focus();
}
clearSearchButton.addEventListener('click', clearSearch);
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Escape' && searchInput.value) {
    event.preventDefault();
    clearSearch();
  }
});

fetch('https://api.github.com/users/sapir-pirski/repos?per_page=100&sort=updated&direction=desc')
  .then(response => {
    if (!response.ok) throw new Error('Repository metadata unavailable');
    return response.json();
  })
  .then(data => {
    projects = data.filter(project => !project.fork && !project.archived && project.name !== 'sapir-pirski.github.io' && !hiddenProjects.has(project.name))
      .map(project => ({...project, category:categoryFor(project), searchText:searchableText(project)}))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    projectsLoaded = true;
    render();
  })
  .catch(() => {
    resultCount.textContent = 'Projects unavailable';
    searchInput.disabled = true;
    filterButtons.forEach(button => { button.disabled = true; });
    clearSearchButton.hidden = true;
    grid.innerHTML = '<p class="loading">Projects are temporarily unavailable. <a href="https://github.com/sapir-pirski">View them on GitHub</a></p>';
  });
