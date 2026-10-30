/* Public-only discovery. No token, authenticated endpoint, or private repo inventory. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else api.mount(root.document, root.fetch.bind(root));
})(globalThis, function () {
  'use strict';
  const OWNER = 'madhumithachalla';
  const API = 'https://api.github.com';
  const EXCLUDED_REPOS = new Set(['projects', 'madhumithachalla.github.io', 'birdtag', 'esaver', 'cloudpose-pipeline', 'spotify-success-analysis']);
  const EXCLUDED_FOLDERS = new Set(['birdtag', 'esaver', 'cloudpose-pipeline', 'spotify-success-analysis', 'docs', 'assets', 'images', 'tests', 'scripts', 'node_modules', 'ielts-mock-practice-tool']);
  const EXCLUDED_TOPICS = new Set(['academic', 'coursework', 'assignment', 'homework', 'university-project', 'portfolio-exclude']);
  const ACADEMIC = /\b(?:academic|coursework|assignments?|homework|capstone|university project|FIT\d{4})\b/i;
  // Existing collection READMEs declare "Solo/Team project · Monash University".
  // A university mentioned only in an author's biography is not coursework.
  const UNIVERSITY_PROJECT = /\b(?:solo|team) project[^\n]{0,100}\bMonash University\b/i;
  const CATEGORIES = new Set(['cloud', 'mobile', 'web', 'data', 'automation', 'design', 'team']);
  const KINDS = new Set(['personal', 'professional', 'competition']);

  function publicUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  }

  function isAcademic(...values) {
    return values.some(value => typeof value === 'string' && (ACADEMIC.test(value) || UNIVERSITY_PROJECT.test(value)));
  }

  function classify(metadata, readme, name, description = '') {
    // A broken/unknown declaration cannot silently become approval. Academic
    // evidence always wins, even over an incorrectly labelled personal project.
    if (metadata !== null && (typeof metadata !== 'object' || Array.isArray(metadata))) return false;
    if (metadata && (metadata.exclude === true || metadata.academic === true || !KINDS.has(metadata.kind))) return false;
    if (isAcademic(name, description, readme, metadata?.kind, metadata?.title, metadata?.description)) return false;
    return Boolean(metadata || (typeof readme === 'string' && readme.trim()));
  }

  async function request(fetcher, path, optional = false, raw = false) {
    const response = await fetcher(API + path, {
      credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
      headers: { Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json' },
      signal: AbortSignal.timeout(8000)
    });
    if (optional && response.status === 404) return null;
    if (!response.ok) throw new Error('Public project information is unavailable');
    return raw ? response.text() : response.json();
  }

  async function details(fetcher, repo, branch, folder = '') {
    const base = `/repos/${OWNER}/${encodeURIComponent(repo)}`;
    const prefix = folder ? `${encodeURIComponent(folder)}/` : '';
    const ref = `?ref=${encodeURIComponent(branch)}`;
    const [rawMetadata, readme] = await Promise.all([
      request(fetcher, `${base}/contents/${prefix}portfolio.json${ref}`, true, true),
      request(fetcher, folder ? `${base}/contents/${prefix}README.md${ref}` : `${base}/readme${ref}`, true, true)
    ]);
    return { metadata: rawMetadata === null ? null : JSON.parse(rawMetadata), readme };
  }

  function projectCard(id, name, description, metadata, source, homepage) {
    const demo = publicUrl(metadata?.demo || homepage);
    return {
      id, title: String(metadata?.title || name.replace(/[-_]/g, ' ')).slice(0, 120),
      description: String(metadata?.description || description || 'A personal project. Explore the code and writeup on GitHub.').slice(0, 420),
      categories: Array.isArray(metadata?.categories) ? metadata.categories.filter(c => CATEGORIES.has(c)) : [],
      source, demo
    };
  }

  async function discoverRepos(fetcher, known) {
    const repos = [];
    // /users/:owner/repos is a public inventory; never use /user/repos.
    for (let page = 1; ; page++) {
      const batch = await request(fetcher, `/users/${OWNER}/repos?type=owner&per_page=100&page=${page}`);
      if (!Array.isArray(batch)) throw new Error('Invalid public project list');
      repos.push(...batch);
      if (batch.length < 100) break;
    }
    const candidates = repos.filter(repo => {
      const name = String(repo.name || '').toLowerCase();
      return repo.owner?.login?.toLowerCase() === OWNER && repo.private === false && repo.visibility !== 'private' &&
        !repo.fork && !repo.archived && !repo.disabled && repo.size > 0 && repo.default_branch &&
        !EXCLUDED_REPOS.has(name) && !known.has(name) &&
        !(repo.topics || []).some(topic => EXCLUDED_TOPICS.has(topic.toLowerCase())) &&
        !isAcademic(name, repo.description);
    });
    const results = await Promise.allSettled(candidates.map(async repo => {
      const { metadata, readme } = await details(fetcher, repo.name, repo.default_branch);
      if (!classify(metadata, readme, repo.name, repo.description)) return null;
      return projectCard(`repo:${repo.name.toLowerCase()}`, repo.name, repo.description, metadata,
        `https://github.com/${OWNER}/${encodeURIComponent(repo.name)}`, repo.homepage);
    }));
    return results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
  }

  async function discoverFolders(fetcher, known) {
    const collection = await request(fetcher, `/repos/${OWNER}/projects`);
    if (collection.private !== false || !collection.default_branch) return [];
    const branch = collection.default_branch;
    const entries = await request(fetcher, `/repos/${OWNER}/projects/contents/?ref=${encodeURIComponent(branch)}`);
    if (!Array.isArray(entries)) return [];
    const candidates = entries.filter(entry => entry.type === 'dir' && !entry.name.startsWith('.') &&
      !known.has(entry.name.toLowerCase()) && !EXCLUDED_FOLDERS.has(entry.name.toLowerCase()) && !isAcademic(entry.name));
    const results = await Promise.allSettled(candidates.map(async dir => {
      const { metadata, readme } = await details(fetcher, 'projects', branch, dir.name);
      if (!classify(metadata, readme, dir.name)) return null;
      return projectCard(`folder:${dir.name.toLowerCase()}`, dir.name, '', metadata,
        `https://github.com/${OWNER}/projects/tree/${encodeURIComponent(branch)}/${encodeURIComponent(dir.name)}`);
    }));
    return results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
  }

  async function discover(fetcher, { repos = [], folders = [] } = {}) {
    const results = await Promise.allSettled([
      discoverRepos(fetcher, new Set(repos.map(name => name.toLowerCase()))),
      discoverFolders(fetcher, new Set(folders.map(name => name.toLowerCase())))
    ]);
    return results.flatMap(r => r.status === 'fulfilled' ? r.value : []).sort((a, b) => a.title.localeCompare(b.title));
  }

  function renderCard(doc, project) {
    const card = doc.createElement('div');
    card.className = 'project project-sync-fallback in';
    card.dataset.portfolioId = project.id;
    card.dataset.categories = project.categories.join(' ');
    const main = doc.createElement('div');
    const top = doc.createElement('div');
    top.className = 'project-top';
    const pill = doc.createElement('span');
    pill.className = 'pill new-sync';
    pill.textContent = 'Recent project';
    top.appendChild(pill);
    const title = doc.createElement('h3');
    title.textContent = project.title;
    const description = doc.createElement('p');
    description.textContent = project.description;
    main.append(top, title, description);
    const side = doc.createElement('div');
    side.className = 'project-side';
    for (const [href, label] of [[project.demo, 'Try the app ↗'], [project.source, 'View on GitHub ↗']]) {
      if (!href) continue;
      const link = doc.createElement('a');
      link.className = 'project-link';
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = label;
      side.appendChild(link);
    }
    card.append(main, side);
    return card;
  }

  async function mount(doc, fetcher) {
    const list = doc.querySelector('.project-list');
    if (!list) return;
    const repos = [], folders = [];
    list.querySelectorAll('[data-portfolio-repo]').forEach(card => repos.push(card.dataset.portfolioRepo));
    list.querySelectorAll('a.project-link').forEach(link => {
      const match = link.href.match(/^https:\/\/github\.com\/madhumithachalla\/([^/?#]+)(?:\/tree\/[^/]+\/([^/?#]+))?/i);
      if (!match) return;
      if (match[1].toLowerCase() === 'projects' && match[2]) folders.push(decodeURIComponent(match[2]));
      else repos.push(decodeURIComponent(match[1]));
    });
    // Retire the previous unclassified/stale cache: removal or reclassification
    // must never resurrect a project from a visitor's old cached inventory.
    try { globalThis.localStorage.removeItem('jd-sync-repos'); globalThis.localStorage.removeItem('jd-sync-folders'); } catch {}
    const projects = await discover(fetcher, { repos, folders });
    const upcoming = list.querySelector('.project.upcoming');
    for (const project of projects) {
      if ([...list.querySelectorAll('[data-portfolio-id]')].some(card => card.dataset.portfolioId === project.id)) continue;
      list.insertBefore(renderCard(doc, project), upcoming);
    }
    list.dispatchEvent(new Event('portfolio:updated'));
  }

  return { classify, discover, mount, publicUrl, renderCard };
});
