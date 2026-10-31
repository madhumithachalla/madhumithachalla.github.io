// © 2026 Madhumitha Challa. All rights reserved.
// This code is hers; shared publicly to be read, not reused as someone else's own.

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
  // "Right now" board: the cards are drawn from data/experience.json, so an update is one edit to that file.
  // Entries whose end month has passed are dropped. The static cards in the HTML are the fallback.
  (function(){
    const grid = document.getElementById('juggleGrid');
    if (!grid || !window.fetch) return;
    fetch('data/experience.json', { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : null))
      .then(items => {
        if (!Array.isArray(items)) return;
        const now = new Date();
        const currentYm = now.getFullYear() * 12 + now.getMonth();
        const live = items.filter(item => {
          if (!item.end) return true;
          const [y, m] = item.end.split('-').map(Number);
          return y * 12 + (m - 1) >= currentYm;
        });
        grid.replaceChildren(...live.map((item, i) => {
          const card = document.createElement('div');
          card.className = 'juggle-card in';
          for (const [cls, text] of [['jc-num', String(i + 1)], ['jc-role', item.role], ['jc-org', item.org], ['jc-since', item.when]]) {
            const span = document.createElement('span');
            span.className = cls;
            span.textContent = text;
            card.appendChild(span);
          }
          return card;
        }));
      })
      .catch(() => {});
  })();

  // "Right now" status readout: a live Melbourne clock plus a ticker that
  // cycles through her actual current roles (read straight from the juggle
  // cards, so it never drifts from data/experience.json), replacing the old
  // static digital-portrait image with something that's actually alive.
  (function(){
    const clock = document.getElementById('juggleClock');
    const ticker = document.getElementById('juggleTicker');
    if (!clock && !ticker) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function tickClock(){
      if (!clock) return;
      const fmt = new Intl.DateTimeFormat('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Australia/Melbourne' });
      clock.textContent = fmt.format(new Date());
    }
    tickClock();
    setInterval(tickClock, 15000);

    if (!ticker) return;
    let idx = 0;
    function cycle(){
      const roles = [...document.querySelectorAll('#juggleGrid .jc-role')].map(el => el.textContent);
      if (!roles.length) return;
      idx = (idx + 1) % roles.length;
      ticker.style.opacity = '0';
      setTimeout(() => {
        ticker.textContent = `Currently: ${roles[idx]}`;
        ticker.style.opacity = '1';
      }, reduced ? 0 : 300);
    }
    if (!reduced) setInterval(cycle, 3200);
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


  // Meteor shower — ambient signature animation in the hero. Also carries its
  // own constellation backdrop (stars + nearest-neighbour link lines), since
  // the hero has its own opaque background and the page-wide #starfield
  // canvas can't show through it.
  (function(){
    const canvas = document.getElementById('meteor-canvas');
    const hero = document.querySelector('.hero');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canvas || !hero) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr, heroStars = [], heroLinks = [];
    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.offsetWidth; h = hero.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = 0;
      heroStars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.02
      }));
      heroLinks = [];
      const maxDist = Math.min(w, h) * 0.1;
      for (let i = 0; i < heroStars.length; i++){
        if (Math.random() > 0.4) continue;
        let best = -1, bestD = maxDist;
        for (let j = 0; j < heroStars.length; j++){
          if (i === j) continue;
          const dx = heroStars[i].x - heroStars[j].x, dy = heroStars[i].y - heroStars[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < bestD){ bestD = d; best = j; }
        }
        if (best !== -1) heroLinks.push([i, best]);
      }
    }
    resize();
    window.addEventListener('resize', resize);

    function drawHeroConstellation(t){
      ctx.save();
      ctx.strokeStyle = 'rgba(155,126,222,0.14)';
      ctx.lineWidth = 1;
      heroLinks.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(heroStars[a].x, heroStars[a].y);
        ctx.lineTo(heroStars[b].x, heroStars[b].y);
        ctx.stroke();
      });
      ctx.restore();
      heroStars.forEach(s => {
        const alpha = t == null ? 0.3 : 0.22 + 0.4 * Math.pow(Math.sin(t * s.speed + s.phase), 2);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(231,223,247,${alpha.toFixed(2)})`;
        ctx.fill();
      });
    }

    if (reduced) { drawHeroConstellation(null); return; }

    const colors = ['255,111,94', '155,126,222', '45,212,191', '245,166,35'];
    let meteors = [];
    let bursts = [];

    function spawnMeteor(){
      const color = colors[Math.floor(Math.random()*colors.length)];
      const startX = Math.random() * w * 0.9;
      meteors.push({
        x: startX, y: -20,
        vx: 3.6 + Math.random()*2,
        vy: 5 + Math.random()*2.5,
        len: 240 + Math.random()*200,
        color,
        life: 1
      });
    }

    let frame = 0;
    function tick(){
      frame++;
      ctx.clearRect(0,0,w,h);
      drawHeroConstellation(frame);

      if (frame % 120 === 0 && meteors.length < 3) spawnMeteor();

      meteors.forEach(m => {
        m.x += m.vx; m.y += m.vy;
        const tailX = m.x - m.vx * (m.len/6);
        const tailY = m.y - m.vy * (m.len/6);
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, `rgba(${m.color},0)`);
        grad.addColorStop(1, `rgba(${m.color},0.9)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(m.x, m.y, 11, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${m.color},0.25)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(m.x, m.y, 4.5, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${m.color},1)`;
        ctx.fill();

        if (m.y > h * 0.72 && m.life === 1){
          m.life = 0;
          bursts.push({x: m.x, y: m.y, r: 2, color: m.color, alpha: 0.9});
        }
      });
      meteors = meteors.filter(m => m.y < h + 40 && m.x < w + 40);

      bursts.forEach(b => {
        b.r += 1.8; b.alpha -= 0.02;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(${b.color},${Math.max(b.alpha,0)})`;
        ctx.lineWidth = 2.2;
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

    // The opening comet (below) is the hit on the photo. Once it lands, the charm settles around the photo.
    [head, tail, e1, e2, flash].forEach(el => el && el.remove());
    function settle(){
      charm.style.transition = 'opacity .5s ease';
      charm.setAttribute('opacity', 1);
      orbit.setAttribute('begin', '0s');
      orbit.beginElement();
    }

    // The intro splash covers the whole screen for a few seconds on load --
    // firing the meteor before it clears meant it hit the portrait while
    // nobody could see it. Wait for the splash to actually finish (with a
    // safety-net timeout in case that event is somehow never dispatched),
    // then give the hero name its own moment first before the meteor hits --
    // splash, then name, then meteor, not all three stacked on each other.
    let fired = false;
    function fireOnce(){ if (fired) return; fired = true; setTimeout(settle, 300); }
    document.addEventListener('comet:done', fireOnce, { once: true });
    setTimeout(fireOnce, 11000);
  })();

  // Opening comet: once the intro splash clears, a large comet streaks in from the
  // top-right and strikes the portrait. The impact throws a shockwave, sparks and a
  // short shake, then the portrait meteor and the hero shower carry on.
  (function(){
    const target = document.querySelector('.portrait-wrap');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!target) return;
    let ran = false;
    function runComet(){
      if (ran) return;
      ran = true;
      if (reduced) { document.dispatchEvent(new Event('comet:done')); return; }

      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'position:fixed; inset:0; width:100vw; height:100vh; pointer-events:none; z-index:250;';
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth, h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rect = target.getBoundingClientRect();
      const tx = rect.left + rect.width / 2, ty = rect.top + rect.height / 2;
      const sx = w + 120, sy = -120;
      const dist = Math.hypot(tx - sx, ty - sy);
      const ux = (tx - sx) / dist, uy = (ty - sy) / dist;
      const headR = Math.max(16, Math.min(w, h) * 0.03);
      const tailLen = Math.max(320, Math.min(w, h) * 0.6);
      const FLY = 1000;
      const SPARK = ['255,255,255', '255,197,107', '255,111,94', '155,126,222'];
      const sparks = [];
      const ringMax = Math.max(w, h) * 0.22;
      let impactAt = null, flash = 0, ring = 0;
      const start = performance.now();

      function drawComet(x, y){
        const tailX = x - ux * tailLen, tailY = y - uy * tailLen;
        const body = ctx.createLinearGradient(x, y, tailX, tailY);
        body.addColorStop(0, 'rgba(255,244,222,0.95)');
        body.addColorStop(0.25, 'rgba(255,197,107,0.6)');
        body.addColorStop(1, 'rgba(255,111,94,0)');
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = body;
        ctx.lineWidth = headR * 1.1;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tailX, tailY); ctx.stroke();
        ctx.lineWidth = headR * 0.35;
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - ux * tailLen * 0.35, y - uy * tailLen * 0.35); ctx.stroke();
        ctx.restore();
        const head = ctx.createRadialGradient(x, y, 0, x, y, headR);
        head.addColorStop(0, 'rgba(255,255,255,1)');
        head.addColorStop(0.45, 'rgba(255,220,160,0.95)');
        head.addColorStop(1, 'rgba(255,111,94,0)');
        ctx.save();
        ctx.shadowColor = 'rgba(255,190,120,0.9)';
        ctx.shadowBlur = 40;
        ctx.fillStyle = head;
        ctx.beginPath(); ctx.arc(x, y, headR, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      function strike(now){
        impactAt = now;
        flash = 1;
        for (let i = 0; i < 90; i++){
          const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 10;
          sparks.push({ x: tx, y: ty, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: 1, c: SPARK[Math.floor(Math.random() * SPARK.length)] });
        }
        if (target.animate) target.animate([
          { transform: 'translate(0,0)' }, { transform: 'translate(-7px,4px)' }, { transform: 'translate(6px,-5px)' },
          { transform: 'translate(-3px,2px)' }, { transform: 'translate(0,0)' }
        ], { duration: 480, easing: 'ease-out' });
      }

      function drawImpact(now){
        if (impactAt === null) return;
        const age = now - impactAt;
        ring = ringMax * (1 - Math.exp(-age / 260));
        const ringA = Math.max(0, 1 - ring / ringMax);
        if (ringA > 0) {
          ctx.beginPath();
          ctx.arc(tx, ty, ring, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,197,107,${(ringA * 0.9).toFixed(3)})`;
          ctx.lineWidth = 2 + 4 * ringA;
          ctx.stroke();
        }
        if (flash > 0.01) {
          ctx.fillStyle = `rgba(255,240,220,${(flash * 0.3).toFixed(3)})`;
          ctx.fillRect(0, 0, w, h);
          flash *= 0.88;
        }
        for (const p of sparks){
          p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.vx *= 0.99; p.life -= 0.018;
          if (p.life <= 0) continue;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2 + 2 * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.c},${p.life.toFixed(2)})`;
          ctx.fill();
        }
        for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].life <= 0) sparks.splice(i, 1);
      }

      function frame(now){
        ctx.clearRect(0, 0, w, h);
        const t = Math.min((now - start) / FLY, 1);
        if (t < 1) {
          const e = t * t;
          drawComet(sx + (tx - sx) * e, sy + (ty - sy) * e);
        } else if (impactAt === null) {
          strike(now);
        }
        drawImpact(now);
        if (impactAt !== null && now - impactAt > 1600) {
          canvas.remove();
          document.dispatchEvent(new Event('comet:done'));
          return;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    document.addEventListener('intro:done', runComet, { once: true });
    setTimeout(runComet, 7000);
  })();

  // Reveal the hero name right as the intro splash clears (it's held back
  // with .pre-reveal only when the splash actually starts, so if the splash
  // never runs for any reason the name was never hidden in the first place).
  (function(){
    const name = document.querySelector('.hero-name');
    if (!name) return;
    function reveal(){
      name.classList.remove('pre-reveal');
      name.classList.add('name-reveal');
    }
    document.addEventListener('intro:done', reveal, { once: true });
    setTimeout(reveal, 6000);
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
    const items = document.querySelectorAll('.section-head, .project, .exp-tile, .leader-card, .rec-card, .juggle-card, .cert-card, .service-card, .writeup-card');
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

    function applyFilter(filter){
      let visibleCount = 0;
      list.querySelectorAll('.project').forEach(card => {
        const cats = (card.getAttribute('data-categories') || '').split(' ');
        const show = filter === 'all' || cats.includes(filter);
        card.classList.toggle('filtered-out', !show);
        if (show) visibleCount++;
      });
      if (empty) empty.classList.toggle('show', visibleCount === 0);
    }

    list.addEventListener('portfolio:updated', () => {
      applyFilter(filterBar.querySelector('.active')?.getAttribute('data-filter') || 'all');
    });

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

  // Ambient deep-sky backdrop, drawn to resemble astronomy photographs: a dark sky with a
  // dust-laced Milky Way band, red hydrogen and teal oxygen nebulae, a dense field of faint
  // stars, and bright stars with diffraction spikes. The static sky is painted once per resize;
  // only the bright stars twinkle.
  (function(){
    const canvas = document.getElementById('starfield');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const TINTS = ['255,255,255', '200,220,255', '255,236,210', '255,205,180'];
    const NEBULA = [[255, 74, 112], [42, 212, 190], [92, 122, 238], [255, 150, 96]];
    let w, h, dpr, sky = null, bright = [];
    const rnd = (a, b) => a + Math.random() * (b - a);

    function paintSky(){
      const off = document.createElement('canvas');
      off.width = Math.round(w * dpr); off.height = Math.round(h * dpr);
      const g = off.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const span = Math.max(w, h);
      const base = g.createRadialGradient(w * .5, h * .42, 0, w * .5, h * .5, span * .8);
      base.addColorStop(0, '#0E0B1E'); base.addColorStop(.6, '#07060F'); base.addColorStop(1, '#030308');
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      // Milky Way band with dark dust lanes running through it
      g.save(); g.translate(w * .5, h * .5); g.rotate(-.55);
      const band = g.createLinearGradient(0, -span * .18, 0, span * .18);
      band.addColorStop(0, 'rgba(120,110,170,0)'); band.addColorStop(.5, 'rgba(150,140,205,.22)'); band.addColorStop(1, 'rgba(120,110,170,0)');
      g.fillStyle = band; g.fillRect(-span * 1.5, -span * 1.5, span * 3, span * 3);
      for (let i = 0; i < 30; i++){
        const x = rnd(-span * .6, span * .6), y = rnd(-span * .04, span * .04), r = rnd(span * .02, span * .07);
        const d = g.createRadialGradient(x, y, 0, x, y, r);
        d.addColorStop(0, 'rgba(3,2,8,.6)'); d.addColorStop(1, 'rgba(3,2,8,0)');
        g.fillStyle = d; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      g.restore();
      // Nebulae: hydrogen red, oxygen teal, dust blue, screened over the sky
      g.globalCompositeOperation = 'screen';
      const count = Math.max(6, Math.round(w * h / 180000));
      for (let i = 0; i < count; i++){
        const [r, gg, b] = NEBULA[i % NEBULA.length];
        const x = rnd(0, w), y = rnd(0, h), rad = span * rnd(.12, .3), a = rnd(.05, .11);
        const c = g.createRadialGradient(x, y, 0, x, y, rad);
        c.addColorStop(0, `rgba(${r},${gg},${b},${a})`); c.addColorStop(.5, `rgba(${r},${gg},${b},${(a * .35).toFixed(3)})`); c.addColorStop(1, `rgba(${r},${gg},${b},0)`);
        g.fillStyle = c; g.fillRect(0, 0, w, h);
      }
      g.globalCompositeOperation = 'source-over';
      // Dense faint field, with more stars along the band
      const field = Math.round(w * h / 1400);
      for (let i = 0; i < field; i++){
        const x = rnd(0, w), y = rnd(0, h);
        const along = Math.abs(((x - w * .5) * Math.sin(-.55) + (y - h * .5) * Math.cos(-.55)) / span);
        if (Math.random() < along * .5) continue;
        g.fillStyle = `rgba(228,224,255,${rnd(.15, .7).toFixed(2)})`;
        g.fillRect(x, y, rnd(.4, 1.1), rnd(.4, 1.1));
      }
      sky = off;
    }

    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintSky();
      bright = Array.from({ length: Math.round(w * h / 32000) + 6 }, () => ({
        x: rnd(0, w), y: rnd(0, h), r: rnd(.9, 1.9), c: TINTS[Math.floor(Math.random() * TINTS.length)],
        ph: rnd(0, 6.28), sp: rnd(.01, .03), spike: Math.random() < .4
      }));
    }

    function drawBright(t){
      bright.forEach(st => {
        const tw = .75 + .25 * Math.sin(t * st.sp + st.ph);
        const glow = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, st.r * 7);
        glow.addColorStop(0, `rgba(${st.c},${(.5 * tw).toFixed(2)})`); glow.addColorStop(1, `rgba(${st.c},0)`);
        ctx.fillStyle = glow; ctx.fillRect(st.x - st.r * 7, st.y - st.r * 7, st.r * 14, st.r * 14);
        ctx.fillStyle = `rgba(${st.c},${tw.toFixed(2)})`;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
        if (st.spike){
          ctx.strokeStyle = `rgba(${st.c},${(.3 * tw).toFixed(2)})`; ctx.lineWidth = .6;
          ctx.beginPath();
          ctx.moveTo(st.x - st.r * 10, st.y); ctx.lineTo(st.x + st.r * 10, st.y);
          ctx.moveTo(st.x, st.y - st.r * 10); ctx.lineTo(st.x, st.y + st.r * 10);
          ctx.stroke();
        }
      });
    }

    function frame(t){
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(sky, 0, 0, w, h);
      drawBright(t);
      if (!reduced) requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);
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
      { keys: ['stack','skill','tech','programming language','coding language','tool','framework'], a: "Her core stack spans enterprise cloud & systems (Genesys Cloud CX, AWS, Microsoft 365, Google Cloud), IT operations (incident & SLA management, ITSM, Netcool), infrastructure (Windows/Linux, Active Directory, Azure MFA, CyberArk, SailPoint), and programming (COBOL, JCL, Java, SQL, Kotlin, Firebase). See the Skills & Stack section on this page for the full breakdown." },
      { keys: ['visa','sponsor','485','subclass','graduate visa'], a: "She's currently on a Student Visa (Subclass 500) and will transition onto a 485 Temporary Graduate Visa after graduating in December 2026, giving her full working rights in Australia. Happy to talk sponsorship or graduate pathways." },
      { keys: ['relocat','move','melbourne','sydney','brisbane','perth','adelaide','location','based','where is she'], a: "She's based in Melbourne, VIC, and open to relocating anywhere across Australia for the right role." },
      { keys: ['project','built','build','portfolio','birdtag','spotify','esaver','ocr','cloudpose','kubernetes','docker','pose','activeclimate','climate','biodatascope','bio-datascope','habitat'], a: "She's built BirdTag (serverless wildlife tagging on AWS), CloudPose (a FastAPI pose-estimation service on a self-built OCI Kubernetes cluster), a statistical analysis of 114K Spotify tracks, ESaver (an Android energy-saving app in Kotlin), ActiveClimate Melbourne (a Vue + Firebase app for community sport and climate impact tracking), Bio-DataScope (a team biodiversity data-gap and habitat-prediction platform for her FIT5120 Industry Experience Studio), a document/OCR extraction pipeline, and even this site's own LinkedIn banner generator. Scroll down to Projects for the full writeups." },
      { keys: ['fit5120','industry experience','bio-datascope details','biodatascope details'], a: "Bio-DataScope is her FIT5120 Industry Experience Studio team project: a platform that maps where a species' occurrence records cluster, flags survey \"data gaps,\" and predicts habitat suitability from trained models (NestJS/PostGIS backend, React/Leaflet frontend, Python/XGBoost models). Her contributions: access control on the data-quality dashboard (plus fixing a spoofable-access bug), account sign-up/login, the Density & Gaps live API integration, the predictive habitat-suitability report with PDF export, the species sighting timeline chart, and several accessibility and UX fixes (colour-blind-safe suitability scale, off-window tooltip, unreachable modal button)." },
      { keys: ['education','degree','university','monash','study','gpa','wam'], a: "She's finishing a Master of Information Technology at Monash University (graduating Dec 2026, 65.7 WAM) and holds a Bachelor of Computer Applications from the University of Madras (First Class)." },
      { keys: ['experience','background','cognizant','work history','career'], a: "3+ years at Cognizant Technology Solutions supporting healthcare platforms for EmblemHealth & ConnectiCare (3.2M members): production support and incident management across multiple countries, plus a contact center transition from Avaya to Genesys Cloud CX. Full timeline is in the Experience section below." },
      { keys: ['baazar','fund\'ex','fundex','digital innovation'], a: "She was a Technology & Digital Innovation Intern at Baazar (a Fund'ex venture) from Sep to Oct 2026, supporting digital platform research, software and user testing, data organisation and CRM documentation, and cybersecurity-aware process documentation for an upcoming venture." },
      { keys: ['hr administrative','hew','coo','senior vp','clayton'], a: "She's also a casual HR Administrative Officer (HEW 4, ~10 hrs/week) with the HR Projects team in Monash's Office of the COO & Senior VP at Clayton Campus." },
      { keys: ['mentor','leadership','volunteer','student adviser','advis'], a: "She mentored 40+ postgraduate IT students at Monash (Jan–Oct 2026), works as a Student Adviser through Monash Student Communities advising 45+ students, and volunteers as Microsoft 365 Administrator for Basava Samiti of Asia Pacific. She also previously ran IT infrastructure for the Monash Data & AI Society (1,600+ members) for a committee term." },
      { keys: ['australia','open to','available','job','role','opportunit','internship'], a: "Yes — she's open to IT roles across the board at the grad and entry level (cloud, systems, data, software, support), available part-time now and full-time from December 2026. She's on a Student Visa (Subclass 500) now, moving to a 485 Temporary Graduate Visa after graduating, and open to relocating anywhere across Australia." },
      { keys: ['contact','reach','email','talk','meet'], a: "Best way in is the coffee catch-up scheduler further down this page, or email her directly at rchmadhumitha@gmail.com. She replies fast. Ask me \"how do I schedule\" for the exact options." },
      { keys: ['service','collaborat','freelance','consult','hire her for','work together'], a: "She offers mentoring & peer advising, IT/Microsoft 365 administration, technical documentation & SOPs, portfolio/resume/interview review, small web builds, and cloud & IT operations support. See the Services section on this page for the full list, or just email rchmadhumitha@gmail.com with what you need." },
      { keys: ['astronomy','photon','hobby','fun fact','space','pen name','poetry','writing','poem','medium','writeup'], a: "She writes poetry under the pen name \"Female Photon\" on the side, a nod to her science-enthusiast streak — pieces like \"Plea\" (a tech-support shift as a metaphor for vulnerability and love) and \"Echoes in Winds\" on Medium, plus an entry in the MSA 2026 Poetry Competition. See the Writeups section on this page for all of it, plus her LinkedIn articles." },
      { keys: ['certif','award','aws ccp','cloud practitioner','sapphire','amber','csat'], a: "AWS Certified Cloud Practitioner, plus IT Help Desk for Beginners and Agile Fundamentals (Scrum) from LinkedIn Learning/Udemy. From her time at Cognizant: the Cheers Sapphire and Amber awards (peer-nominated for technical excellence and professional growth) and CSAT Champion for a 100 customer-satisfaction score. Full list is in the Certifications section below." },
      { keys: ['linkedin','github','profile','social','find her online'], a: "GitHub: github.com/madhumithachalla — LinkedIn: linkedin.com/in/madhumitha-challa. Both linked in the footer of this page too." },
      { keys: ['resume','cv','download'], a: "Yes — PDF and DOCX versions are both linked right at the top of this page, next to \"View Projects.\"" },
      { keys: ['why hire','why should','strength','what makes her','unique','stand out','different'], a: "Three years of real production support on systems serving 3.2M members, now paired with hands-on cloud/dev work she builds and ships herself (not just coursework) — most of the projects on this page have a live demo, not just a writeup. She also juggled multiple roles at once (mentoring, advising, IT admin, study) without dropping any of them, which says something about reliability under load." },
      { keys: ['notice period','start date','when can she start','availability date'], a: "She's available part-time now, alongside her studies, and full-time from December 2026 once she graduates." },
      { keys: ['salary','pay','rate','compensation','expect to be paid'], a: "That's a conversation best had directly — email her at rchmadhumitha@gmail.com or grab a coffee catch-up slot below and she'll talk specifics." },
      { keys: ['remote','hybrid','wfh','work from home','onsite','in office'], a: "Open to remote, hybrid, or onsite — whatever the role needs. She's also open to relocating anywhere across Australia." },
      { keys: ['telugu','tamil','hindi','speak','languages does she speak','multilingual'], a: "English, Telugu, Tamil, and Hindi." },
      { keys: ['team player','collaborat','work with others','teamwork'], a: "Most of her project work is solo, but BirdTag, CloudPose's team context, ESaver, and CliMaze were all team builds — each card on this page is explicit about which parts were actually hers versus a teammate's. She also currently mentors 40+ students and advises 45+ more, so cross-team coordination is a daily thing, not a rare one." },
      { keys: ['favorite project','proudest','best project','which project'], a: "She doesn't single one out, but CliMaze (built for a COP31 food-waste competition as team lead) and ColorCompass (a from-scratch HSL colour-theory engine, not just an API wrapper) are the two she'd point to first. Worth asking her directly though — she has opinions." },
      { keys: ['cobol','jcl','mainframe','career change','journey','started out','programmer analyst'], a: "She started as a Programmer Analyst Trainee at Cognizant in 2021 maintaining COBOL and JCL on mainframe systems, then moved into SLA-driven production support and incident management, and from there into cloud and systems engineering. Full story's in the About section above." },
      { keys: ['sing','singing','music'], a: "She sings on the side, alongside the poetry — jack of all trades, as the hero section puts it." },
      { keys: ['genesys','call center','contact center','avaya','telephony'], a: "She led a contact centre platform transition from Avaya to Genesys Cloud CX at Cognizant, across multiple countries, alongside her production-support work." },
      { keys: ['python','java','kotlin','sql','coding language','programming language','code in'], a: "Kotlin (Android, in ESaver and FocusLens), Python (CloudPose, the OCR pipeline), SQL, Java, JavaScript, R, and COBOL/JCL from her mainframe background. See Skills & Stack for the complete list." },
      { keys: ['this site','portfolio built','how was this made','claude','ai build','vibe cod'], a: "This site is hand-coded HTML/CSS/JS with no framework — she built it herself, project card by project card, with some AI-assisted iteration along the way. It's actually one of the projects listed below (\"Portfolio site: hand-coded, framework-free\")." },
      { keys: ['schedule','book','calendly','calendar','catch-up','catch up','booking','how to meet','set up a call','set up a chat'], a: "Scroll down to the Coffee section — pick a time straight off her real open calendar, in person around Melbourne or virtual, no back-and-forth emailing. Three lengths once you're in: a 15-min Quick Intro, a 20-min Coffee & Code, or a 30-min Deep Dive. Prefer email instead? There's a pre-filled \"send me one directly\" link right there too, or just email rchmadhumitha@gmail.com." },
      { keys: ['birdtag details','cognito','identity and access','api gateway'], a: "On BirdTag she owned identity and access end to end: designed and configured Cognito authentication, then wired it into API Gateway authorizers across every protected route with CORS handled properly. She also independently built species search, tag editing, file deletion, and secure signed-upload functions, plus co-built the core tag-query function with a teammate." },
      { keys: ['cloudpose details','kubernetes details','kubeadm','oci vcn','self-built cluster'], a: "CloudPose started as a Monash assignment, but she rebuilt and extended it well past what the assignment asked for: the model now loads once at startup instead of per-request, a batch endpoint processes up to 32 images concurrently, and she manually configured an OCI VCN and built a 3-VM Kubernetes cluster from scratch with kubeadm (no managed Kubernetes offering), then load-tested it with Locust." },
      { keys: ['colorcompass details','hsl','colour wheel','seasonal analysis'], a: "ColorCompass does real seasonal colour analysis from scratch: it converts sampled skin/hair pixels to actual HSL colour-wheel coordinates and classifies into one of the 12 standard seasonal categories. Worth noting: her first pass used a generic half-wheel warm/cool split and it was wrong — real skin tones cluster in a narrow hue band, so that split called everyone \"warm.\" She caught it, rebuilt it with a skin-tone-calibrated threshold instead." },
      { keys: ['issue','challenge','obstacle','difficult','hardest part','problem she faced','mistake','went wrong','failure'], a: "A concrete one: building ColorCompass's colour classifier, her first warm/cool split used a generic 90°-half division of the colour wheel — technically reasonable-sounding, but wrong for skin tones specifically, since real skin hues all cluster in one narrow band. It made every test case come back \"warm.\" She caught it through actual testing (not just assuming the math was right) and rebuilt it with a calibrated threshold. More broadly: she's juggled multiple roles at once (Monash studies, mentoring 40+ students, advising 45+ more, part-time IT/HR work) — the real challenge there is just disciplined prioritisation, not any one dramatic problem." }
    ];
    const fallback = "I'm just a lightweight assistant built into this page (no live AI backend), so I don't have a good answer for that one. Try one of these instead, or email her directly at rchmadhumitha@gmail.com:";
    const fallbackChips = ["What's her stack?", "Is she open to roles in Australia?", "Tell me about her projects", "Why should we hire her?"];

    // Small talk that shouldn't fall through to the FAQ matcher or the
    // "I don't have an answer" fallback — greetings, thanks, and the
    // inevitable "are you real AI" question all get a direct, honest reply.
    const smallTalk = [
      { keys: ['thank','thanks','thx','cheers'], a: "You're welcome! Anything else you'd like to know about her?" },
      { keys: ['are you ai','are you a bot','are you real','is this ai','chatgpt','are you human'], a: "I'm a lightweight built-in assistant — simple keyword matching against her real resume and project content, no live AI backend or API key involved. Ask away, I just might not catch an oddly-phrased question." },
      { keys: ['who are you', 'what are you'], a: "I'm a quick built-in FAQ assistant for this page — ask me about Madhumitha's skills, projects, experience, services, or availability." },
      { keys: ['hello', 'hi there', 'hiya', 'hey there', 'good morning', 'good afternoon', 'good evening'], a: "Hi! Ask me anything about Madhumitha's skills, projects, experience, services, or availability." }
    ];
    // Bare "hi"/"hey"/"hello" only count as a greeting when they're the
    // whole message — otherwise "hi, is she built a kubernetes thing?"
    // would get a greeting reply instead of a real answer.
    function isBareGreeting(q){
      return /^(hi|hey|hello|yo|sup)[!.? ]*$/.test(q.trim());
    }

    // Picks the best match, not just the first one in array order: a longer,
    // more specific keyword (e.g. "cloudpose details") should win over a
    // shorter generic one (e.g. "project") even if the generic entry comes
    // first in the list.
    function answer(question){
      const q = question.toLowerCase();
      if (isBareGreeting(q)) return { text: smallTalk[3].a, matched: true };
      const smallHit = smallTalk.find(f => f.keys.some(k => q.includes(k)));
      if (smallHit) return { text: smallHit.a, matched: true };
      let best = null, bestLen = 0;
      faq.forEach(f => {
        f.keys.forEach(k => {
          if (q.includes(k) && k.length > bestLen){ best = f; bestLen = k.length; }
        });
      });
      return best ? { text: best.a, matched: true } : { text: fallback, matched: false };
    }

    const avatar = document.getElementById('chatAvatar');

    function addMsg(text, who){
      const div = document.createElement('div');
      div.className = `chat-msg ${who}`;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      if (who === 'bot' && avatar){
        avatar.classList.add('talking');
        const talkMs = Math.min(3200, Math.max(900, text.length * 22));
        setTimeout(() => avatar.classList.remove('talking'), talkMs);
      }
      return div;
    }

    // A quick nod from the avatar the instant a message is sent, so sending
    // feels acknowledged even before the reply arrives, plus a "typing"
    // bubble while she (the bot) is "composing" the actual answer.
    function showTyping(){
      const div = document.createElement('div');
      div.className = 'chat-msg bot chat-typing';
      div.innerHTML = '<span></span><span></span><span></span>';
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      return div;
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

    // Follow-up suggestion chips shown under a fallback reply, so a miss
    // isn't a dead end — same clickable chip pattern as the starter ones.
    function showSuggestions(){
      const row = document.createElement('div');
      row.className = 'chat-msg bot chat-suggestions';
      fallbackChips.forEach(text => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chat-chip';
        btn.textContent = text;
        btn.addEventListener('click', () => ask(text));
        row.appendChild(btn);
      });
      body.appendChild(row);
      body.scrollTop = body.scrollHeight;
    }

    function ask(text){
      if (!text.trim()) return;
      addMsg(text, 'user');
      if (avatar){
        avatar.classList.add('nodded');
        setTimeout(() => avatar.classList.remove('nodded'), 420);
      }
      sendBtn.classList.add('sent');
      setTimeout(() => sendBtn.classList.remove('sent'), 300);
      const typingEl = showTyping();
      setTimeout(() => {
        typingEl.remove();
        const result = answer(text);
        addMsg(result.text, 'bot');
        if (!result.matched) showSuggestions();
      }, 650);
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

  // Project card "Read more" expand/collapse: keeps each card's visible
  // summary short, with the fuller description and bullets revealed on
  // demand. Delegated on .project-list so it also covers cards added later
  // by portfolio-sync.js.
  (function(){
    const list = document.getElementById('projectList');
    if (!list) return;
    function toggle(btn){
      const more = btn.previousElementSibling;
      if (!more || !more.classList.contains('project-more')) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      more.hidden = expanded;
      btn.setAttribute('aria-expanded', String(!expanded));
      const collapsedLabel = btn.dataset.collapsedLabel || 'Read more';
      const expandedLabel = btn.dataset.expandedLabel || 'Show less';
      btn.textContent = expanded ? collapsedLabel : expandedLabel;
    }
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.project-expand');
      if (btn) toggle(btn);
    });

    // Landing on a specific project — from the map, a nav link, or any
    // #proj-x link elsewhere on the page — should actually show you that
    // project, not just scroll near it: open its "Read more" detail and
    // settle the scroll position under the sticky nav, not half behind it.
    function goToProject(id){
      const card = document.getElementById(id);
      if (!card || !card.classList.contains('project')) return;
      const btn = card.querySelector('.project-expand');
      if (btn && btn.getAttribute('aria-expanded') !== 'true') toggle(btn);
      requestAnimationFrame(() => {
        const nav = document.querySelector('header.nav');
        const offset = (nav ? nav.getBoundingClientRect().height : 0) + 16;
        const top = card.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      });
    }
    function handleHash(){
      const id = location.hash.slice(1);
      if (id.startsWith('proj-')) goToProject(id);
    }
    window.addEventListener('hashchange', handleHash);
    if (location.hash) setTimeout(handleHash, 300);
  })();

  // Mobile-view preview: loads the current page inside a real iframe at
  // phone width, so the page's own @media breakpoints apply for real
  // (a resized container alone won't trigger them) instead of faking it
  // with a CSS transform. A query flag stops the preview itself from
  // offering a preview-within-a-preview.
  (function(){
    const btn = document.getElementById('device-view-btn');
    const overlay = document.getElementById('device-preview');
    const closeBtn = document.getElementById('device-preview-close');
    const frame = document.getElementById('device-preview-iframe');
    if (!btn || !overlay || !frame) return;

    if (new URLSearchParams(location.search).get('deviceview') === 'mobile'){
      btn.style.display = 'none';
      return;
    }

    function openPreview(){
      const url = new URL(location.href);
      url.searchParams.set('deviceview', 'mobile');
      frame.src = url.toString();
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      btn.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closePreview(){
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      btn.classList.remove('active');
      document.body.style.overflow = '';
      frame.src = 'about:blank';
    }

    btn.addEventListener('click', openPreview);
    closeBtn?.addEventListener('click', closePreview);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePreview(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closePreview(); });
  })();

  // Size the nav logo's soft backdrop glow to the real bounding box of the
  // hand-traced M/C letters, so it sits centered behind them regardless of
  // the exact path geometry.
  (function(){
    const letters = document.querySelector('.mc-letters');
    const backdrop = document.getElementById('mcBackdrop');
    if (!letters || !backdrop || !letters.getBBox) return;
    try {
      const box = letters.getBBox();
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      const rx = box.width / 2 + 60;
      const ry = box.height / 2 + 50;
      backdrop.setAttribute('cx', cx);
      backdrop.setAttribute('cy', cy);
      backdrop.setAttribute('rx', rx);
      backdrop.setAttribute('ry', ry);
    } catch (e) {}
  })();

  // Intro splash: clones the real nav logo into a big centered overlay on
  // load, lets its draw-in sequence play out, then docks it into the real
  // badge's measured position/size and fades it, revealing the small
  // corner logo already settled in place.
  (function(){
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.dispatchEvent(new Event('intro:done'));
      return;
    }
    const overlay = document.getElementById('logoIntro');
    const inner = overlay?.querySelector('.logo-intro-inner');
    const realBadge = document.querySelector('.nav-logo-badge');
    if (!overlay || !inner || !realBadge) {
      document.dispatchEvent(new Event('intro:done'));
      return;
    }

    const clone = realBadge.cloneNode(true);
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    // The splash shows just the loop and initials — no cosmic/planet
    // backdrop, kept for the small corner badge only.
    clone.querySelector('.nav-cosmic-bg')?.remove();
    inner.appendChild(clone);
    document.body.classList.add('intro-playing');
    document.querySelector('.hero-name')?.classList.add('pre-reveal');

    setTimeout(() => {
      const realRect = realBadge.getBoundingClientRect();
      const introRect = inner.getBoundingClientRect();
      if (realRect.width === 0 || introRect.width === 0){
        overlay.remove();
        document.body.classList.remove('intro-playing');
        document.dispatchEvent(new Event('intro:done'));
        return;
      }
      const dx = (realRect.left + realRect.width / 2) - (introRect.left + introRect.width / 2);
      const dy = (realRect.top + realRect.height / 2) - (introRect.top + introRect.height / 2);
      const scale = realRect.width / introRect.width;
      inner.style.setProperty('--dock-x', dx + 'px');
      inner.style.setProperty('--dock-y', dy + 'px');
      inner.style.setProperty('--dock-scale', scale);
      inner.classList.add('leaving');
      overlay.classList.add('leaving');
      document.body.classList.remove('intro-playing');
      setTimeout(() => { overlay.remove(); document.dispatchEvent(new Event('intro:done')); }, 1000);
    }, 3900);
  })();

  // Date badges on the project cards themselves — the map already knows
  // when each project ran (its pin's aria-label), so read that back onto
  // the matching card instead of hand-duplicating every date a second
  // time. The one card with no pin (still upcoming) gets an honest
  // "no fixed date yet" badge instead.
  (function(){
    const list = document.getElementById('projectList');
    const pins = document.querySelectorAll('.gpin[href^="#proj-"]');
    if (!list) return;
    const dates = new Map();
    pins.forEach(pin => {
      const id = pin.getAttribute('href').slice(1);
      const label = pin.getAttribute('aria-label') || '';
      const when = label.split(',').slice(1).join(',').trim();
      if (when) dates.set(id, when);
    });
    list.querySelectorAll('.project[id]').forEach(card => {
      const top = card.querySelector('.project-top');
      if (!top || top.querySelector('.pill-date')) return;
      const when = dates.get(card.id) || (card.classList.contains('upcoming') ? 'No fixed date yet' : '');
      if (!when) return;
      const span = document.createElement('span');
      span.className = 'pill pill-date mono';
      span.style.cssText = 'color:var(--slate);border-color:var(--line);';
      span.textContent = when;
      top.appendChild(span);
    });
  })();

  // Project map: zoom with the buttons or Ctrl/Cmd and the scroll wheel, a time ruler that
  // shows only the places active in the months you pick, a search box that filters by name,
  // and clicking a place (pin or chip) pans the map to it with a brief highlight before
  // following the link down to the project card.
  (function(){
    const scroller = document.querySelector('.gmap-scroll');
    const svg = scroller && scroller.querySelector('svg');
    const from = document.getElementById('timeFrom');
    const to = document.getElementById('timeTo');
    const search = document.getElementById('mapSearch');
    if (!scroller || !svg || !from || !to) return;
    const BASE_W = 2440, PAD_L = 190, MW = 110, LAST = 18;
    const MONTHS = ['Apr 2025','May 2025','Jun 2025','Jul 2025','Aug 2025','Sep 2025','Oct 2025','Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026','Apr 2026','May 2026','Jun 2026','Jul 2026','Aug 2026','Sep 2026','Oct 2026'];
    const pins = [...svg.querySelectorAll('.gpin')];
    const chips = [...document.querySelectorAll('.gmap-chips li')];
    const brush = document.getElementById('timeBrush');
    const readout = document.getElementById('timeReadout');
    const zoomReadout = document.getElementById('zoomReadout');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let zoom = 1;
    let query = '';

    function pinName(pin){
      const label = pin.getAttribute('aria-label') || '';
      return label.split(',')[0].trim();
    }
    function matchesQuery(name){
      return !query || name.toLowerCase().includes(query);
    }

    function setZoom(z, focus = 0.5){
      const before = zoom;
      zoom = Math.min(2.4, Math.max(0.6, z));
      const anchor = (scroller.scrollLeft + scroller.clientWidth * focus) / before;
      svg.style.width = (BASE_W * zoom) + 'px';
      scroller.scrollLeft = anchor * zoom - scroller.clientWidth * focus;
      zoomReadout.textContent = Math.round(zoom * 100) + '%';
    }
    scroller.addEventListener('wheel', e => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const r = scroller.getBoundingClientRect();
      setZoom(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15), (e.clientX - r.left) / r.width);
    }, { passive: false });
    document.getElementById('zoomIn')?.addEventListener('click', () => setZoom(zoom * 1.25));
    document.getElementById('zoomOut')?.addEventListener('click', () => setZoom(zoom / 1.25));
    document.getElementById('zoomReset')?.addEventListener('click', () => setZoom(1));

    // Pans the scroller so a given pin sits centered, and gives it a brief
    // glowing pulse so it's obvious which place just got selected.
    function panToPin(pin, opts){
      const g = pin.querySelector('g');
      const m = g && g.getAttribute('transform').match(/translate\(([\d.]+),([\d.]+)\)/);
      if (m) {
        const x = parseFloat(m[1]);
        scroller.scrollTo({ left: Math.max(0, x * zoom - scroller.clientWidth / 2), behavior: reduced ? 'auto' : 'smooth' });
      }
      pin.classList.remove('gpin-highlight');
      void pin.offsetWidth;
      pin.classList.add('gpin-highlight');
      setTimeout(() => pin.classList.remove('gpin-highlight'), 1400);
      if (opts && opts.thenFollow) {
        setTimeout(() => { window.location.hash = pin.getAttribute('href'); }, reduced ? 0 : 650);
      }
    }
    // Any click on a place (map pin or sidebar chip) pans + highlights first,
    // then still follows the link down to the full project card.
    function wireNavigate(el, pin){
      el.addEventListener('click', e => {
        e.preventDefault();
        panToPin(pin, { thenFollow: true });
      });
    }
    pins.forEach(pin => wireNavigate(pin, pin));
    chips.forEach(li => {
      const a = li.querySelector('a');
      const pin = pins.find(p => p.getAttribute('href') === a?.getAttribute('href'));
      if (a && pin) wireNavigate(a, pin);
    });

    function applyRange(scrollToStart){
      let a = +from.value, b = +to.value;
      if (a > b) [a, b] = [b, a];
      let shown = 0;
      pins.forEach(pin => {
        const inRange = +pin.dataset.start <= b && +pin.dataset.end >= a;
        const inSearch = matchesQuery(pinName(pin));
        const on = inRange && inSearch;
        const wasOn = !pin.classList.contains('is-off');
        pin.classList.toggle('is-off', !on);
        // A place that just came into range lights up with the same glow
        // pins get when you search or click one, so moving the scale
        // visibly "turns on" the places it reveals.
        if (on && !wasOn && scrollToStart) {
          pin.classList.remove('gpin-highlight');
          void pin.offsetWidth;
          pin.classList.add('gpin-highlight');
          setTimeout(() => pin.classList.remove('gpin-highlight'), 1400);
        }
        if (on) shown++;
      });
      chips.forEach(li => {
        const a2 = li.querySelector('a');
        const name = a2 ? a2.textContent.split(',')[0].trim() : '';
        li.hidden = !((+li.dataset.start <= b && +li.dataset.end >= a) && matchesQuery(name));
      });
      brush.style.left = (a / LAST * 100) + '%';
      brush.style.width = ((b - a) / LAST * 100) + '%';
      readout.textContent = `${MONTHS[a]} to ${MONTHS[b]} · ${shown} of ${pins.length} places`;
      if (scrollToStart) scroller.scrollTo({ left: Math.max(0, (PAD_L + a * MW) * zoom - 120), behavior: reduced ? 'auto' : 'smooth' });
    }
    from.addEventListener('input', () => applyRange(true));
    to.addEventListener('input', () => applyRange(true));
    document.getElementById('timeReset')?.addEventListener('click', () => { from.value = 0; to.value = LAST; applyRange(true); });

    if (search) {
      search.addEventListener('input', () => {
        query = search.value.trim().toLowerCase();
        applyRange(false);
        if (!query) return;
        const match = pins.find(pin => !pin.classList.contains('is-off') && matchesQuery(pinName(pin)));
        if (match) panToPin(match);
      });
    }
    applyRange(false);
  })();
