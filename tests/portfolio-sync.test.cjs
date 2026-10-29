const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { classify, discover, mount, publicUrl, renderCard } = require('../portfolio-sync.js');

const owner = 'madhumithachalla';
const root = `/repos/${owner}`;
const listing = `/users/${owner}/repos?type=owner&per_page=100&page=1`;
const personal = '# A tool\n\nSolo personal project. Helps plan a day.';
function repo(name, overrides = {}) {
  return { name, owner: { login: owner }, private: false, visibility: 'public', size: 1,
    default_branch: 'main', topics: [], ...overrides };
}
function fixture(routes) {
  const calls = [];
  const fetcher = async (url, options) => {
    assert.ok(url.startsWith('https://api.github.com/'));
    assert.equal(options.credentials, 'omit');
    assert.equal(options.cache, 'no-store');
    assert.equal(Object.keys(options.headers).some(key => /authorization/i.test(key)), false);
    calls.push(url);
    const key = url.slice('https://api.github.com'.length);
    const value = routes[key];
    if (value instanceof Error) throw value;
    return { status: value === undefined ? 404 : value === 403 ? 403 : 200,
      ok: value !== undefined && value !== 403,
      json: async () => value, text: async () => typeof value === 'string' ? value : JSON.stringify(value) };
  };
  return { fetcher, calls };
}
function base(repos = []) {
  return { [listing]: repos, [`${root}/projects`]: { private: false, default_branch: 'main' },
    [`${root}/projects/contents/?ref=main`]: [] };
}
function detail(routes, name, metadata, readme = personal, branch = 'main') {
  if (metadata !== undefined) routes[`${root}/${name}/contents/portfolio.json?ref=${branch}`] = metadata;
  if (readme !== undefined) routes[`${root}/${name}/readme?ref=${branch}`] = readme;
}

test('discovers a future public repo and applies approved display metadata', async () => {
  const routes = base([repo('new-tool', { default_branch: 'develop', homepage: 'https://old.example/' })]);
  detail(routes, 'new-tool', { kind: 'personal', title: 'A new tool', description: 'Plan a day.',
    demo: 'https://demo.example/', categories: ['web', 'automation', 'invented'] }, personal, 'develop');
  const { fetcher } = fixture(routes);
  assert.deepEqual(await discover(fetcher), [{ id: 'repo:new-tool', title: 'A new tool',
    description: 'Plan a day.', categories: ['web', 'automation'],
    source: `https://github.com/${owner}/new-tool`, demo: 'https://demo.example/' }]);
});

test('new collection folder works without any known handwritten folders', async () => {
  const routes = base();
  routes[`${root}/projects`] = { private: false, default_branch: 'trunk' };
  routes[`${root}/projects/contents/?ref=trunk`] = [{ type: 'dir', name: 'new-tool' }];
  routes[`${root}/projects/contents/new-tool/README.md?ref=trunk`] = personal;
  const cards = await discover(fixture(routes).fetcher);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].source, `https://github.com/${owner}/projects/tree/trunk/new-tool`);
});

test('private, forked, archived, disabled, empty, foreign and academic repos are never read', async () => {
  const repos = [repo('secret', { private: true }), repo('private-visibility', { visibility: 'private' }),
    repo('fork', { fork: true }), repo('archive', { archived: true }), repo('disabled', { disabled: true }),
    repo('empty', { size: 0 }), repo('foreign', { owner: { login: 'someone-else' } }),
    repo('FIT5225-work'), repo('esaver'), repo('class-work', { topics: ['coursework'] }),
    repo('hidden', { topics: ['portfolio-exclude'] }), repo('university', { description: 'My university project' })];
  const { fetcher, calls } = fixture(base(repos));
  assert.deepEqual(await discover(fetcher), []);
  assert.equal(calls.length, 3);
  assert.ok(calls.every(url => !url.includes('/user/repos')));
});

test('classification excludes coursework evidence and invalid metadata; a personal label cannot override it', () => {
  for (const academic of ['Solo coursework project', 'Team project · Monash University',
    'Assignment submission', 'FIT5225 solution', 'academic', 'university project']) {
    assert.equal(classify({ kind: 'personal' }, academic, 'tool'), false);
  }
  for (const metadata of [{ kind: 'academic' }, { kind: 'personal', exclude: true },
    { kind: 'personal', academic: true }, { kind: 'other' }, [], 'personal', {}]) {
    assert.equal(classify(metadata, personal, 'tool'), false);
  }
  assert.equal(classify(null, null, 'tool'), false);
  assert.equal(classify(null, personal, 'tool'), true);
  assert.equal(classify({ kind: 'competition' }, null, 'tool'), true);
  assert.equal(classify(null, `${personal}\n\nAuthor: Master of IT, Monash University.`, 'tool'), true);
});

test('academic folders, hidden/infrastructure folders and known cards are not fetched again', async () => {
  const routes = base([repo('Already-Here')]);
  routes[`${root}/projects/contents/?ref=main`] = ['birdtag', 'cloudpose-pipeline', 'esaver',
    'spotify-success-analysis', '.github', 'docs', 'assets', 'existing'].map(name => ({ type: 'dir', name }));
  const { fetcher, calls } = fixture(routes);
  assert.deepEqual(await discover(fetcher, { repos: ['already-here'], folders: ['Existing'] }), []);
  assert.equal(calls.length, 3);
});

test('new academic README and exclusion metadata prevent repository and folder tiles', async () => {
  const routes = base([repo('course-app'), repo('excluded-app')]);
  detail(routes, 'course-app', { kind: 'personal' }, 'My coursework for Monash University.');
  detail(routes, 'excluded-app', { kind: 'personal', exclude: true });
  routes[`${root}/projects/contents/?ref=main`] = [{ type: 'dir', name: 'new-course' }];
  routes[`${root}/projects/contents/new-course/README.md?ref=main`] = 'My assignment.';
  assert.deepEqual(await discover(fixture(routes).fetcher), []);
});

test('later repository pages are discovered', async () => {
  const routes = base(Array.from({ length: 100 }, (_, n) => repo(`empty-${n}`, { size: 0 })));
  routes[listing.replace(/page=1$/, 'page=2')] = [repo('page-two')];
  detail(routes, 'page-two');
  const cards = await discover(fixture(routes).fetcher);
  assert.deepEqual(cards.map(card => card.id), ['repo:page-two']);
});

test('one invalid or unavailable candidate does not block healthy projects', async () => {
  const routes = base(['valid', 'malformed', 'rate-limited', 'offline'].map(name => repo(name)));
  detail(routes, 'valid');
  detail(routes, 'malformed', '{not json');
  detail(routes, 'rate-limited', 403);
  detail(routes, 'offline', new Error('offline'));
  assert.deepEqual((await discover(fixture(routes).fetcher)).map(card => card.id), ['repo:valid']);
});

test('GitHub outage omits discovery without throwing or resurrecting stale cached listings', async () => {
  const { fetcher } = fixture({ [listing]: 403, [`${root}/projects`]: new Error('offline') });
  assert.deepEqual(await discover(fetcher), []);
});

test('a collection becoming private cannot expose its folders', async () => {
  const routes = base();
  routes[`${root}/projects`] = { private: true, default_branch: 'main' };
  const { fetcher, calls } = fixture(routes);
  assert.deepEqual(await discover(fetcher), []);
  assert.equal(calls.length, 2);
});

test('homepage schemes and embedded credentials cannot become clickable links', async () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,evil', 'http://example.com',
    '//example.com', 'https://user:secret@example.com']) assert.equal(publicUrl(url), null);
  const routes = base([repo('bad-homepage', { homepage: 'javascript:alert(1)' })]);
  detail(routes, 'bad-homepage');
  const [card] = await discover(fixture(routes).fetcher);
  assert.equal(card.demo, null);
  assert.equal(card.source, `https://github.com/${owner}/bad-homepage`);
});

test('API metadata is rendered as text, with separate demo and source links', () => {
  const doc = { createElement(tag) {
    return { tag, dataset: {}, children: [], append(...items) { this.children.push(...items); },
      appendChild(item) { this.children.push(item); },
      set innerHTML(_) { assert.fail('Untrusted metadata must never be HTML'); } };
  } };
  const card = renderCard(doc, { id: 'repo:test', title: '<img src=x onerror=alert(1)>',
    description: '<script>secret</script>', categories: ['web'],
    demo: 'https://demo.example/', source: `https://github.com/${owner}/test` });
  assert.equal(card.children[0].children[1].textContent, '<img src=x onerror=alert(1)>');
  assert.equal(card.children[0].children[2].textContent, '<script>secret</script>');
  assert.equal(card.children[1].children.length, 2);
  assert.equal(card.dataset.categories, 'web');
});

test('the approved Stuplying tile is available without GitHub and has no private source link', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const tile = html.match(/<div class="project" id="proj-stuplying"[\s\S]*?(?=<div class="project" id="proj-birdtag")/)[0];
  assert.match(tile, /https:\/\/stuplying\.vercel\.app\//);
  assert.doesNotMatch(tile, /github\.com|resume|api[_-]?key|application records/i);
  assert.match(html, /src="portfolio-sync\.js\?v=1"/);
});

test('late tiles notify the active filter, deduplicate, and retire the old unclassified caches', async () => {
  const routes = base([repo('new-tool'), repo('already-here')]);
  detail(routes, 'new-tool', { kind: 'personal', categories: ['web'] });
  const children = [], events = [], removed = [];
  const oldStorage = globalThis.localStorage;
  globalThis.localStorage = { removeItem: key => removed.push(key) };
  const list = {
    querySelector: () => null,
    querySelectorAll(selector) {
      if (selector === '[data-portfolio-repo]') return [{ dataset: { portfolioRepo: 'CareerLaunch' } }];
      if (selector === 'a.project-link') return [{ href: `https://github.com/${owner}/Already-Here` }];
      if (selector === '[data-portfolio-id]') return children;
      return [];
    },
    insertBefore: child => children.push(child), dispatchEvent: event => events.push(event.type)
  };
  const doc = { querySelector: () => list, createElement(tag) {
    return { tag, dataset: {}, children: [], append(...nodes) { this.children.push(...nodes); },
      appendChild(node) { this.children.push(node); } };
  } };
  try {
    await mount(doc, fixture(routes).fetcher);
    await mount(doc, fixture(routes).fetcher);
    assert.equal(children.length, 1);
    assert.equal(children[0].dataset.categories, 'web');
    assert.deepEqual(events, ['portfolio:updated', 'portfolio:updated']);
    assert.deepEqual(removed.slice(0, 2), ['jd-sync-repos', 'jd-sync-folders']);
  } finally { globalThis.localStorage = oldStorage; }
});
