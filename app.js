// Count up any number on the page marked with data-target, once it scrolls
  // into view — leadership and project metrics, so numbers throughout the
  // site feel alive rather than static. Each element observes and animates
  // independently, on its own first appearance. The hero "Impact so far"
  // stats are excluded here and looped forever instead, further down.
  (function(){
    const nums = Array.from(document.querySelectorAll('[data-target]')).filter(el => !el.closest('.stats-inner'));
    if (!nums.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render(el, value){
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = (el.dataset.prefix || '') + value.toFixed(decimals) + (el.dataset.suffix || '');
    }
    function animate(el){
      const target = parseFloat(el.dataset.target);
      if (reduceMotion) { render(el, target); return; }
      const duration = 1400;
      const start = performance.now();
      function frame(now){
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        render(el, target * eased);
        if (p < 1) requestAnimationFrame(frame);
        else render(el, target);
      }
      requestAnimationFrame(frame);
    }

    if (reduceMotion) { nums.forEach(animate); return; }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    nums.forEach(el => obs.observe(el));
  })();

  // The hero "Impact so far" stats loop forever instead of animating once --
  // count up, hold at the real value for a beat, then recount -- so the strip
  // reads as a live dashboard rather than a static number that ran once and
  // froze. It always settles back on the true value; only the motion repeats.
  (function(){
    const nums = document.querySelectorAll('.stats-inner [data-target]');
    if (!nums.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render(el, value){
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = (el.dataset.prefix || '') + value.toFixed(decimals) + (el.dataset.suffix || '');
    }
    if (reduceMotion) { nums.forEach(el => render(el, parseFloat(el.dataset.target))); return; }

    function cycle(el){
      const target = parseFloat(el.dataset.target);
      const duration = 1400;
      const holdMs = 2600;
      const start = performance.now();
      function frame(now){
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        render(el, target * eased);
        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          render(el, target);
          setTimeout(() => cycle(el), holdMs);
        }
      }
      requestAnimationFrame(frame);
    }

    let started = false;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          nums.forEach(cycle);
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    nums.forEach(el => obs.observe(el));
  })();

  // Smooth-scroll all internal anchor links via JS rather than relying purely on
  // native hash navigation, which some sandboxed/embedded preview contexts block.
  (function(){
    const header = document.querySelector('header.nav');
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href').slice(1);
        const target = id && document.getElementById(id);
        if (!target) return; // let default happen if there's nothing to scroll to
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
        window.scrollTo({ top, behavior: 'smooth' });
        history.pushState(null, '', `#${id}`);
      });
    });
  })();

  // Subject dropdown — "Other" reveals a free-text input in its place, and
  // every other option writes a full professional draft into the message
  // box (since there's no backend here to power real autocomplete, this is
  // the closest static equivalent). The draft is a starting point, not a
  // final answer: switching subjects only replaces the box while it's still
  // empty or holds a draft we inserted ourselves, so a visitor's own typing
  // is never overwritten. A manual "Insert a suggested draft" button covers
  // the case where they want it back after clearing or editing it.
  (function(){
    const select = document.getElementById('msg-subject');
    const other = document.getElementById('msg-subject-other');
    const body = document.getElementById('msg-body');
    const draftRow = document.getElementById('msgDraftRow');
    const insertDraftBtn = document.getElementById('msgInsertDraft');
    if (!select || !other || !body) return;

    const DRAFTS = {
      'Job opportunity': "Hi Madhumitha,\n\nI came across your portfolio and think there could be a strong fit with an opportunity I'm working on. I'd love to share more details and hear whether it's something you'd be interested in exploring.\n\nLet me know if you're open to a quick chat.\n\nBest,\n",
      'Collaboration': "Hi Madhumitha,\n\nI'm working on something I think overlaps well with your background, and I'd love to explore whether there's room to collaborate. Happy to share more details whenever suits you.\n\nLooking forward to hearing your thoughts.\n\nBest,\n",
      'Question about a project': "Hi Madhumitha,\n\nI was looking through one of the projects on your portfolio and had a question about how you approached it. Would you be open to sharing a bit more detail?\n\nThanks in advance,\n",
      'Mentorship or advice': "Hi Madhumitha,\n\nI came across your background and would love to get your perspective on a few things I'm navigating. Would you be open to a short conversation if your schedule allows?\n\nThank you for considering,\n",
      'Just saying hi': "Hi Madhumitha,\n\nJust wanted to say hi — I enjoyed looking through your portfolio! Wishing you continued success.\n\nBest,\n",
    };
    let lastInsertedDraft = '';

    function placeCursorAfterGreeting(){
      const pos = body.value.indexOf('\n\n');
      const cursor = pos === -1 ? body.value.length : pos + 2;
      body.focus();
      body.setSelectionRange(cursor, cursor);
    }

    function insertDraft(){
      const draft = DRAFTS[select.value];
      if (!draft) return;
      body.value = draft;
      lastInsertedDraft = draft;
      placeCursorAfterGreeting();
    }

    select.addEventListener('change', () => {
      const isOther = select.value === 'Other';
      other.style.display = isOther ? 'block' : 'none';
      if (isOther) other.focus();

      const draft = DRAFTS[select.value];
      draftRow.style.display = draft ? 'flex' : 'none';
      if (draft && (!body.value.trim() || body.value === lastInsertedDraft)) {
        insertDraft();
      }
    });

    if (insertDraftBtn) insertDraftBtn.addEventListener('click', insertDraft);
  })();

  // "Send a message" form — same no-backend mailto approach as the coffee scheduler.
  // Validates name + message are filled in (an empty mailto just looks broken on send),
  // and offers a clipboard fallback for visitors whose device has no mail app configured —
  // a plain mailto: link silently does nothing in that case, with no way to tell why.
  (function(){
    const btn = document.getElementById('msg-send');
    const copyBtn = document.getElementById('msg-copy');
    const errorEl = document.getElementById('msg-error');
    const nameEl = document.getElementById('msg-name');
    const bodyEl = document.getElementById('msg-body');
    const charCount = document.getElementById('msg-char-count');
    if (!btn || !bodyEl) return;

    if (charCount) {
      bodyEl.addEventListener('input', () => {
        charCount.textContent = `${bodyEl.value.length} / 2000`;
      });
    }

    function composeEmail(){
      const name = nameEl.value.trim();
      const email = document.getElementById('msg-email').value.trim();
      const subjectSelect = document.getElementById('msg-subject').value;
      const subjectOther = document.getElementById('msg-subject-other').value.trim();
      const subjectInput = subjectSelect === 'Other' ? subjectOther : subjectSelect;
      const message = bodyEl.value.trim();
      const subject = subjectInput || 'Message from your portfolio';
      const bodyLines = [
        `Hi Madhumitha,`,
        ``,
        message,
        ``,
        `— ${name}${email ? ` (${email})` : ''}`
      ];
      return { name, message, subject, text: bodyLines.join('\n') };
    }

    function validate(){
      const name = nameEl.value.trim();
      const message = bodyEl.value.trim();
      if (!name) return "Add your name so I know who's writing.";
      if (!message) return "Add a message before sending — an empty email isn't much to go on.";
      return null;
    }

    function showError(msg){
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.style.display = msg ? 'block' : 'none';
    }

    btn.addEventListener('click', () => {
      const err = validate();
      if (err) { showError(err); return; }
      showError(null);
      const { subject, text } = composeEmail();
      window.location.href = `mailto:rchmadhumitha@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const err = validate();
        if (err) { showError(err); return; }
        showError(null);
        const { subject, text } = composeEmail();
        const full = `To: rchmadhumitha@gmail.com\nSubject: ${subject}\n\n${text}`;
        try {
          await navigator.clipboard.writeText(full);
          copyBtn.textContent = 'Copied ✓';
          setTimeout(() => { copyBtn.textContent = 'Copy instead ⧉'; }, 2000);
        } catch (e) {
          showError('Could not copy automatically — select and copy the message by hand.');
        }
      });
    }
  })();

  // "Right now" juggle cards self-expire — add data-end="YYYY-MM" to any
  // card with a known end date and it fades out on its own once that month
  // has passed, so this section never needs manual pruning again. Cards
  // with no data-end (ongoing "since ..." roles) are left alone.
  (function(){
    const cards = document.querySelectorAll('.juggle-card[data-end]');
    if (!cards.length) return;
    const now = new Date();
    const currentYm = now.getFullYear() * 12 + now.getMonth();
    cards.forEach(card => {
      const [y, m] = card.dataset.end.split('-').map(Number);
      if (!y || !m) return;
      const endYm = y * 12 + (m - 1);
      if (endYm < currentYm) {
        card.style.transition = 'opacity .4s ease, transform .4s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.96)';
        setTimeout(() => card.remove(), 400);
      }
    });
  })();

  // Live sync with GitHub — the hand-written cards above stay the primary
  // content, but on load we check two things and surface a small fallback
  // card for anything that doesn't have a hand-written card yet, so a new
  // project can never silently go unlisted:
  //   1. New top-level folders in the madhumithachalla/projects monorepo.
  //   2. New standalone public repos on the account (e.g. a project that
  //      gets its own repo instead of a projects/ subfolder).
  // Uses the public unauthenticated GitHub API (~60 req/hour/IP) and fails
  // completely silently on error, rate-limit, or offline — visitors just
  // see the existing cards. To keep a repo out of this entirely (a fork,
  // an empty placeholder, something not meant for the portfolio), add its
  // name (lowercase) to EXCLUDED_REPOS below.
  (function(){
    const list = document.querySelector('.project-list');
    if (!list) return;

    const EXCLUDED_REPOS = new Set(['madhumithachalla.github.io', 'projects']);
    const SYNC_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h — keeps us well under GitHub's 60 req/hr unauthenticated limit on repeat visits

    function cacheGet(key){
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { at, data } = JSON.parse(raw);
        if (Date.now() - at > SYNC_CACHE_TTL_MS) return null;
        return data;
      } catch (e) { return null; }
    }
    function cacheSet(key, data){
      try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), data })); } catch (e) {}
    }
    // Falls back to a stale cached copy (even past TTL) if the live fetch fails —
    // e.g. the unauthenticated GitHub API rate limit (60 req/hr/IP) being hit on a
    // shared corporate network — so a successful earlier load still shows.
    function cacheGetStale(key){
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw).data;
      } catch (e) { return null; }
    }

    function buildFallbackCard(pillText, title, description, linkHref, linkText){
      const card = document.createElement('div');
      card.className = 'project project-sync-fallback in';

      const main = document.createElement('div');
      const top = document.createElement('div');
      top.className = 'project-top';
      const pill = document.createElement('span');
      pill.className = 'pill new-sync';
      pill.textContent = pillText;
      top.appendChild(pill);
      main.appendChild(top);

      const h3 = document.createElement('h3');
      h3.textContent = title;
      main.appendChild(h3);

      const p = document.createElement('p');
      p.textContent = description;
      main.appendChild(p);

      const side = document.createElement('div');
      side.className = 'project-side';
      const link = document.createElement('a');
      link.className = 'project-link';
      link.href = linkHref;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = linkText;
      side.appendChild(link);

      card.appendChild(main);
      card.appendChild(side);
      return card;
    }

    // --- 1. New folders inside the projects monorepo ---
    const knownFolderSlugs = new Set();
    list.querySelectorAll('a.project-link[href*="github.com/madhumithachalla/projects/tree/main/"]').forEach(a => {
      const m = a.getAttribute('href').match(/tree\/main\/([^/?#]+)/);
      if (m) knownFolderSlugs.add(m[1]);
    });

    function entriesToFolderCards(entries){
      if (!Array.isArray(entries)) return [];
      return entries
        .filter(e => e.type === 'dir' && !e.name.startsWith('.') && !knownFolderSlugs.has(e.name))
        .map(dir => buildFallbackCard(
          'New in the projects repo',
          dir.name.replace(/[-_]/g, ' '),
          "This folder just landed in the projects repo and doesn't have a full writeup here yet — check it out on GitHub in the meantime.",
          `https://github.com/madhumithachalla/projects/tree/main/${encodeURIComponent(dir.name)}`,
          'View on GitHub ↗'
        ));
    }

    const FOLDERS_CACHE_KEY = 'jd-sync-folders';
    const cachedFolders = cacheGet(FOLDERS_CACHE_KEY);

    const foldersPromise = !knownFolderSlugs.size
      ? Promise.resolve([])
      : cachedFolders
        ? Promise.resolve(entriesToFolderCards(cachedFolders))
        : fetch('https://api.github.com/repos/madhumithachalla/projects/contents/')
            .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
            .then(entries => {
              if (Array.isArray(entries)) cacheSet(FOLDERS_CACHE_KEY, entries);
              return entriesToFolderCards(entries);
            })
            .catch(() => entriesToFolderCards(cacheGetStale(FOLDERS_CACHE_KEY)));

    // --- 2. New standalone public repos on the account ---
    const knownRepoNames = new Set(EXCLUDED_REPOS);
    list.querySelectorAll('a.project-link[href^="https://github.com/madhumithachalla/"]').forEach(a => {
      const m = a.getAttribute('href').match(/^https:\/\/github\.com\/madhumithachalla\/([^/?#]+)\/?$/);
      if (m) knownRepoNames.add(m[1].toLowerCase());
    });

    function reposToCards(repos){
      if (!Array.isArray(repos)) return [];
      return repos
        .filter(r => !r.fork && !r.archived && r.size > 0 && !knownRepoNames.has(r.name.toLowerCase()))
        .map(r => buildFallbackCard(
          'New public repo',
          r.name.replace(/[-_]/g, ' '),
          r.description || "A new public repo that doesn't have a full writeup here yet — check it out on GitHub in the meantime.",
          r.homepage || r.html_url,
          r.has_pages ? 'View live ↗' : 'View on GitHub ↗'
        ));
    }

    const REPOS_CACHE_KEY = 'jd-sync-repos';
    const cachedRepos = cacheGet(REPOS_CACHE_KEY);

    const reposPromise = cachedRepos
      ? Promise.resolve(reposToCards(cachedRepos))
      : fetch('https://api.github.com/users/madhumithachalla/repos?per_page=100&type=public')
          .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
          .then(repos => {
            if (Array.isArray(repos)) cacheSet(REPOS_CACHE_KEY, repos);
            return reposToCards(repos);
          })
          .catch(() => reposToCards(cacheGetStale(REPOS_CACHE_KEY)));

    Promise.all([foldersPromise, reposPromise]).then(([folderCards, repoCards]) => {
      const cards = [...folderCards, ...repoCards];
      if (!cards.length) return;
      const upcoming = list.querySelector('.project.upcoming');
      cards.forEach(card => list.insertBefore(card, upcoming || null));
    });
  })();

  // Skills & stack auto-addendum — this is the actual sync logic, not a one-off edit: any
  // technology named in a Project's tag row, or in an Experience entry's own "Skills:" line,
  // that isn't already named anywhere in Skills & Stack (by exact match or as a substring of
  // an existing skill, e.g. "AWS" already covers "AWS Lambda") gets listed in a trailing
  // "Also showing up in recent work" row, generated fresh on every page load. Add a new
  // project or a Skills: line to an experience entry and it shows up here with no manual
  // re-sync of this section ever again.
  (function(){
    const skillsGroups = document.querySelector('#skills .skills-groups');
    if (!skillsGroups) return;

    const existing = new Set();
    skillsGroups.querySelectorAll('.skill-name, .skills-cat-label').forEach(el => existing.add(el.textContent.trim().toLowerCase()));

    const BLOCKLIST = new Set(['planned', 'graduate technology programs']);
    const found = new Map();

    function consider(raw){
      const clean = String(raw).replace(/\s+/g, ' ').trim().replace(/\.$/, '');
      if (!clean) return;
      const lc = clean.toLowerCase();
      if (BLOCKLIST.has(lc)) return;
      const covered = [...existing].some(e => e === lc || e.includes(lc) || lc.includes(e));
      if (covered) return;
      if (!found.has(lc)) found.set(lc, clean);
    }

    document.querySelectorAll('.project .tags .tag').forEach(el => consider(el.textContent));

    document.querySelectorAll('#experience .exp-detail').forEach(el => {
      const m = el.innerHTML.match(/<strong>Skills:<\/strong>\s*([^<]+)/i);
      if (!m) return;
      const tmp = document.createElement('div');
      tmp.innerHTML = m[1];
      tmp.textContent.split(',').forEach(consider);
    });

    if (!found.size) return;

    const wrap = document.createElement('div');
    wrap.className = 'cat-slate';
    wrap.innerHTML = '<div class="skills-cat-head"><span class="skills-cat-dot"></span><span class="skills-cat-label">Also showing up in recent work</span><span class="skills-cat-line"></span></div>';
    const row = document.createElement('div');
    row.className = 'skills-tag-row';
    [...found.values()].sort((a, b) => a.localeCompare(b)).forEach(label => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = label;
      row.appendChild(span);
    });
    wrap.appendChild(row);
    skillsGroups.appendChild(wrap);
  })();

  // Coffee calendar tabs — switches between the inline Calendly widget and
  // Google Calendar's Appointment Schedule iframe (once GOOGLE_CALENDAR_LINK
  // is set below). Both show real, live availability — no guessing a day/time.
  (function(){
    const GOOGLE_CALENDAR_LINK = 'https://calendar.app.google/4PDjH1EKwwXA1cvNA';

    const calendlyTab = document.getElementById('cal-tab-calendly');
    const gcalTab = document.getElementById('cal-tab-gcal');
    const calendlyWrap = document.getElementById('calendly-embed-wrap');
    const gcalWrap = document.getElementById('gcal-embed-wrap');
    const gcalIframe = document.getElementById('gcal-iframe');
    const gcalFallbackNote = document.getElementById('gcal-fallback-note');
    const gcalMailtoLink = document.getElementById('gcal-mailto-link');
    if (!calendlyTab || !gcalTab) return;

    if (GOOGLE_CALENDAR_LINK) {
      gcalIframe.src = GOOGLE_CALENDAR_LINK;
      gcalIframe.style.display = 'block';
      gcalFallbackNote.hidden = true;
    } else if (gcalMailtoLink) {
      gcalMailtoLink.addEventListener('click', (e) => {
        e.preventDefault();
        const subject = 'Coffee catch-up request';
        const body = `Hi Madhumitha,\n\nI'd like to grab a coffee (in person or virtual) via Google Calendar. Here's what works for me: [add your preferred times]`;
        window.location.href = `mailto:rchmadhumitha@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      });
    }

    function show(mode){
      const isCalendly = mode === 'calendly';
      calendlyTab.classList.toggle('active', isCalendly);
      gcalTab.classList.toggle('active', !isCalendly);
      calendlyTab.setAttribute('aria-selected', String(isCalendly));
      gcalTab.setAttribute('aria-selected', String(!isCalendly));
      calendlyWrap.hidden = !isCalendly;
      gcalWrap.hidden = isCalendly;
    }
    calendlyTab.addEventListener('click', () => show('calendly'));
    gcalTab.addEventListener('click', () => show('gcal'));
  })();

  // Light/dark theme toggle, persisted in localStorage
  (function(){
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const setLabel = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    };
    setLabel();
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
      }
      setLabel();
    });
  })();

  // Mobile nav toggle + click-based dropdown (fixes touch devices where :hover doesn't fire)
  (function(){
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    const dropdown = document.getElementById('nav-dropdown');
    const trigger = document.getElementById('nav-dropdown-trigger');

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        // Keep the floating chat button from poking through the full-screen mobile menu
        document.getElementById('chat-toggle')?.classList.toggle('chat-hide', isOpen);
      });
    }

    if (trigger && dropdown) {
      trigger.addEventListener('click', (e) => {
        // On small screens, tapping the trigger opens the submenu instead of jumping straight down
        if (window.innerWidth <= 760) {
          e.preventDefault();
          dropdown.classList.toggle('open');
        }
      });
    }

    // Close mobile menu after tapping any nav link that actually navigates
    document.querySelectorAll('#nav-links a').forEach(a => {
      a.addEventListener('click', () => {
        if (a === trigger && window.innerWidth <= 760) return;
        links.classList.remove('open');
        toggle?.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
        dropdown?.classList.remove('open');
        document.getElementById('chat-toggle')?.classList.remove('chat-hide');
      });
    });

    // Close dropdown when clicking outside (desktop)
    document.addEventListener('click', (e) => {
      if (dropdown && !dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
  })();


  // Terminal-style typewriter beside the portrait — loops through a plain-text
  // "cat typical_tuesday.log" reveal, tying into the "hustle on a Tuesday"
  // framing used in the Juggling section further down. Content is
  // decorative/illustrative (not literal clock times), same spirit as the
  // ticker taglines elsewhere on the page. Respects reduced-motion by just
  // printing the full text once.
  (function(){
    const el = document.getElementById('terminal-lines');
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lines = [
      '> morning: Master of IT lectures @ Monash',
      '> midday: Baazar internship + HR Projects',
      '> afternoon: mentoring + Monash Data & AI Society',
      '> evening: coffee catch-ups, coding this site',
      '> late night: poetry as "Female Photon"',
      '> repeat. (mostly)',
    ];
    const badges = document.querySelectorAll('.rbadge');
    function setBadge(i){
      badges.forEach(b => b.classList.toggle('active', b.dataset.badge === String(i)));
    }
    if (reduced) {
      el.textContent = lines.join('\n');
      return;
    }
    let li = 0, ci = 0, text = '';
    function tick(){
      if (li >= lines.length) {
        setTimeout(() => { text = ''; li = 0; ci = 0; el.textContent = ''; setBadge(0); tick(); }, 2200);
        return;
      }
      const line = lines[li];
      if (ci === 0) setBadge(li);
      if (ci <= line.length) {
        el.textContent = text + line.slice(0, ci);
        ci++;
        setTimeout(tick, 22);
      } else {
        text += line + '\n';
        li++; ci = 0;
        setTimeout(tick, 380);
      }
    }
    tick();
  })();

  // Meteor shower — ambient signature animation in the hero
  (function(){
    const canvas = document.getElementById('meteor-canvas');
    const hero = document.querySelector('.hero');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canvas || !hero) return;
    if (reduced) { canvas.remove(); return; }
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.offsetWidth; h = hero.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['255,111,94', '155,126,222', '45,212,191', '245,166,35'];
    let meteors = [];
    let bursts = [];

    function spawnMeteor(){
      const color = colors[Math.floor(Math.random()*colors.length)];
      const startX = Math.random() * w * 0.9;
      meteors.push({
        x: startX, y: -20,
        vx: 2.4 + Math.random()*1.6,
        vy: 3.4 + Math.random()*2,
        len: 60 + Math.random()*50,
        color,
        life: 1
      });
    }

    let frame = 0;
    function tick(){
      frame++;
      ctx.clearRect(0,0,w,h);

      if (frame % 95 === 0 && meteors.length < 3) spawnMeteor();

      meteors.forEach(m => {
        m.x += m.vx; m.y += m.vy;
        const tailX = m.x - m.vx * (m.len/6);
        const tailY = m.y - m.vy * (m.len/6);
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, `rgba(${m.color},0)`);
        grad.addColorStop(1, `rgba(${m.color},0.9)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.8, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${m.color},1)`;
        ctx.fill();

        if (m.y > h * 0.72 && m.life === 1){
          m.life = 0;
          bursts.push({x: m.x, y: m.y, r: 1, color: m.color, alpha: 0.8});
        }
      });
      meteors = meteors.filter(m => m.y < h + 40 && m.x < w + 40);

      bursts.forEach(b => {
        b.r += 1.1; b.alpha -= 0.025;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(${b.color},${Math.max(b.alpha,0)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
      bursts = bursts.filter(b => b.alpha > 0);

      requestAnimationFrame(tick);
    }
    setTimeout(spawnMeteor, 600);
    tick();
  })();

  // Profile-picture meteor: a meteor + two escort comets streak in once,
  // "hit" the photo (a brief flash), then hand off to a small infinity-shaped
  // charm (with photon dust looping inside it) that orbits the outside of
  // the photo forever. Under prefers-reduced-motion, skip the intro and the
  // orbit motion entirely — just show the charm sitting at rest.
  (function(){
    const head = document.getElementById('meteorHead');
    const tail = document.getElementById('meteorTail');
    const e1 = document.getElementById('escort1');
    const e2 = document.getElementById('escort2');
    const flash = document.getElementById('impactFlash');
    const charm = document.getElementById('charmGroup');
    const orbit = document.getElementById('charmOrbit');
    if (!head || !charm) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      [head, tail, e1, e2, flash].forEach(el => el && el.remove());
      charm.setAttribute('opacity', 1);
      const m = charm.querySelector('#charmOrbit');
      if (m) m.remove();
      return;
    }

    function addMotion(el, path, dur, delay){
      const a = document.createElementNS('http://www.w3.org/2000/svg','animateMotion');
      a.setAttribute('dur', dur); a.setAttribute('repeatCount','1'); a.setAttribute('path', path);
      a.setAttribute('fill','freeze'); a.setAttribute('rotate','auto');
      if (delay) a.setAttribute('begin', delay);
      el.appendChild(a);
    }
    [head, tail, e1, e2].forEach(el => el.setAttribute('opacity', 1));
    addMotion(head, 'M-40,-30 Q50,-10 118,118', '0.85s');
    addMotion(tail, 'M-40,-30 Q50,-10 118,118', '0.85s');
    addMotion(e1, 'M-55,10 Q30,20 110,130', '0.85s', '0.05s');
    addMotion(e2, 'M-30,60 Q70,50 128,132', '0.85s', '0.1s');

    setTimeout(() => {
      [head, tail, e1, e2].forEach(el => {
        el.style.transition = 'opacity .2s ease';
        el.setAttribute('opacity', 0);
      });
      flash.style.transition = 'none';
      flash.setAttribute('opacity', 1);
      flash.setAttribute('r', 4);
      requestAnimationFrame(() => {
        flash.style.transition = 'r .5s ease-out, opacity .5s ease-out';
        flash.setAttribute('r', 60);
        flash.setAttribute('opacity', 0);
      });
      charm.style.transition = 'opacity .5s ease';
      charm.setAttribute('opacity', 1);
      orbit.setAttribute('begin', '0s');
      orbit.beginElement();
    }, 900);
  })();

  // Freeze the corner footer mark's orbiting photon under prefers-reduced-motion —
  // same SMIL-isn't-covered-by-CSS reasoning as the other orbiting marks on the page.
  (function(){
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const orbit = document.getElementById('footerMarkOrbit');
    const pulse = document.getElementById('footerMarkPulse');
    const photon = document.getElementById('footerMarkPhoton');
    const dust = document.getElementById('footerMarkDust');
    if (orbit) orbit.remove();
    if (pulse) pulse.remove();
    if (photon) { photon.setAttribute('cx', '100'); photon.setAttribute('cy', '50'); }
    if (dust) dust.remove();
  })();

  // Click-to-expand profile photo
  (function(){
    const trigger = document.getElementById('portraitRingBtn');
    const img = document.getElementById('portraitImg');
    const box = document.getElementById('portraitLightbox');
    const boxImg = document.getElementById('portraitLightboxImg');
    const closeBtn = document.getElementById('portraitLightboxClose');
    if (!trigger || !box) return;
    function open(){
      boxImg.src = img.src;
      box.classList.add('open');
      box.setAttribute('aria-hidden', 'false');
    }
    function close(){
      box.classList.remove('open');
      box.setAttribute('aria-hidden', 'true');
    }
    trigger.addEventListener('click', open);
    trigger.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    closeBtn.addEventListener('click', close);
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  })();

  // Scroll reveal for section headings, project cards, experience tiles, and a
  // few other card grids — so headings feel less like a static wall of text.
  (function(){
    const items = document.querySelectorAll('.section-head, .project, .exp-tile, .leader-card, .rec-card, .juggle-card, .cert-card');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { items.forEach(i => i.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    items.forEach(i => io.observe(i));
  })();

  // Click-to-expand experience tiles — condensed summary stays visible,
  // clicking (or Enter/Space) reveals the fuller detail paragraph beneath it.
  (function(){
    const tiles = document.querySelectorAll('.exp-tile');
    tiles.forEach(tile => {
      const label = tile.querySelector('.exp-toggle-label');
      function setExpanded(expanded){
        tile.classList.toggle('expanded', expanded);
        tile.setAttribute('aria-expanded', String(expanded));
        if (label) label.firstChild.textContent = expanded ? 'Show less ' : 'Read more ';
      }
      tile.addEventListener('click', () => setExpanded(!tile.classList.contains('expanded')));
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded(!tile.classList.contains('expanded'));
        }
      });
    });
  })();

  // "Show N more roles" — reveals the casual/lower-relevance experience
  // tiles (a short-term admin role, retail, maintenance coordination) that
  // are hidden by default so the IT/cloud-relevant roles lead the grid.
  (function(){
    const btn = document.getElementById('expMoreToggle');
    const grid = document.querySelector('.exp-grid');
    const label = btn ? btn.querySelector('.exp-more-toggle-text') : null;
    if (!btn || !grid) return;
    btn.addEventListener('click', () => {
      const expanded = !grid.classList.contains('show-minor');
      grid.classList.toggle('show-minor', expanded);
      btn.setAttribute('aria-expanded', String(expanded));
      if (label) label.textContent = expanded ? 'Show fewer roles' : 'Show 3 more roles';
    });
  })();

  // Project filters — each .project card declares its own
  // data-categories (space-separated); clicking a chip shows only cards
  // whose categories include it, or everything for "all".
  (function(){
    const filterBar = document.getElementById('projectFilters');
    const list = document.getElementById('projectList');
    const empty = document.getElementById('projectEmpty');
    if (!filterBar || !list) return;
    const buttons = Array.from(filterBar.querySelectorAll('.project-filter'));
    const cards = Array.from(list.querySelectorAll('.project'));

    function applyFilter(filter){
      let visibleCount = 0;
      cards.forEach(card => {
        const cats = (card.getAttribute('data-categories') || '').split(' ');
        const show = filter === 'all' || cats.includes(filter);
        card.classList.toggle('filtered-out', !show);
        if (show) visibleCount++;
      });
      if (empty) empty.classList.toggle('show', visibleCount === 0);
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.getAttribute('data-filter'));
      });
    });
  })();

  // Click-to-expand certification/achievement cards — same pattern as the
  // experience tiles above: title + date always visible, the "why it
  // matters" reason (and team credit, where present) stays collapsed
  // until clicked.
  (function(){
    const cards = document.querySelectorAll('.cert-card');
    cards.forEach(card => {
      const label = card.querySelector('.cert-toggle-label');
      function setExpanded(expanded){
        card.classList.toggle('expanded', expanded);
        card.setAttribute('aria-expanded', String(expanded));
        if (label) label.firstChild.textContent = expanded ? 'Show less ' : 'Read more ';
      }
      card.addEventListener('click', () => setExpanded(!card.classList.contains('expanded')));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded(!card.classList.contains('expanded'));
        }
      });
    });
  })();

  // Ambient starfield — sits behind the whole page (visible wherever a section
  // has no opaque background of its own), a quieter companion to the hero's meteors.
  (function(){
    const canvas = document.getElementById('starfield');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr, stars = [];

    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.02
      }));
    }
    resize();
    window.addEventListener('resize', resize);

    function drawStatic(){
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(231,223,247,0.3)';
        ctx.fill();
      });
    }
    if (reduced){ drawStatic(); return; }

    let t = 0;
    function tick(){
      t++;
      ctx.clearRect(0, 0, w, h);
      stars.forEach(s => {
        const alpha = 0.22 + 0.4 * Math.pow(Math.sin(t * s.speed + s.phase), 2);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(231,223,247,${alpha.toFixed(2)})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    tick();
  })();

  // Built-in FAQ assistant — static keyword matching against her actual resume/site
  // content, no backend or API key involved. Upgrade path to a real LLM later is a
  // separate serverless function if she ever wants that.
  (function(){
    const toggle = document.getElementById('chat-toggle');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const body = document.getElementById('chat-body');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const chips = document.getElementById('chat-chips');
    if (!toggle || !panel) return;

    const faq = [
      { keys: ['stack','skill','tech','language','tool','framework'], a: "Her core stack spans enterprise cloud & systems (Genesys Cloud CX, AWS, Microsoft 365, Google Cloud), IT operations (incident & SLA management, ITSM, Netcool), infrastructure (Windows/Linux, Active Directory, Azure MFA, CyberArk, SailPoint), and programming (COBOL, JCL, Java, SQL, Kotlin, Firebase). See the Skills & Stack section on this page for the full breakdown." },
      { keys: ['visa','sponsor','485','subclass','graduate visa'], a: "She's currently on a Student Visa (Subclass 500) and will transition onto a 485 Temporary Graduate Visa after graduating in December 2026, giving her full working rights in Australia. Happy to talk sponsorship or graduate pathways." },
      { keys: ['relocat','move','melbourne','sydney','brisbane','perth','adelaide','location','based','where is she'], a: "She's based in Melbourne, VIC, and open to relocating anywhere across Australia for the right role." },
      { keys: ['project','built','build','portfolio','birdtag','spotify','esaver','ocr','ielts','cloudpose','kubernetes','docker','pose'], a: "She's built BirdTag (serverless wildlife tagging on AWS), CloudPose (a FastAPI pose-estimation service on a self-built OCI Kubernetes cluster), a statistical analysis of 114K Spotify tracks, ESaver (an Android energy-saving app in Kotlin), a document/OCR extraction pipeline, an IELTS mock exam tool in React, and even this site's own LinkedIn banner generator. Scroll down to Projects for the full writeups." },
      { keys: ['education','degree','university','monash','study','gpa','wam'], a: "She's finishing a Master of Information Technology at Monash University (graduating Dec 2026, 65.7 WAM) and holds a Bachelor of Computer Applications from the University of Madras (First Class)." },
      { keys: ['experience','background','cognizant','work history','career'], a: "3+ years at Cognizant Technology Solutions supporting healthcare platforms for EmblemHealth & ConnectiCare (3.2M members): production support and incident management across multiple countries, plus a contact center transition from Avaya to Genesys Cloud CX. Full timeline is in the Experience section below." },
      { keys: ['baazar','fund\'ex','fundex','digital innovation'], a: "She's currently a Technology & Digital Innovation Intern at Baazar (a Fund'ex venture), supporting digital platform research, software and user testing, data organisation and CRM documentation, and cybersecurity-aware process documentation for an upcoming venture." },
      { keys: ['hr administrative','hew','coo','senior vp','clayton'], a: "She's also a casual HR Administrative Officer (HEW 4, ~10 hrs/week) with the HR Projects team in Monash's Office of the COO & Senior VP at Clayton Campus." },
      { keys: ['mentor','leadership','volunteer','student adviser','advis'], a: "She mentors 40+ postgraduate IT students at Monash, works as a Student Adviser through Monash Student Communities advising 45+ students, and runs IT infrastructure for the Monash Data & AI Society (1,600+ members)." },
      { keys: ['australia','open to','available','job','role','hire','opportunit','internship'], a: "Yes — she's open to IT roles across the board at the grad and entry level (cloud, systems, data, software, support), available part-time now and full-time from December 2026. She's on a Student Visa (Subclass 500) now, moving to a 485 Temporary Graduate Visa after graduating, and open to relocating anywhere across Australia." },
      { keys: ['contact','reach','email','coffee','talk','chat with her','meet'], a: "Best way in is the coffee catch-up scheduler further down this page, or email her directly at rchmadhumitha@gmail.com. She replies fast." },
      { keys: ['astronomy','photon','hobby','fun fact','space','pen name','poetry','writing','poem'], a: "She writes poetry under the pen name \"Female Photon\" on the side, a nod to her science-enthusiast streak. Ask her about it, she loves the topic." }
    ];
    const fallback = "I'm just a lightweight assistant built into this page (no live AI backend), so I don't have a good answer for that one. Try asking about her skills, projects, experience, education, or availability, or email her directly at rchmadhumitha@gmail.com.";

    function answer(question){
      const q = question.toLowerCase();
      const hit = faq.find(f => f.keys.some(k => q.includes(k)));
      return hit ? hit.a : fallback;
    }

    function addMsg(text, who){
      const div = document.createElement('div');
      div.className = `chat-msg ${who}`;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function openPanel(){
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      input.focus();
    }
    function closePanel(){
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => {
      panel.classList.contains('open') ? closePanel() : openPanel();
    });
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

    function ask(text){
      if (!text.trim()) return;
      addMsg(text, 'user');
      setTimeout(() => addMsg(answer(text), 'bot'), 350);
    }

    sendBtn.addEventListener('click', () => { ask(input.value); input.value = ''; });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { ask(input.value); input.value = ''; }
    });
    chips.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => ask(chip.textContent));
    });

    document.getElementById('nav-chat-btn')?.addEventListener('click', () => {
      panel.classList.contains('open') ? closePanel() : openPanel();
    });
  })();

  // Horizontal drag-to-scroll project timeline: mouse drag, native touch scroll,
  // arrow-button nudge, keyboard arrow keys, and a progress line that fills as
  // you scroll through so the "oldest to newest" build history reads at a glance.
  (function(){
    const scroller = document.getElementById('projectTimeline');
    if (!scroller) return;
    const track = scroller.querySelector('.timeline');
    const progress = document.getElementById('timelineProgress');
    const prevBtn = document.getElementById('timelinePrev');
    const nextBtn = document.getElementById('timelineNext');

    function maxScroll(){ return scroller.scrollWidth - scroller.clientWidth; }

    function updateUI(){
      const max = maxScroll();
      const pct = max > 0 ? Math.min(1, Math.max(0, scroller.scrollLeft / max)) : 1;
      if (progress) progress.style.width = (pct * 100) + '%';
      if (prevBtn) prevBtn.disabled = scroller.scrollLeft <= 30;
      if (nextBtn) nextBtn.disabled = scroller.scrollLeft >= max - 2;
    }

    function nudge(dir){
      const item = track?.querySelector('.timeline-item');
      const step = item ? item.getBoundingClientRect().width + 20 : 200;
      scroller.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
    }

    prevBtn?.addEventListener('click', () => nudge(-1));
    nextBtn?.addEventListener('click', () => nudge(1));

    scroller.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1); }
    });

    // Mouse drag-to-scroll (touch already scrolls natively via overflow-x)
    let dragging = false, dragged = false, startX = 0, startScroll = 0;
    scroller.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      dragging = true; dragged = false;
      startX = e.clientX; startScroll = scroller.scrollLeft;
      scroller.classList.add('dragging');
      scroller.setPointerCapture(e.pointerId);
    });
    scroller.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) dragged = true;
      scroller.scrollLeft = startScroll - dx;
    });
    function endDrag(){ dragging = false; scroller.classList.remove('dragging'); }
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    scroller.addEventListener('pointerleave', endDrag);
    // Suppress the click-through navigation when a drag actually moved the track
    scroller.addEventListener('click', (e) => {
      if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; }
    }, true);

    scroller.addEventListener('scroll', updateUI, { passive: true });
    window.addEventListener('resize', updateUI);
    updateUI();
  })();
