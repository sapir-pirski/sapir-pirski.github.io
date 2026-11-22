const projectCatalog = JSON.parse(document.querySelector('#project-catalog').textContent);
const grid = document.querySelector('#project-grid');
const empty = document.querySelector('#empty');
const detailsDialog = document.querySelector('#project-details');
const detailsContent = document.querySelector('#details-content');
const themeToggle = document.querySelector('#theme-toggle');
const dateFormatter = new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric', year:'numeric', timeZone:'UTC'});
const numberFormatter = new Intl.NumberFormat('en-US');
const hiddenProjects = new Set(['nlp-sequence-modeling','ecommerce-llm-eval-pipeline','customer-churn-ml-analysis']);
const starIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.5-4.4 6.3-.9z"/></svg>';
let projects = [];
let filter = 'All';

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
  if (repository.name === 'technion-genai-recruitment-assistant') return 'LLM & Agents';
  const text = `${repository.name} ${repository.description || ''}`.toLowerCase();
  if (/h100|gpu|cuda|ddp|distributed|quantization|vllm|nebius/.test(text)) return 'GPU & Infra';
  if (/rag|evaluation|eval|financebench|judge|benchmark/.test(text)) return 'RAG & Eval';
  if (/agent|llm|gpt|assistant|finetun|attention|repository-summarizer/.test(text)) return 'LLM & Agents';
  if (/nlp|pytorch|churn|vision|language|classification|sequence/.test(text)) return 'ML & NLP';
  return 'Apps';
}

function presentationFor(project) {
  const slug = project.name === 'fate' ? 'fate-solana-games' : project.name;
  const curated = projectCatalog[slug];
  return {
    title: curated?.title || project.name,
    summary: curated?.summary || project.description || 'A public engineering project by Sapir Pirski.',
    skills: curated?.skills || [],
    cover: `assets/projects/covers/${curated ? slug : 'project'}.svg`,
    detailImage: curated?.detailImage || '',
  };
}

function starLink(project, title) {
  const available = Number.isInteger(project.stargazers_count) && project.stargazers_count >= 0;
  const count = available ? numberFormatter.format(project.stargazers_count) : '—';
  const label = available ? `${title}: ${count} GitHub ${project.stargazers_count === 1 ? 'star' : 'stars'}` : `${title}: GitHub star count unavailable`;
  return `<a class="repo-stars" href="${escapeHtml(project.html_url)}/stargazers" target="_blank" rel="noreferrer" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${starIcon}<span>${count}</span></a>`;
}

function updatedDate(project) {
  const date = new Date(project.updated_at || '');
  if (Number.isNaN(date.valueOf())) return '<span class="card-updated">Update date unavailable</span>';
  return `<span class="card-updated">Updated <time datetime="${date.toISOString()}" title="${escapeHtml(date.toUTCString())}">${dateFormatter.format(date)}</time></span>`;
}

function skillList(skills, extraClass = '') {
  return skills.length ? `<ul class="skill-list ${extraClass}" aria-label="Technologies">${skills.map(skill => `<li>${escapeHtml(skill)}</li>`).join('')}</ul>` : '';
}

function render() {
  const visible = projects.filter(project => filter === 'All' || project.category === filter);
  grid.innerHTML = visible.map((project, index) => {
    const {title, summary, skills, cover} = presentationFor(project);
    return `<article class="project-card" aria-labelledby="project-${project.id}">
      <button class="card-visual" type="button" data-project-details="${project.id}" aria-label="View ${escapeHtml(title)} details">
        <img src="${cover}" alt="" width="1440" height="810" loading="${index < 2 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'auto'}" decoding="async">
      </button>
      <div class="card-content">
        <div class="card-meta"><span class="card-category">${escapeHtml(project.category)}</span>${starLink(project, title)}</div>
        <h3 id="project-${project.id}"><a href="${escapeHtml(project.html_url)}" target="_blank" rel="noreferrer">${escapeHtml(title)}</a></h3>
        <p class="card-summary">${escapeHtml(summary)}</p>
        ${skillList(skills)}
        <div class="card-footer">${updatedDate(project)}<div class="card-actions"><button type="button" data-project-details="${project.id}" aria-label="View ${escapeHtml(title)} details">Details</button><a href="${escapeHtml(project.html_url)}" target="_blank" rel="noreferrer" aria-label="View ${escapeHtml(title)} on GitHub">GitHub</a></div></div>
      </div>
    </article>`;
  }).join('');
  empty.hidden = visible.length > 0;
  document.querySelector('#project-count').textContent = projects.length;
}

function openDetails(project) {
  const {title, summary, skills, detailImage} = presentationFor(project);
  detailsContent.innerHTML = `<div class="detail-kicker"><span class="card-category">${escapeHtml(project.category)}</span>${starLink(project, title)}</div>
    <h2 id="detail-title">${escapeHtml(title)}</h2>
    <p id="detail-summary">${escapeHtml(summary)}</p>
    ${skillList(skills, 'detail-skills')}
    ${detailImage ? `<figure class="detail-figure"><a href="${detailImage}" target="_blank" rel="noreferrer" aria-label="Open full-size ${escapeHtml(title)} project visual"><img src="${detailImage}" alt="Detailed project visual for ${escapeHtml(title)}" decoding="async"></a><figcaption><a href="${detailImage}" target="_blank" rel="noreferrer">Open full-size project visual</a></figcaption></figure>` : ''}
    <div class="detail-footer">${updatedDate(project)}<a class="repository-link" href="${escapeHtml(project.html_url)}" target="_blank" rel="noreferrer">View GitHub repository</a></div>`;
  document.body.classList.add('details-open');
  detailsDialog.showModal();
}

grid.addEventListener('click', event => {
  const trigger = event.target.closest('[data-project-details]');
  if (!trigger) return;
  const project = projects.find(project => String(project.id) === trigger.dataset.projectDetails);
  if (project) openDetails(project);
});
document.querySelector('#details-close').addEventListener('click', () => detailsDialog.close());
detailsDialog.addEventListener('click', event => {
  if (event.target === detailsDialog) detailsDialog.close();
});
detailsDialog.addEventListener('close', () => {
  document.body.classList.remove('details-open');
  detailsContent.replaceChildren();
});

document.querySelectorAll('.filters button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach(option => {
      const selected = option === button;
      option.classList.toggle('active', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
    filter = button.dataset.filter;
    render();
  });
});

fetch('https://api.github.com/users/sapir-pirski/repos?per_page=100&sort=updated&direction=desc')
  .then(response => {
    if (!response.ok) throw new Error('Repository metadata unavailable');
    return response.json();
  })
  .then(data => {
    projects = data.filter(project => !project.fork && !project.archived && project.name !== 'sapir-pirski.github.io' && !hiddenProjects.has(project.name))
      .map(project => ({...project, category:categoryFor(project)}))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    render();
  })
  .catch(() => {
    grid.innerHTML = '<p class="loading">Projects are temporarily unavailable. <a href="https://github.com/sapir-pirski">View them on GitHub</a></p>';
  });
