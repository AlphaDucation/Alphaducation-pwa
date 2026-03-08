// Centralized fetch helper so every page loads the same source of truth.
export async function getLibraryData() {
  const response = await fetch('data/library.json');
  if (!response.ok) {
    throw new Error('Unable to load library data.');
  }
  return response.json();
}

export function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function actionLabelFor(resourceType) {
  const map = {
    pdf: 'Read',
    html: 'Open',
    external: 'Visit',
    zip: 'Download',
    video: 'Open'
  };
  return map[resourceType] || 'Open';
}

export function normalize(text = '') {
  return text.toLowerCase().trim();
}

export function matchesQuery(resource, query) {
  if (!query) return true;
  const haystack = [
    resource.title,
    resource.description,
    resource.category,
    resource.type,
    resource.format,
    ...(resource.tags || [])
  ].join(' ').toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function formatDate(dateText) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(date);
}
