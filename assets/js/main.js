import {
  getLibraryData,
  escapeHtml,
  actionLabelFor,
  normalize,
  matchesQuery,
  formatDate
} from './library.js';

const pageTypeMap = {
  newspapers: 'Newspapers',
  webbooks: 'Web-books',
  toolbox: 'Toolbox',
  workshops: 'Workshops',
  downloads: 'Downloads'
};

const state = {
  resources: [],
  filtered: []
};

const cardTemplate = (resource) => {
  const tags = (resource.tags || []).map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join('');
  const badge = resource.featured ? '<span class="featured-badge">Featured</span>' : '';
  const actionLabel = actionLabelFor(resource.type);
  const target = resource.type === 'external' || resource.type === 'video' ? ' target="_blank" rel="noopener"' : '';

  return `
    <article class="resource-card">
      <img class="resource-cover" src="${escapeHtml(resource.cover)}" alt="${escapeHtml(resource.title)} cover">
      <div class="resource-content">
        <div class="resource-meta">
          <span class="meta-badge">${escapeHtml(resource.type.toUpperCase())}</span>
          <span class="meta-badge">${escapeHtml(resource.format)}</span>
          ${badge}
        </div>
        <h3 class="resource-title">${escapeHtml(resource.title)}</h3>
        <p class="resource-desc">${escapeHtml(resource.description)}</p>
        <div class="tags">${tags}</div>
        <small class="resource-desc">Uploaded: ${escapeHtml(formatDate(resource.uploadedAt))}</small>
        <a class="button" href="${escapeHtml(resource.url)}"${target}>${escapeHtml(actionLabel)}</a>
      </div>
    </article>
  `;
};

function renderCollection(resources, targetId, emptyId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = resources.map(cardTemplate).join('');

  const emptyNode = emptyId ? document.getElementById(emptyId) : null;
  if (emptyNode) {
    emptyNode.hidden = resources.length > 0;
  }
}

function getFilterValues() {
  const queryInput = document.getElementById('searchInput');
  const typeInput = document.getElementById('typeFilter');
  const formatInput = document.getElementById('formatFilter');
  const categoryInput = document.getElementById('categoryFilter');

  return {
    query: normalize(queryInput?.value || ''),
    type: typeInput?.value || '',
    format: formatInput?.value || '',
    category: categoryInput?.value || ''
  };
}

function applyFilters() {
  const { query, type, format, category } = getFilterValues();

  state.filtered = state.resources.filter((resource) => {
    const sameType = !type || resource.type === type;
    const sameFormat = !format || resource.format === format;
    const sameCategory = !category || resource.category === category;
    const sameQuery = matchesQuery(resource, query);

    return sameType && sameFormat && sameCategory && sameQuery;
  });

  renderCollection(state.filtered, 'libraryGrid', 'libraryEmptyState');
}

function setupFilters() {
  ['searchInput', 'typeFilter', 'formatFilter', 'categoryFilter'].forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.addEventListener('input', applyFilters);
    node.addEventListener('change', applyFilters);
  });

  const resetButton = document.getElementById('clearFilters');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      document.getElementById('searchInput').value = '';
      document.getElementById('typeFilter').value = '';
      document.getElementById('formatFilter').value = '';
      document.getElementById('categoryFilter').value = '';
      applyFilters();
    });
  }
}

function populateFilters(resources) {
  const typeFilter = document.getElementById('typeFilter');
  const formatFilter = document.getElementById('formatFilter');
  const categoryFilter = document.getElementById('categoryFilter');

  if (!typeFilter || !formatFilter || !categoryFilter) return;

  const fill = (node, values) => {
    const options = [...new Set(values)].sort((a, b) => a.localeCompare(b));
    node.innerHTML += options.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
  };

  fill(typeFilter, resources.map((item) => item.type));
  fill(formatFilter, resources.map((item) => item.format));
  fill(categoryFilter, resources.map((item) => item.category));
}

function renderHomeSections(resources) {
  const featured = resources.filter((item) => item.featured).slice(0, 4);
  const recent = [...resources]
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, 4);

  renderCollection(featured, 'featuredGrid');
  renderCollection(recent, 'recentGrid');

  const homeSearchInput = document.getElementById('homeSearchInput');
  const homeGrid = document.getElementById('homeSearchGrid');
  const homeEmpty = document.getElementById('homeSearchEmpty');

  if (homeSearchInput && homeGrid) {
    homeSearchInput.addEventListener('input', () => {
      const query = normalize(homeSearchInput.value);
      const matched = resources.filter((item) => matchesQuery(item, query)).slice(0, 12);
      homeGrid.innerHTML = matched.map(cardTemplate).join('');
      homeEmpty.hidden = matched.length > 0;
    });
  }
}

function setInstallButton() {
  const installButton = document.getElementById('installButton');
  const installStatus = document.getElementById('installStatus');
  if (!installButton || !installStatus) return;

  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.hidden = false;
    installStatus.textContent = 'This site can be installed for quick access.';
  });

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) {
      installStatus.textContent = 'Install prompt is not available in this browser yet.';
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    installStatus.textContent =
      choice.outcome === 'accepted'
        ? 'Thanks for installing Alphaducation Library.'
        : 'No problem. You can install later anytime.';

    deferredPrompt = null;
    installButton.hidden = true;
  });
}

function highlightCurrentNav() {
  const page = document.body.dataset.page;
  if (!page) return;

  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === page) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

function setupHeroOrbit() {
  const scene = document.getElementById('orbitScene');
  const hero = document.getElementById('hero3d');
  if (!scene || !hero) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 981) return;

  const updateTilt = (clientX, clientY) => {
    const x = (clientX / window.innerWidth - 0.5) * 2;
    const y = (clientY / window.innerHeight - 0.5) * 2;
    scene.style.transform = `rotateX(${18 - y * 10}deg) rotateY(${-16 + x * 14}deg)`;
  };

  window.addEventListener('pointermove', (event) => {
    updateTilt(event.clientX, event.clientY);
  });

  window.addEventListener('scroll', () => {
    const p = Math.min(1, window.scrollY / 500);
    hero.style.filter = `saturate(${1 + p * 0.25})`;
  });
}

async function init() {
  highlightCurrentNav();
  setupHeroOrbit();
  setInstallButton();

  try {
    const payload = await getLibraryData();
    const resources = payload.resources || [];
    const page = document.body.dataset.page;

    if (pageTypeMap[page]) {
      state.resources = resources.filter((item) => item.category === pageTypeMap[page]);
      populateFilters(state.resources);
      setupFilters();
      applyFilters();
    }

    if (page === 'index') {
      renderHomeSections(resources);
    }
  } catch (error) {
    const target = document.getElementById('libraryGrid') || document.getElementById('featuredGrid');
    if (target) {
      target.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  }
}

init();





