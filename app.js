import { entries } from './data.js';

const categories = ['research', 'notes', 'reference', 'iterations'];
const years = ['2026', '2027'];
const prototypeGroups = [...new Set(entries.map((entry) => entry.prototype).filter(Boolean))];
const entryNumbers = new Map([...entries].sort((a, b) => a.id - b.id).map((entry, index) => [entry.id, index + 1]));
const grid = document.querySelector('#archive-grid');
const sortControl = document.querySelector('#sort-order');
const sortOptions = ['unsystematic', 'newest', 'oldest', 'number'];

function initialSortOrder() {
  try {
    const saved = sessionStorage.getItem('living-archive-sort');
    return sortOptions.includes(saved) ? saved : 'unsystematic';
  } catch {
    return 'unsystematic';
  }
}
const searchDialog = document.querySelector('#search-dialog');
const searchInput = document.querySelector('#search-input');
const entryDialog = document.querySelector('#entry-dialog');
const localDate = document.querySelector('#local-date');
const localTime = document.querySelector('#local-time');
const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const state = { prototype: '', category: '', year: '', query: '', sort: initialSortOrder(), view: 'grid', currentEntry: null };
const unsystematicOrder = [...entries];
let visibleEntries = [];

for (let index = unsystematicOrder.length - 1; index > 0; index -= 1) {
  const swap = Math.floor(Math.random() * (index + 1));
  [unsystematicOrder[index], unsystematicOrder[swap]] = [unsystematicOrder[swap], unsystematicOrder[index]];
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function entryNumber(entry) {
  return String(entryNumbers.get(entry.id)).padStart(2, '0');
}

function entryMediaStyle(entry) {
  const ratio = Number(entry.imageWidth) / Number(entry.imageHeight);
  return Number.isFinite(ratio) && ratio > 0 ? ` style="--media-ratio: ${ratio}"` : '';
}

function mediaMarkup(entry, detail = false) {
  const image = detail ? entry.detailImage || entry.image : entry.image;
  const ratio = Number(entry.imageWidth) > 0 && Number(entry.imageHeight) > 0
    ? ` style="aspect-ratio: ${Number(entry.imageWidth)} / ${Number(entry.imageHeight)}"`
    : '';
  const content = image
    ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(entry.alt || entry.title)}" loading="lazy" decoding="async">`
    : '';
  return `<div class="placeholder orientation-${escapeHTML(entry.orientation)} tone-${escapeHTML(entry.tone)}"${ratio}${image ? '' : ' aria-hidden="true"'}>${content}</div>`;
}

function galleryMarkup(entry) {
  if (!entry.media?.length) return '';
  return `<div class="entry-gallery">${entry.media.map((item) => {
    const dimensions = Number(item.width) > 0 && Number(item.height) > 0
      ? ` width="${Number(item.width)}" height="${Number(item.height)}"`
      : '';
    const content = item.type === 'video'
      ? `<video controls playsinline preload="metadata" src="${escapeHTML(item.src)}" poster="${escapeHTML(item.poster || '')}" aria-label="${escapeHTML(item.alt || item.caption)}"${dimensions}>Your browser does not support this video. <a href="${escapeHTML(item.src)}">Open recording</a></video>`
      : `<img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.alt || item.caption)}" loading="lazy" decoding="async"${dimensions}>`;
    const action = item.type === 'video' ? '' : `<a href="${escapeHTML(item.src)}" target="_blank" rel="noopener" aria-label="View ${escapeHTML(item.caption)} at full size">View image</a>`;
    return `<figure class="gallery-item">${content}<figcaption><span>${escapeHTML(item.caption)}</span>${action}</figcaption></figure>`;
  }).join('')}</div>`;
}

function pauseEntryMedia() {
  entryDialog.querySelectorAll('video').forEach((video) => video.pause());
}

function filterButton(value, type, label = value) {
  return `<button type="button" data-filter="${type}" data-value="${escapeHTML(value)}" aria-pressed="${state[type] === value}">${escapeHTML(label)}</button>`;
}

function renderFilterOptions() {
  document.querySelector('#prototype-options').innerHTML = filterButton('', 'prototype', 'All prototypes') + prototypeGroups.map((prototype) => filterButton(prototype, 'prototype')).join('');
  document.querySelector('#category-options').innerHTML = filterButton('', 'category', 'All entries') + categories.map((category) => filterButton(category, 'category')).join('');
  document.querySelector('#year-options').innerHTML = filterButton('', 'year', 'All years') + years.map((year) => filterButton(year, 'year')).join('');
}

function renderChips() {
  const chips = document.querySelector('#applied-filters');
  const filters = [['prototype', state.prototype], ['category', state.category], ['year', state.year], ['query', state.query]].filter(([, value]) => value);
  chips.hidden = filters.length === 0;
  chips.innerHTML = filters.map(([type, value]) => `<button class="filter-chip" data-remove="${type}" aria-label="Remove ${escapeHTML(type)} filter: ${escapeHTML(value)}">${type === 'query' ? `“${escapeHTML(value)}”` : escapeHTML(value)}<span aria-hidden="true">×</span></button>`).join('') + (filters.length ? '<button class="clear-filters" data-reset>Clear all</button>' : '');
}

function render() {
  const query = state.query.toLocaleLowerCase().trim();
  visibleEntries = unsystematicOrder.filter((entry) => {
    const searchable = [entry.title, entry.fullTitle, entry.prototype, entry.author, entry.source, entry.published, entry.category, entry.year, entryNumber(entry), entry.description, ...(entry.tags || [])].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!state.prototype || entry.prototype === state.prototype) && (!state.category || entry.category === state.category) && (!state.year || entry.year === state.year) && (!query || searchable.includes(query));
  });

  if (state.sort === 'newest') visibleEntries.sort((a, b) => Number(b.year) - Number(a.year) || b.id - a.id);
  if (state.sort === 'oldest') visibleEntries.sort((a, b) => Number(a.year) - Number(b.year) || a.id - b.id);
  if (state.sort === 'number') visibleEntries.sort((a, b) => entryNumbers.get(a.id) - entryNumbers.get(b.id));

  grid.classList.toggle('list-layout', state.view === 'list');
  grid.innerHTML = visibleEntries.map((entry) => `<article class="entry-card"><button class="entry-link" data-entry="${entry.id}"${entryMediaStyle(entry)} aria-label="Open ${escapeHTML(entry.title)}, entry ${entryNumber(entry)}, ${escapeHTML(entry.prototype || '')}, ${escapeHTML(entry.category)}"><div class="media-slot">${mediaMarkup(entry)}</div><div class="entry-meta"><span>(${entryNumber(entry)})</span><span class="entry-category">${escapeHTML(entry.category)}${entry.prototype ? `<span class="entry-prototype">${escapeHTML(entry.prototype)}</span>` : ''}</span></div><h2 class="entry-caption">${escapeHTML(entry.title)}</h2><span class="entry-list-meta">${escapeHTML(entry.year)}</span></button></article>`).join('');

  sortControl.value = state.sort;
  document.querySelector('#result-count').textContent = visibleEntries.length;
  document.querySelector('#active-description').textContent = [state.prototype || 'All prototypes', state.category, state.year, state.query ? `“${state.query}”` : ''].filter(Boolean).join(' / ');
  document.querySelector('#archive-end-count').textContent = `${visibleEntries.length} of ${entries.length} entries`;
  document.querySelector('#empty-state').hidden = visibleEntries.length > 0;
  document.querySelector('#live-status').textContent = `${visibleEntries.length} ${visibleEntries.length === 1 ? 'entry' : 'entries'} found.`;
  document.querySelector('#grid-view').setAttribute('aria-pressed', state.view === 'grid');
  document.querySelector('#list-view').setAttribute('aria-pressed', state.view === 'list');
  renderFilterOptions();
  renderChips();
}

function resetFilters() {
  state.prototype = '';
  state.category = '';
  state.year = '';
  state.query = '';
  searchInput.value = '';
  render();
}

function setFilter(type, value) {
  state[type] = state[type] === value ? '' : value;
  render();
}

function openEntry(id) {
  const entry = visibleEntries.find((item) => item.id === id);
  if (!entry) return;
  state.currentEntry = id;
  const index = visibleEntries.findIndex((item) => item.id === id);
  document.querySelector('#entry-index').textContent = `Entry (${entryNumber(entry)})`;
  pauseEntryMedia();
  const additionalMetadata = [
    entry.author ? `<div><dt>${escapeHTML(entry.authorLabel || 'Author')}</dt><dd>${escapeHTML(entry.author)}</dd></div>` : '',
    entry.published ? `<div><dt>Published</dt><dd>${escapeHTML(entry.published)}</dd></div>` : '',
    entry.source ? `<div><dt>Source</dt><dd>${escapeHTML(entry.source)}</dd></div>` : '',
    entry.dateLabel ? `<div><dt>Captured</dt><dd>${escapeHTML(entry.dateLabel)}</dd></div>` : '',
    entry.status ? `<div><dt>Status</dt><dd>${escapeHTML(entry.status)}</dd></div>` : ''
  ].join('');
  const imageAction = entry.detailImage && entry.imageLink !== false ? `<a class="media-open" href="${escapeHTML(entry.detailImage)}" target="_blank" rel="noopener" aria-label="View ${escapeHTML(entry.title)} at full size">View image</a>` : '';
  const documentAction = /^\.\/assets\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.pdf$/i.test(entry.document?.src || '') ? `<a class="media-open" href="${escapeHTML(entry.document.src)}" target="_blank" rel="noopener" aria-label="${escapeHTML(entry.document.label || 'View PDF')}: ${escapeHTML(entry.title)}">${escapeHTML(entry.document.label || 'View PDF')}</a>` : '';
  const externalLinks = [entry.website ? { label: entry.websiteLabel || 'Visit website', url: entry.website } : null, ...(entry.links || [])].filter((link) => link && /^https?:\/\//i.test(link.url || ''));
  const websiteActions = externalLinks.map((link) => `<a class="media-open" href="${escapeHTML(link.url)}" target="_blank" rel="noopener" aria-label="${escapeHTML(link.label)}: ${escapeHTML(entry.title)}">${escapeHTML(link.label)}</a>`).join('');
  const description = entry.description ? `<p class="detail-description">${escapeHTML(entry.description)}</p>` : '';
  const prototypeMetadata = entry.prototype ? `<div><dt>Version</dt><dd>${escapeHTML(entry.prototype)}</dd></div>` : '';
  document.querySelector('#entry-detail').innerHTML = `<div class="detail-image">${mediaMarkup(entry, true)}</div><div class="detail-copy"><h2 id="entry-title">${escapeHTML(entry.fullTitle || entry.title)}</h2>${description}<dl>${prototypeMetadata}<div><dt>Category</dt><dd>${escapeHTML(entry.category)}</dd></div><div><dt>Year</dt><dd>${escapeHTML(entry.year)}</dd></div>${additionalMetadata}</dl><div class="detail-actions">${documentAction}${websiteActions}${imageAction}</div></div>${galleryMarkup(entry)}`;
  document.querySelector('#entry-position').textContent = `${index + 1} / ${visibleEntries.length}`;
  const previousButton = document.querySelector('#previous-entry');
  const nextButton = document.querySelector('#next-entry');
  const focusedButton = document.activeElement;
  previousButton.disabled = index === 0;
  nextButton.disabled = index === visibleEntries.length - 1;
  if (focusedButton === nextButton && nextButton.disabled && !previousButton.disabled) previousButton.focus();
  if (focusedButton === previousButton && previousButton.disabled && !nextButton.disabled) nextButton.focus();
  if (!entryDialog.open) entryDialog.showModal();
  if (entry.media?.length) {
    entryDialog.querySelector('[data-close]').focus({ preventScroll: true });
    entryDialog.scrollTop = 0;
  }
}

function moveEntry(direction) {
  const index = visibleEntries.findIndex((entry) => entry.id === state.currentEntry);
  const next = visibleEntries[index + direction];
  if (next) openEntry(next.id);
}

document.querySelector('#toggle-filters').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', open);
  document.querySelector('#filter-panel').hidden = !open;
});

document.querySelector('#filter-panel').addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  const type = button.dataset.filter;
  const value = button.dataset.value;
  setFilter(type, value);
  [...document.querySelectorAll(`[data-filter="${type}"]`)].find((option) => option.dataset.value === value)?.focus();
});

document.querySelector('#applied-filters').addEventListener('click', (event) => {
  const remove = event.target.closest('[data-remove]');
  if (remove) {
    state[remove.dataset.remove] = '';
    render();
    document.querySelector('#toggle-filters').focus();
  }
  if (event.target.closest('[data-reset]')) {
    resetFilters();
    document.querySelector('#toggle-filters').focus();
  }
});

document.querySelector('#open-search').addEventListener('click', () => {
  searchInput.value = state.query;
  searchDialog.showModal();
  searchInput.focus();
});

document.querySelector('#search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  state.query = searchInput.value.trim();
  render();
  searchDialog.close();
});

document.querySelector('#search-suggestions').innerHTML = [...prototypeGroups, ...categories, ...years].map((value) => `<button type="button" data-suggestion="${escapeHTML(value)}">${escapeHTML(value)}</button>`).join('');
document.querySelector('#search-suggestions').addEventListener('click', (event) => {
  const button = event.target.closest('[data-suggestion]');
  if (!button) return;
  const value = button.dataset.suggestion;
  if (categories.includes(value)) state.category = value;
  else if (prototypeGroups.includes(value)) state.prototype = value;
  else state.year = value;
  state.query = '';
  render();
  searchDialog.close();
});

document.querySelector('#open-information').addEventListener('click', () => document.querySelector('#information-dialog').showModal());
function applySortOrder(event) {
  const order = event.currentTarget.value;
  if (!sortOptions.includes(order) || order === state.sort) return;
  state.sort = order;
  try {
    sessionStorage.setItem('living-archive-sort', order);
  } catch {}
  render();
}

sortControl.addEventListener('input', applySortOrder);
sortControl.addEventListener('change', applySortOrder);
document.querySelector('#grid-view').addEventListener('click', () => { state.view = 'grid'; render(); });
document.querySelector('#list-view').addEventListener('click', () => { state.view = 'list'; render(); });
document.querySelector('#reset-empty').addEventListener('click', () => { resetFilters(); document.querySelector('#open-search').focus(); });
grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-entry]');
  if (button) openEntry(Number(button.dataset.entry));
});
document.querySelector('#previous-entry').addEventListener('click', () => moveEntry(-1));
document.querySelector('#next-entry').addEventListener('click', () => moveEntry(1));
entryDialog.addEventListener('close', pauseEntryMedia);
entryDialog.addEventListener('keydown', (event) => {
  if (event.target.closest('video')) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); moveEntry(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); moveEntry(1); }
});

document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}));

document.querySelector('#copyright-year').textContent = new Date().getFullYear();
function updateLocalClock() {
  const now = new Date();
  localDate.textContent = dateFormatter.format(now);
  localTime.textContent = timeFormatter.format(now);
  localDate.dateTime = now.toISOString();
  localTime.dateTime = now.toISOString();
}

updateLocalClock();
setInterval(updateLocalClock, 1000);
render();
