const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const defaultProfile = {
  name: "Md Hasan Imam Shihab",
  short_name: "Hasan Imam",
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
    list.innerHTML = '<article class="publication-item"><div><h3>No publications found yet.</h3><p>Add publications to <code>data/publications.json</code> or run the Scholar update workflow.</p></div></article>';
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

async function init() {
  $('#year').textContent = new Date().getFullYear();
  const profile = await loadJSON('data/profile.json', defaultProfile);
  hydrateProfile({ ...defaultProfile, ...profile });
  allPublications = await loadJSON('data/publications.json', []);
  renderPublications(allPublications);
  $('#publication-search').addEventListener('input', filterPublications);

  const menuButton = $('.menu-button');
  const nav = $('.nav');
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  $$('.nav a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
}

init();
