/* ============================================================
   Recording management — save/CSV export/rename + persistence
   ------------------------------------------------------------
   Recordings live in localStorage so they survive page reloads.
   They are wiped if the user clears site data; the Export/Import
   pair below produces a `.kiwrious` backup file (just JSON) that
   can be re-imported later to restore the list.
   ============================================================ */

import { UNIT_SYMBOL, AXIS_CONFIG } from './constants.js';

const STORAGE_KEY = 'kiwrious.measure.recordings.v1';
const BACKUP_KIND = 'kiwrious-recordings-backup';
const BACKUP_VERSION = 1;
const BACKUP_EXTENSION = '.kiwrious';

let recordings = [];   // { id, name, sensorType, sampleRate, startedAt, durationS, series, stats }
let nextId = 1;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data?.recordings)) {
      recordings = data.recordings;
      const maxId = recordings.reduce((m, r) => Math.max(m, r?.id ?? 0), 0);
      nextId = Math.max(data.nextId ?? 0, maxId + 1);
    }
  } catch (err) {
    console.warn('Failed to load recordings from storage', err);
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ recordings, nextId }));
  } catch (err) {
    // Most likely the localStorage quota was exceeded; surface to console
    // so the user can see why an export-then-clear may be needed.
    console.warn('Failed to persist recordings (storage may be full)', err);
  }
}

// Hydrate at module load so the in-memory list reflects what the user had.
loadFromStorage();

function isoStamp(ms) {
  // YYYY-MM-DD HH:mm:ss.SSS — matches Vue 'DD MMM YYYY h:mm:ss:SSS' family but ISO-style
  const d = new Date(ms);
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

function clockTime(ms) {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function statsFor(data) {
  const ys = data.map((p) => p.y).filter((y) => Number.isFinite(y));
  if (!ys.length) return { min: null, max: null, avg: null };
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const avg = ys.reduce((a, b) => a + b, 0) / ys.length;
  return { min, max, avg };
}

/* Save a finished recording. snapshot is from chart.snapshotSeries() */
export function saveRecording({ sensorType, sampleRate, startedAt, snapshot }) {
  const durationS = ((Date.now() - startedAt) / 1000) | 0;
  const stats = {};
  snapshot.forEach((s) => { stats[s.name] = statsFor(s.data); });

  const rec = {
    id: nextId++,
    name: `Recording ${recordings.length + 1} ${sensorType.toLowerCase()}`,
    sensorType,
    sampleRate,
    startedAt,
    durationS,
    series: snapshot,
    stats,
  };
  recordings.unshift(rec);
  saveToStorage();
  return rec;
}

export function listRecordings() { return recordings; }

export function renameRecording(id, newName) {
  const r = recordings.find((x) => x.id === id);
  if (r && newName.trim()) {
    r.name = newName.trim();
    saveToStorage();
  }
  return r;
}

export function deleteRecording(id) {
  recordings = recordings.filter((x) => x.id !== id);
  saveToStorage();
}

/* CSV export: one column per series + timestamp + relative time */
export function recordingToCsv(rec) {
  const labels = rec.series.map((s) => s.name);
  const cols = labels.map((l) => `${AXIS_CONFIG[l]?.title ?? l}`);
  const useMs = rec.sampleRate > 1;

  const header = ['Timestamp', useMs ? 'Relative Time (ms)' : 'Relative Time (s)', ...cols, 'Recording Name'];

  // Build rows by aligning all series on x. Series are created from the same chart pushes,
  // so they share x indices.
  const xs = rec.series[0]?.data.map((p) => p.x) ?? [];
  const rows = xs.map((x, i) => {
    const ts = isoStamp(rec.startedAt + Math.round(x * 1000));
    const rel = useMs ? Math.round(x * 1000) : x.toFixed(3);
    const vals = rec.series.map((s) => {
      const y = s.data[i]?.y;
      return Number.isFinite(y) ? y : '';
    });
    return [ts, rel, ...vals, rec.name];
  });

  const all = [header, ...rows];
  return all.map((row) => row.map(csvCell).join(',')).join('\n');
}

function csvCell(s) {
  const str = String(s ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function exportRecording(rec) {
  const csv = recordingToCsv(rec);
  downloadCsv(`${rec.name.replace(/[^\w.\-]+/g, '_')}.csv`, csv);
}

/* ------------------------------------------------------------
   Backup file format (.kiwrious) — JSON with a kind/version
   header so we can evolve the schema later. Filename is a local
   timestamp so multiple backups sort naturally on disk.
   ------------------------------------------------------------ */
function backupFilename() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  return `kiwrious-${date}_${time}${BACKUP_EXTENSION}`;
}

/* Write all current recordings to a .kiwrious backup file (download). */
export function exportBackup() {
  const payload = {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    count: recordings.length,
    recordings,
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = backupFilename();
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  return { count: recordings.length, filename: a.download };
}

/* Read a .kiwrious backup file and merge its recordings into storage.
   Imported recordings get fresh ids so they never collide with existing
   ones. Returns the number of recordings actually restored. */
export async function importBackup(file) {
  const text = await file.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (err) {
    throw new Error('Backup file is not valid JSON.');
  }
  if (payload?.kind !== BACKUP_KIND) {
    throw new Error('Not a Kiwrious backup file.');
  }
  if (typeof payload.version !== 'number' || payload.version > BACKUP_VERSION) {
    throw new Error(`Unsupported backup version: ${payload.version}`);
  }
  if (!Array.isArray(payload.recordings)) {
    throw new Error('Backup is missing recordings.');
  }
  let added = 0;
  for (const rec of payload.recordings) {
    if (!rec || !Array.isArray(rec.series)) continue;
    recordings.unshift({ ...rec, id: nextId++ });
    added++;
  }
  saveToStorage();
  return added;
}

/* HTML render for one card (returns an element, with handlers wired) */
export function cardElement(rec, callbacks) {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.id = String(rec.id);

  el.innerHTML = `
    <div class="card__header">
      <div class="card__title">
        <span class="card__title-text" data-act="rename">${escapeHtml(rec.name)}</span>
      </div>
      <span class="card__meta-rate">${formatRate(rec.sampleRate)}</span>
      <button class="card__toggle" data-act="toggle" type="button" aria-label="Expand details">
        <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
          <polyline points="6,4 11,8 6,12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="card__meta">
      <span>${clockTime(rec.startedAt)}</span>
      <span>${rec.durationS}s</span>
      <span>${rec.sensorType}</span>
    </div>
    <div class="card__rows">
      ${rec.series.map((s) => statsRow(s.name, rec.stats[s.name])).join('')}
    </div>
    <div class="card__actions">
      <button class="card__btn card__btn--icon" data-act="export" title="Download CSV" aria-label="Download CSV">
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M8 1v8.5m0 0L4.5 6m3.5 3.5L11.5 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2.5 11.5v1.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="card__btn card__btn--icon card__btn--danger" data-act="delete" title="Delete recording" aria-label="Delete recording">
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5l.6 8.1a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-8.1M7 7v4M9 7v4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  `;

  // Expand/collapse: explicit toggle button + click-anywhere-on-mini-card.
  el.querySelector('[data-act="toggle"]').addEventListener('click', (e) => {
    e.stopPropagation();
    el.classList.toggle('is-mini');
  });
  el.addEventListener('click', (e) => {
    if (!el.classList.contains('is-mini')) return;
    // Don't hijack clicks meant for buttons / links / the rename target.
    if (e.target.closest('[data-act], button, a, input')) return;
    el.classList.remove('is-mini');
  });

  el.querySelector('[data-act="rename"]').addEventListener('click', () => beginRename(el, rec, callbacks));
  el.querySelector('[data-act="export"]').addEventListener('click', () => callbacks.onExport(rec));
  el.querySelector('[data-act="delete"]').addEventListener('click', () => callbacks.onDelete(rec));
  return el;
}

function statsRow(label, stats) {
  const unit = UNIT_SYMBOL[label] ?? '';
  const fmt = (v) => (v == null ? '—' : (Math.abs(v) >= 1000 ? Math.round(v).toString() : Number(v).toFixed(1)));
  return `
    <div class="card__row">
      <strong>${label} <span class="card__stat">(${unit})</span></strong>
      <span><span class="card__stat">avg</span> <span class="card__stat-val">${fmt(stats.avg)}</span></span>
      <span><span class="card__stat">min</span> <span class="card__stat-val">${fmt(stats.min)}</span></span>
      <span><span class="card__stat">max</span> <span class="card__stat-val">${fmt(stats.max)}</span></span>
    </div>
  `;
}

function beginRename(cardEl, rec, callbacks) {
  const titleEl = cardEl.querySelector('.card__title');
  const input = document.createElement('input');
  input.className = 'card__rename-input';
  input.value = rec.name;
  titleEl.replaceWith(input);
  input.focus(); input.select();
  const commit = () => {
    callbacks.onRename(rec, input.value);
    // Rebuild the title with the same span structure so subsequent clicks
    // on the text re-trigger rename, while clicks on the surrounding row
    // continue to expand/collapse the card.
    const fresh = document.createElement('div');
    fresh.className = 'card__title';
    const span = document.createElement('span');
    span.className = 'card__title-text';
    span.dataset.act = 'rename';
    span.textContent = rec.name;
    span.addEventListener('click', () => beginRename(cardEl, rec, callbacks));
    fresh.appendChild(span);
    input.replaceWith(fresh);
  };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); if (e.key === 'Escape') { input.value = rec.name; input.blur(); }});
  input.addEventListener('blur', commit);
}

function formatRate(hz) {
  if (hz >= 1) return `${hz} Hz`;
  return `${(1 / hz).toFixed(0)}s / sample`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
