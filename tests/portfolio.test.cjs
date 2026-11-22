const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'portfolio.js'), 'utf8');
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const catalog = JSON.parse(page.match(/<script id="project-catalog" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const categories = ['All', 'LLM & Agents', 'GPU & Infra', 'RAG & Eval', 'ML & NLP', 'Apps'];

function element() {
  return {
    innerHTML:'', textContent:'', value:'', hidden:false, disabled:false,
    attributes:{}, dataset:{}, listeners:{},
    classList:{toggle() {}},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, callback) { this.listeners[name] = callback; },
    emit(name, event = {}) { this.listeners[name]?.(event); },
    focus() { this.focused = true; },
  };
}

function repository(id, name, date, extra = {}) {
  return {id, name, updated_at:date, language:'Python', html_url:`https://github.com/sapir-pirski/${name}`, stargazers_count:0, ...extra};
}

const repositories = [
  repository(6, 'pytorch-optimization-project', '2026-05-06T10:00:00Z', {language:'Jupyter Notebook'}),
  repository(2, 'customer-service-agent', '2026-05-30T10:00:00Z', {description:'LangGraph agent on Nebius GPUs', stargazers_count:4}),
  repository(4, 'financebench-rag-evaluation', '2026-06-17T10:00:00Z', {language:'Jupyter Notebook'}),
  repository(3, 'skipper-30-quiz', '2026-11-08T10:00:00Z'),
  repository(7, 'h100-fp8-quantization-benchmark', '2026-07-18T10:00:00Z'),
  repository(5, 'bank-assistant', '2026-07-01T10:00:00Z'),
  repository(1, 'technion-genai-recruitment-assistant', '2026-11-22T10:00:00Z'),
  repository(12, 'unlisted-web-app', '2026-10-02T10:00:00Z', {description:'Simple café dashboard', language:null, stargazers_count:null}),
  repository(8, 'forked-project', '2026-11-22T11:00:00Z', {fork:true}),
  repository(9, 'archived-project', '2026-11-22T11:00:00Z', {archived:true}),
  repository(10, 'sapir-pirski.github.io', '2026-11-22T11:00:00Z'),
  repository(11, 'nlp-sequence-modeling', '2026-11-22T11:00:00Z'),
];

async function load(data = repositories, ok = true, options = {}) {
  const selectors = ['#project-grid', '#empty', '#theme-toggle', '#project-search', '#clear-search', '#reset-projects', '#project-results', '#project-count'];
  const elements = Object.fromEntries(selectors.map(selector => [selector, element()]));
  elements['#project-catalog'] = {textContent:JSON.stringify(catalog)};
  elements['#project-grid'].innerHTML = '<p>Loading projects from GitHub…</p>';
  elements['#empty'].hidden = true;
  const buttons = categories.map(category => {
    const button = element();
    button.dataset.filter = category;
    button.count = {textContent:'—'};
    button.querySelector = selector => {
      assert.equal(selector, '.filter-count');
      return button.count;
    };
    return button;
  });
  const viewButtons = ['grid', 'compact'].map(view => {
    const button = element();
    button.dataset.view = view;
    return button;
  });
  const storage = options.storage || new Map();
  let requestCount = 0;
  const context = vm.createContext({
    document:{
      documentElement:{dataset:{theme:'dark'}},
      querySelector(selector) {
        assert(selector in elements, `Unexpected element: ${selector}`);
        return elements[selector];
      },
      querySelectorAll(selector) {
        if (selector === '.filters button') return buttons;
        assert.equal(selector, '.view-toggle button');
        return viewButtons;
      },
    },
    Intl,
    localStorage:options.blockStorage ? {
      getItem() { throw new Error('Storage blocked'); },
      setItem() { throw new Error('Storage blocked'); },
    } : {
      getItem:key => storage.get(key) ?? null,
      setItem:(key, value) => storage.set(key, value),
    },
    fetch:async () => { requestCount++; return {ok, json:async () => data}; },
  });
  vm.runInContext(source, context);
  await new Promise(setImmediate);
  const grid = elements['#project-grid'];
  return {
    elements, buttons, viewButtons, context, grid, storage,
    requests:() => requestCount,
    selectView(view) { viewButtons.find(button => button.dataset.view === view).emit('click'); },
    ids:() => [...grid.innerHTML.matchAll(/aria-labelledby="project-(\d+)"/g)].map(match => Number(match[1])),
    search(value) {
      elements['#project-search'].value = value;
      elements['#project-search'].emit('input');
    },
    select(category) { buttons.find(button => button.dataset.filter === category).emit('click'); },
    counts:() => Object.fromEntries(buttons.map(button => [button.dataset.filter, button.count.textContent])),
  };
}

test('default collection excludes hidden repositories and stays newest first', async () => {
  const app = await load();
  assert.deepEqual(app.ids(), [1, 3, 12, 7, 5, 4, 2, 6]);
  assert.equal(app.elements['#project-results'].textContent, '8 of 8 projects');
  assert.deepEqual(app.counts(), {'All':'8', 'LLM & Agents':'2', 'GPU & Infra':'1', 'RAG & Eval':'2', 'ML & NLP':'1', 'Apps':'2'});
});

test('view switching preserves search, category, counts, order and independent links', async () => {
  const app = await load();
  assert.equal(app.grid.dataset.view, 'grid');
  assert.equal(app.viewButtons[0].attributes['aria-pressed'], 'true');
  app.select('LLM & Agents');
  app.search('LangGraph');
  const markup = app.grid.innerHTML;
  const counts = app.counts();
  app.selectView('compact');
  assert.equal(app.grid.dataset.view, 'compact');
  assert.equal(app.viewButtons[1].attributes['aria-pressed'], 'true');
  assert.equal(app.viewButtons[0].attributes['aria-pressed'], 'false');
  assert.equal(app.grid.innerHTML, markup);
  assert.deepEqual(app.ids(), [1, 2]);
  assert.deepEqual(app.counts(), counts);
  assert.equal(app.elements['#project-results'].textContent, '2 of 8 projects');
  assert.equal(app.requests(), 1);
  app.elements['#reset-projects'].emit('click');
  assert.equal(app.grid.dataset.view, 'compact');
  assert.deepEqual(app.ids(), [1, 3, 12, 7, 5, 4, 2, 6]);
  app.selectView('grid');
  assert.equal(app.grid.dataset.view, 'grid');
  assert.equal(app.storage.get('portfolio-view'), 'grid');
});

test('view preference persists across page loads, with grid as the default', async () => {
  const storage = new Map();
  const first = await load(repositories, true, {storage});
  first.selectView('compact');
  assert.equal(storage.get('portfolio-view'), 'compact');
  const returning = await load(repositories, true, {storage});
  assert.equal(returning.grid.dataset.view, 'compact');
  assert.equal(returning.viewButtons[1].attributes['aria-pressed'], 'true');
  const invalid = await load(repositories, true, {storage:new Map([['portfolio-view', 'unknown']])});
  assert.equal(invalid.grid.dataset.view, 'grid');
});

test('blocked storage does not prevent view switching or searching', async () => {
  const app = await load(repositories, true, {blockStorage:true});
  assert.equal(app.grid.dataset.view, 'grid');
  app.selectView('compact');
  assert.equal(app.grid.dataset.view, 'compact');
  app.search('React');
  assert.deepEqual(app.ids(), [3]);
  assert.equal(app.elements['#project-results'].textContent, '1 of 8 projects');
});

test('search spans displayed titles, descriptions and stack, ignoring case and extra whitespace', async () => {
  const app = await load();
  for (const [query, expected] of [
    [' RECRUITMENT   streamlit ', [1]],
    ['seamanship', [3]],
    ['React TypeScript', [3]],
    ['PDFs LangGraph', [1]],
    ['PyTorch SST-2', [6]],
    ['cafe', [12]],
  ]) {
    app.search(query);
    assert.deepEqual(app.ids(), expected, query);
  }
  app.search('   ');
  assert.deepEqual(app.ids(), [1, 3, 12, 7, 5, 4, 2, 6]);
});

test('search and category intersect; facet counts reflect all search matches', async () => {
  const app = await load();
  app.select('RAG & Eval');
  assert.deepEqual(app.ids(), [5, 4]);
  app.search('LangGraph');
  assert.deepEqual(app.ids(), []);
  assert.equal(app.elements['#project-results'].textContent, '0 of 8 projects');
  assert.equal(app.elements['#empty'].hidden, false);
  assert.equal(app.counts()['LLM & Agents'], '2');
  assert.equal(app.counts()['RAG & Eval'], '0');
  app.select('LLM & Agents');
  assert.deepEqual(app.ids(), [1, 2]);
  assert.equal(app.elements['#project-results'].textContent, '2 of 8 projects');
  assert.equal(app.buttons[1].attributes['aria-pressed'], 'true');
  assert.equal(app.buttons[1].attributes['aria-label'], 'LLM & Agents, 2 projects');
});

test('clear retains the category, reset clears both, and Escape clears search', async () => {
  const app = await load();
  app.select('LLM & Agents');
  app.search('Recruitment');
  assert.deepEqual(app.ids(), [1]);
  assert.equal(app.elements['#clear-search'].hidden, false);
  app.elements['#clear-search'].emit('click');
  assert.deepEqual(app.ids(), [1, 2]);
  assert.equal(app.elements['#clear-search'].hidden, true);
  app.elements['#reset-projects'].emit('click');
  assert.equal(app.ids().length, 8);
  assert.equal(app.buttons[0].attributes['aria-pressed'], 'true');
  assert.equal(app.elements['#reset-projects'].hidden, true);
  app.search('not-a-matching-project');
  let prevented = false;
  app.elements['#project-search'].emit('keydown', {key:'Escape', preventDefault() { prevented = true; }});
  assert.equal(prevented, true);
  assert.equal(app.ids().length, 8);
  assert.equal(app.elements['#project-search'].focused, true);
});

test('purpose categories override hosting words, including known and future agents', async () => {
  const app = await load();
  for (const project of Object.values(catalog)) assert(categories.slice(1).includes(project.category));
  assert.equal(vm.runInContext('categoryFor({name:"customer-service-agent",description:"Nebius GPU"})', app.context), 'LLM & Agents');
  assert.equal(vm.runInContext('categoryFor({name:"nebius-serverless-genomic-triage"})', app.context), 'Apps');
  assert.equal(vm.runInContext('categoryFor({name:"future-support-agent",description:"Runs on Nebius H100"})', app.context), 'LLM & Agents');
  assert.equal(vm.runInContext('categoryFor({name:"simple-app",description:"Hosted on Nebius"})', app.context), 'Apps');
  assert.equal(vm.runInContext('categoryFor({name:"fate"})', app.context), 'Apps');
});

test('GitHub language is separate from stack; title/star links and footer removal survive filtering', async () => {
  const app = await load();
  app.search('React');
  assert.match(app.grid.innerHTML, /GitHub language: <strong>Python<\/strong>/);
  assert.match(app.grid.innerHTML, /Project stack/);
  assert.match(app.grid.innerHTML, /<li>TypeScript<\/li>/);
  assert.match(app.grid.innerHTML, /<li>React<\/li>/);
  app.search('');
  const cards = [...app.grid.innerHTML.matchAll(/<article\b[\s\S]*?<\/article>/g)].map(match => match[0]);
  for (const card of cards) {
    const title = card.match(/<h3[^>]*><a href="([^"]+)">/);
    const stars = card.match(/<a class="repo-stars" href="([^"]+)"/);
    assert.equal(stars[1], `${title[1]}/stargazers`);
    assert.equal((card.match(/<a\b/g) || []).length, 2);
    assert.doesNotMatch(card, /card-footer|<time|data-project-details|target=/);
  }
  assert.match(app.grid.innerHTML, /GitHub star count unavailable/);
  assert.match(app.grid.innerHTML, /GitHub language: <strong>Not reported<\/strong>/);
});

test('API errors do not report zero projects, while a real empty collection does', async () => {
  const failed = await load([], false);
  assert.equal(failed.elements['#project-results'].textContent, 'Projects unavailable');
  assert.equal(failed.elements['#project-search'].disabled, true);
  assert(failed.buttons.every(button => button.disabled));
  assert.match(failed.grid.innerHTML, /View them on GitHub/);
  assert.equal(failed.elements['#project-count'].textContent, '');
  const empty = await load([]);
  assert.equal(empty.elements['#project-results'].textContent, '0 of 0 projects');
  assert.equal(empty.elements['#empty'].hidden, false);
  assert.equal(empty.elements['#empty'].textContent, 'No public projects to show yet.');
});
