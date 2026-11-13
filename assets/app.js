const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const defaultProfile = {
  name: "Md Hasan Imam Shihab",
  short_name: "Md Hasan Imam Shihab",
  title: "PhD Student in Computer Science",
  affiliation: "Indiana University",
  email: "h.imamshihab@gmail.com",
  location: "Bloomington, Indiana, USA",
  google_scholar_id: "YOUR_SCHOLAR_ID",
  github_username: "YOUR_GITHUB_USERNAME",
  linkedin_username: "YOUR_LINKEDIN_USERNAME",
  cv_url: "#contact",
  research_focus: [],
  education: [],
  projects: [],
  skills: []
};

let allPublications = [];
let revealObserver;

async function loadJSON(path, fallback) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(error);
    return fallback;
  }
}

function scholarUrl(profile) {
  if (profile.google_scholar_id && profile.google_scholar_id !== "YOUR_SCHOLAR_ID") {
    return `https://scholar.google.com/citations?user=${encodeURIComponent(profile.google_scholar_id)}`;
  }
  return "https://scholar.google.com/";
}

function hydrateProfile(profile) {
  $$('[data-profile]').forEach((node) => {
    const key = node.dataset.profile;
    if (profile[key]) node.textContent = profile[key];
  });

  $$('[data-link="email"]').forEach((node) => {
    node.href = `mailto:${profile.email}`;
  });
  $$('[data-link="scholar"]').forEach((node) => {
    node.href = scholarUrl(profile);
  });
  $$('[data-link="github"]').forEach((node) => {
    node.href = profile.github_username && profile.github_username !== "YOUR_GITHUB_USERNAME"
      ? `https://github.com/${profile.github_username}`
      : "https://github.com/";
  });
  $$('[data-link="linkedin"]').forEach((node) => {
    node.href = profile.linkedin_username && profile.linkedin_username !== "YOUR_LINKEDIN_USERNAME"
      ? `https://www.linkedin.com/in/${profile.linkedin_username}`
      : "https://www.linkedin.com/";
  });

  const educationList = $('#education-list');
  educationList.innerHTML = profile.education.map((item) => `
    <article class="timeline-item">
      <span>${escapeHTML(item.years || '')}</span>
      <h3>${escapeHTML(item.degree || '')}</h3>
      <p><strong>${escapeHTML(item.institution || '')}</strong>${item.details ? ` — ${escapeHTML(item.details)}` : ''}</p>
    </article>
  `).join('');

  const focusGrid = $('#research-focus');
  focusGrid.innerHTML = profile.research_focus.map((item, index) => `
    <article class="focus-card">
      <span class="focus-number">0${index + 1}</span>
      <h3>${escapeHTML(item)}</h3>
    </article>
  `).join('');

  const projectList = $('#project-list');
  projectList.innerHTML = profile.projects.map((project) => `
    <article class="project-card">
      <h3>${escapeHTML(project.title)}</h3>
      <p>${escapeHTML(project.summary || '')}</p>
      <div class="tag-row">${(project.tags || []).map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}</div>
    </article>
  `).join('');

  const skillList = $('#skill-list');
  skillList.innerHTML = profile.skills.map((skill) => `<span class="chip">${escapeHTML(skill)}</span>`).join('');
}

function renderPublications(publications) {
  const list = $('#publication-list');
  if (!publications.length) {
    list.innerHTML = '<article class="publication-item"><div><h3>No publications are available yet.</h3><p>The Google Scholar synchronization has not returned any publication data.</p></div></article>';
    registerRevealElements(list);
    return;
  }

  list.innerHTML = publications
    .sort((a, b) => String(b.year || '').localeCompare(String(a.year || '')))
    .map((pub) => `
      <article class="publication-item">
        <div>
          <h3>${pub.url ? `<a href="${escapeAttribute(pub.url)}" target="_blank" rel="noopener">${escapeHTML(pub.title || 'Untitled publication')}</a>` : escapeHTML(pub.title || 'Untitled publication')}</h3>
          <p class="pub-meta">${escapeHTML(pub.authors || '')}${pub.venue ? ` · <em>${escapeHTML(pub.venue)}</em>` : ''}</p>
          ${pub.note ? `<p class="pub-note">${escapeHTML(pub.note)}</p>` : ''}
        </div>
        <span class="year-badge">${escapeHTML(pub.year || '—')}</span>
      </article>
    `).join('');
  registerRevealElements(list);
}

function filterPublications() {
  const query = $('#publication-search').value.trim().toLowerCase();
  if (!query) return renderPublications(allPublications);
  const filtered = allPublications.filter((pub) => [pub.title, pub.authors, pub.venue, pub.year, pub.note]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(query));
  renderPublications(filtered);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function escapeAttribute(value) {
  return escapeHTML(value).replace(/`/g, '&#96;');
}

function registerRevealElements(root = document) {
  const selector = '.section-heading, .brain-lab-intro, .brain-stage, .metric-card, .timeline-item, .focus-card, .publication-item, .project-card, .skills-section .chip-cloud, .contact-card';
  $$(selector, root).forEach((node, index) => {
    if (!node.classList.contains('reveal')) {
      node.classList.add('reveal');
      node.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 80}ms`);
    }
    if (revealObserver && !node.classList.contains('is-visible')) revealObserver.observe(node);
  });
}

function setupRevealAnimations() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    registerRevealElements();
    $$('.reveal').forEach((node) => node.classList.add('is-visible'));
    return;
  }

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

  registerRevealElements();
}

function setupProfileParallax() {
  const card = $('.profile-card');
  if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * -8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    card.style.setProperty('--portrait-x', `${x.toFixed(2)}px`);
    card.style.setProperty('--portrait-y', `${y.toFixed(2)}px`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--portrait-x', '0px');
    card.style.setProperty('--portrait-y', '0px');
  });
}

function setupResearchField() {
  const canvas = $('#research-field');
  const hero = $('.hero');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (!canvas || !hero || reduceMotion || saveData) return;

  const context = canvas.getContext('2d');
  const colors = ['20, 127, 147', '46, 119, 155', '214, 126, 75'];
  let width = 0;
  let height = 0;
  let nodes = [];
  let frameId = 0;
  let active = true;
  const pointer = { x: 0, y: 0, active: false };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(24, Math.min(54, Math.round(width / 25)));
    nodes = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      radius: index % 9 === 0 ? 3.8 : 1.8 + Math.random() * 1.6,
      color: colors[index % colors.length],
      phase: Math.random() * Math.PI * 2
    }));
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    const maxDistance = Math.min(145, width * 0.16);

    nodes.forEach((node, index) => {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < -10 || node.x > width + 10) node.vx *= -1;
      if (node.y < -10 || node.y > height + 10) node.vy *= -1;

      if (pointer.active) {
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 170 && distance > 0) {
          node.x -= (dx / distance) * 0.08;
          node.y -= (dy / distance) * 0.08;
        }
      }

      for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
        const other = nodes[otherIndex];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance >= maxDistance) continue;
        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(${node.color}, ${(1 - distance / maxDistance) * 0.29})`;
        context.lineWidth = 1;
        context.stroke();
      }

      const pulse = 0.82 + Math.sin(time * 0.0012 + node.phase) * 0.18;
      if (index % 9 === 0) {
        context.beginPath();
        context.arc(node.x, node.y, 9 + Math.sin(time * 0.0015 + node.phase) * 3, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${node.color}, 0.24)`;
        context.lineWidth = 1;
        context.stroke();
      }
      context.beginPath();
      context.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
      context.fillStyle = `rgba(${node.color}, ${index % 9 === 0 ? 1 : 0.82})`;
      context.shadowColor = `rgba(${node.color}, 0.62)`;
      context.shadowBlur = index % 9 === 0 ? 18 : 9;
      context.fill();
      context.shadowBlur = 0;
    });

    if (active) frameId = requestAnimationFrame(draw);
  }

  hero.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });
  hero.addEventListener('pointerleave', () => { pointer.active = false; });

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    const nextActive = entry.isIntersecting;
    if (nextActive === active) return;
    active = nextActive;
    cancelAnimationFrame(frameId);
    if (active) frameId = requestAnimationFrame(draw);
  });
  visibilityObserver.observe(hero);

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();
  frameId = requestAnimationFrame(draw);
}

function setupBrainExplorer() {
  const panel = $('.brain-lab');
  if (!panel) return;

  const stage = $('.brain-stage', panel);
  const buttons = $$('[data-brain-mode]', panel);
  const layers = $$('[data-brain-layer]', panel);
  const title = $('#brain-mode-title');
  const description = $('#brain-mode-description');
  const stageLabel = $('#brain-stage-label');
  const scanCode = $('#brain-scan-code');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const modes = {
    fmri: {
      title: 'Resting-state functional connectivity',
      description: 'Pulsing edges represent changing synchronization between distributed brain regions.',
      label: 'Functional connectivity',
      code: 'RS-fMRI'
    },
    dti: {
      title: 'Structural connectivity with diffusion MRI',
      description: 'Flowing streamlines represent white-matter pathways and changes in tract integrity.',
      label: 'Structural connectivity',
      code: 'DTI'
    },
    atrophy: {
      title: 'Structural MRI and atrophy progression',
      description: 'The contracting cortical outline and expanding ventricles represent progressive tissue loss.',
      label: 'Atrophy progression',
      code: 'T1 MRI'
    }
  };
  let currentIndex = 0;
  let timer;

  function selectMode(mode) {
    const details = modes[mode];
    if (!details) return;
    currentIndex = buttons.findIndex((button) => button.dataset.brainMode === mode);
    stage.dataset.mode = mode;
    buttons.forEach((button) => {
      const active = button.dataset.brainMode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    layers.forEach((layer) => {
      const active = layer.dataset.brainLayer === mode;
      layer.classList.toggle('active', active);
      layer.setAttribute('aria-hidden', String(!active));
    });
    title.textContent = details.title;
    description.textContent = details.description;
    stageLabel.textContent = details.label;
    scanCode.textContent = details.code;
  }

  function startRotation() {
    if (reduceMotion || timer) return;
    timer = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % buttons.length;
      selectMode(buttons[currentIndex].dataset.brainMode);
    }, 6000);
  }

  function stopRotation() {
    window.clearInterval(timer);
    timer = undefined;
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      selectMode(button.dataset.brainMode);
      stopRotation();
      startRotation();
    });
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + offset + buttons.length) % buttons.length;
      buttons[nextIndex].focus();
      selectMode(buttons[nextIndex].dataset.brainMode);
    });
  });
  panel.addEventListener('pointerenter', stopRotation);
  panel.addEventListener('pointerleave', startRotation);
  panel.addEventListener('focusin', stopRotation);
  panel.addEventListener('focusout', startRotation);

  selectMode('fmri');
  startRotation();
}

async function init() {
  $('#year').textContent = new Date().getFullYear();
  document.body.classList.add('motion-ready');
  setupProfileParallax();
  setupResearchField();
  setupBrainExplorer();

  const profile = await loadJSON('data/profile.json', defaultProfile);
  hydrateProfile({ ...defaultProfile, ...profile });
  allPublications = await loadJSON('data/publications.json', []);
  renderPublications(allPublications);
  $('#publication-search').addEventListener('input', filterPublications);

  setupRevealAnimations();

  const menuButton = $('.menu-button');
  const nav = $('.nav');
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  $$('.nav a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
}

init();
