/* ============================================================
   Kiwrious Measure (HTML5) — main app
   ============================================================ */

import serialService from './kiwrious-webserial.esm.js';
import {
  SENSOR_TYPE,
  SAMPLE_RATE_BY_SENSOR,
  DEFAULT_SAMPLE_RATE,
  APP_VERSION,
  SERIES_ORDER,
  AXIS_CONFIG,
  INSIGHT_BANDS,
} from './constants.js';
import { renderSensor } from './sensor-views.js';
import {
  initChart,
  pushValues,
  resetBuffer,
  setSampleRate,
  snapshotSeries,
  isInitialized,
  setChartType,
} from './chart.js';
import { modesFor, findMode } from './chart-modes/registry.js';
import {
  saveRecording,
  listRecordings,
  renameRecording as renameRec,
  deleteRecording,
  exportRecording,
  exportBackup,
  importBackup,
  cardElement,
} from './recordings.js';

/* ----- State ------------------------------------------------ */
const state = {
  isConnected: false,
  isRecording: false,
  sensorType: SENSOR_TYPE.UNKNOWN,
  latestValues: [],
  sampleRate: 1,
  isReady: false,
  isFirmwareOutdated: false,
  recordingStartedAt: null,
  chartIntervalId: null,
  chartType: 'line',
  firmwareCollapseTimer: null,
};

const FIRMWARE_AUTO_COLLAPSE_MS = 10_000;

/* ----- DOM lookups ----------------------------------------- */
const $ = (sel) => document.querySelector(sel);

const els = {
  welcome: $('#welcome'),
  connected: $('#connected'),
  firmwareBanner: $('#firmware-banner'),
  sensorValueArea: $('#sensor-value-area'),
  chartContainer: $('#chart-container'),
  // Combined status + connect/disconnect
  statusBtn: $('#status-btn'),
  statusBtnLabel: $('#status-btn-label'),
  statusMenu: $('#status-menu'),
  // Combined record + sample-rate
  recordGroup: $('#record-group'),
  recordBtn: $('#record-btn'),
  recordRateLabel: $('#record-rate-label'),
  rateMenuBtn: $('#rate-menu-btn'),
  rateMenu: $('#rate-menu'),
  chartHost: $('#chart'),
  chartToolbar: $('#chart-toolbar'),
  chartToolbarOptions: $('#chart-toolbar-options'),
  chartToolbarToggle: $('#chart-toolbar-toggle'),
  chartToolbarActiveIcon: $('#chart-toolbar-active-icon'),
  recordingsList: $('#recordings-list'),
  recordingsEmpty: $('#recordings-empty'),
  recordingsNote: $('#recordings-note'),
  exportBtn: $('#export-btn'),
  importBtn: $('#import-btn'),
  importFile: $('#import-file'),
  sidePanel: $('#side-panel'),
  railTabs: document.querySelectorAll('.rail-tab'),
  sidePanes: document.querySelectorAll('.side-panel__pane'),
  rangesContent: $('#ranges-content'),
  linksContent: $('#links-content'),
  insightsContent: $('#insights-content'),
  firmwareExpandBtn: $('#firmware-expand-btn'),
  firmwareCollapseBtn: $('#firmware-collapse-btn'),
  humidityAnim: $('#humidity-anim'),
  appVersion: $('#app-version'),
};

/* ----- Wire SDK callbacks ---------------------------------- */
function setupSdk() {
  serialService.onSerialData = handleSensorData;
  serialService.onSerialConnection = handleConnectionChange;
  serialService.onFirmwareUpdateAvailable = handleFirmwareUpdate;
}

function handleConnectionChange(connected) {
  state.isConnected = connected;
  if (!connected) {
    // Auto-save in-progress recording
    if (state.isRecording) {
      stopRecording();
    }
    state.sensorType = SENSOR_TYPE.UNKNOWN;
    state.latestValues = [];
    state.isReady = false;
    state.isFirmwareOutdated = false;
    if (state.chartIntervalId) {
      clearInterval(state.chartIntervalId);
      state.chartIntervalId = null;
    }
    // Drop the firmware notice — it belongs to the disconnecting sensor
    els.firmwareBanner.style.display = 'none';
    if (state.firmwareCollapseTimer) {
      clearTimeout(state.firmwareCollapseTimer);
      state.firmwareCollapseTimer = null;
    }
    // Insights are sensor-specific; revert to empty state.
    renderInsights();
  }
  syncUi();
}

function handleSensorData(reading) {
  const newSensorType = state.sensorType !== reading.sensorType;
  state.sensorType = reading.sensorType;
  state.latestValues = reading.decodedValues;
  state.isReady = computeReady(reading);

  if (newSensorType) {
    onSensorTypeChange();
  }
  renderSensorValueArea();
  updateHumidityAnim();
  updateInsightsHighlight();
}

function handleFirmwareUpdate(outdated) {
  state.isFirmwareOutdated = !!outdated;
  els.firmwareBanner.style.display = outdated ? '' : 'none';
  if (state.firmwareCollapseTimer) {
    clearTimeout(state.firmwareCollapseTimer);
    state.firmwareCollapseTimer = null;
  }
  if (outdated) {
    setFirmwareCollapsed(false);
    state.firmwareCollapseTimer = setTimeout(() => {
      setFirmwareCollapsed(true);
    }, FIRMWARE_AUTO_COLLAPSE_MS);
  }
}

function setFirmwareCollapsed(collapsed) {
  els.firmwareBanner.classList.toggle('is-collapsed', collapsed);
}

function computeReady(reading) {
  for (const v of reading.decodedValues) {
    if (v.type === 'object' && v.value && v.value.status) {
      const s = v.value.status;
      if (v.label === 'Voc' && s !== 'READY') return false;
      if (v.label === 'HeartRate' && s !== 'READY') return false;
      // Conductivity is ready in any of MIN/READY/MAX
    }
  }
  return true;
}

function onSensorTypeChange() {
  const rates = SAMPLE_RATE_BY_SENSOR[state.sensorType] ?? { '1 sample / second': 1 };
  state.sampleRate = DEFAULT_SAMPLE_RATE[state.sensorType] ?? 1;
  populateRateMenu(rates);

  initChart(els.chartHost, state.sensorType, state.sampleRate, state.chartType);
  startChartInterval();
  // Insights bands depend on which sensor is connected — rebuild now.
  renderInsights();
  // Rebuild the chart-mode toolbar — modes available depend on sensor type.
  rebuildChartToolbar();
  syncUi();
}

/* Side panel collapse helpers ------------------------------- */
function setSidePanelCollapsed(collapsed) {
  els.sidePanel.classList.toggle('is-collapsed', collapsed);
  els.connected.classList.toggle('is-side-collapsed', collapsed);
  // Notify chart so it can re-measure to fill the wider/narrower left pane
  window.dispatchEvent(new Event('resize'));
}

function isSidePanelCollapsed() {
  return els.sidePanel.classList.contains('is-collapsed');
}

function getActiveTab() {
  const active = document.querySelector('.rail-tab.is-active');
  return active?.dataset.tab ?? 'recordings';
}

/* Click handler for a rail tab. Combines tab-switch + expand/collapse:
   - collapsed: expand the panel and activate the clicked tab
   - expanded + clicking the active tab: collapse
   - expanded + clicking another tab: switch tabs (stay expanded) */
function onRailTabClick(name) {
  if (isSidePanelCollapsed()) {
    activateTab(name);
    setSidePanelCollapsed(false);
  } else if (getActiveTab() === name) {
    setSidePanelCollapsed(true);
  } else {
    activateTab(name);
  }
}

function startChartInterval() {
  if (state.chartIntervalId) clearInterval(state.chartIntervalId);
  const ms = Math.max(50, 1000 / state.sampleRate);
  state.chartIntervalId = setInterval(() => {
    if (!state.isConnected || !state.isReady) return;
    pushValues(state.latestValues);
  }, ms);
}

/* ----- UI sync --------------------------------------------- */
function syncUi() {
  // Inside the left pane, swap the welcome message and the live sensor view.
  // The main grid (.connected) stays mounted so the side panel — recordings,
  // ranges, links — is always reachable, even before any sensor is plugged in.
  els.welcome.style.display = state.isConnected ? 'none' : '';
  els.sensorValueArea.style.display = state.isConnected ? '' : 'none';
  els.chartContainer.style.display = state.isConnected ? '' : 'none';
  // Chart-mode toolbar (now in the topbar) follows the chart's visibility
  els.chartToolbar.style.display = state.isConnected ? 'inline-flex' : 'none';

  // Status / Connect button — same element, two modes
  if (state.isConnected) {
    els.statusBtn.classList.add('status-btn--connected');
    els.statusBtn.classList.remove('status-btn--disconnected');
    els.statusBtnLabel.textContent = state.sensorType !== SENSOR_TYPE.UNKNOWN
      ? `connected • ${state.sensorType}`
      : 'connected';
  } else {
    els.statusBtn.classList.remove('status-btn--connected');
    els.statusBtn.classList.add('status-btn--disconnected');
    els.statusBtnLabel.textContent = 'Connect';
    closeMenu(els.statusMenu, els.statusBtn);
  }

  // Record + rate split button — only when connected
  els.recordGroup.style.display = state.isConnected ? 'inline-flex' : 'none';

  // Record button enable/disable + icon (rebuild innerHTML so the rate
  // chip stays alongside the label)
  const canRecord = state.isConnected && state.isReady && !!state.sampleRate;
  els.recordBtn.disabled = !canRecord && !state.isRecording;
  els.recordBtn.classList.toggle('is-recording', state.isRecording);
  els.recordBtn.innerHTML = state.isRecording
    ? `<span class="rec-ic rec-ic--stop" aria-hidden="true"></span>
       <span class="record-group__label">Stop</span>
       <span id="record-rate-label" class="record-group__rate">${formatHz(state.sampleRate)}</span>`
    : `<span class="rec-ic rec-ic--rec" aria-hidden="true"></span>
       <span class="record-group__label">Record</span>
       <span id="record-rate-label" class="record-group__rate">${formatHz(state.sampleRate)}</span>`;
  // Rebound after innerHTML — keep handle fresh
  els.recordRateLabel = $('#record-rate-label');

  // Sample-rate menu can't be changed mid-recording
  els.rateMenuBtn.disabled = state.isRecording;
  if (state.isRecording) closeMenu(els.rateMenu, els.rateMenuBtn);
}

function renderSensorValueArea() {
  if (!state.isConnected) return;
  els.sensorValueArea.innerHTML = renderSensor(state.sensorType, state.latestValues);
}

/* Humidity background animation
   ------------------------------------------------------------ */
function updateHumidityAnim() {
  if (!els.humidityAnim) return;
  if (state.sensorType !== SENSOR_TYPE.HUMIDITY) {
    els.humidityAnim.dataset.layers = '0';
    return;
  }
  const hum = Number(state.latestValues.find((v) => v.label === 'Hum')?.value ?? 0);
  let layers = 0;
  if (hum >= 20) layers = 1;
  if (hum >= 50) layers = 2;
  if (hum >= 80) layers = 3;
  els.humidityAnim.dataset.layers = String(layers);
  // toggle visibility of layers via CSS [data-layers]
  els.humidityAnim.querySelectorAll('.humidity-anim__layer').forEach((node, i) => {
    node.style.display = i < layers ? '' : 'none';
  });
}

/* Sample-rate menu (split button dropdown) ------------------ */
/* Always display sample rate in Hz on the record button. The dropdown
   keeps the descriptive form (e.g. "1 sample / minute"). Sub-1 Hz values
   round to 3 sig figs so 1/60 → "0.017 Hz". */
function formatHz(hz) {
  if (!Number.isFinite(hz)) return '';
  if (hz >= 1) return `${hz} Hz`;
  if (hz >= 0.1) return `${hz.toFixed(1)} Hz`;
  // Trim trailing zeros so 0.200 → 0.2 (handled above), 0.017 stays
  const s = hz.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  return `${s} Hz`;
}

function populateRateMenu(rates) {
  els.rateMenu.innerHTML = Object.entries(rates)
    .sort((a, b) => a[1] - b[1])
    .map(([label, hz]) => `
      <button class="menu__item" type="button" role="menuitem" data-rate="${hz}">${label}</button>
    `).join('');
  els.rateMenu.querySelectorAll('.menu__item').forEach((item) => {
    item.addEventListener('click', () => {
      const hz = parseFloat(item.dataset.rate);
      if (!Number.isFinite(hz)) return;
      state.sampleRate = hz;
      setSampleRate(hz);
      startChartInterval();
      updateRateMenuActive();
      closeMenu(els.rateMenu, els.rateMenuBtn);
      syncUi(); // refresh the record button's Hz chip
    });
  });
  updateRateMenuActive();
}

function updateRateMenuActive() {
  els.rateMenu.querySelectorAll('.menu__item').forEach((item) => {
    const hz = parseFloat(item.dataset.rate);
    item.classList.toggle('is-selected', Math.abs(hz - state.sampleRate) < 1e-9);
  });
}

/* Generic dropdown menu helpers ----------------------------- */
function openMenu(menu, trigger) {
  menu.hidden = false;
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
}
function closeMenu(menu, trigger) {
  menu.hidden = true;
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
}
function toggleMenu(menu, trigger) {
  if (menu.hidden) openMenu(menu, trigger);
  else closeMenu(menu, trigger);
}

/* Record / stop --------------------------------------------- */
function startRecording() {
  if (state.isRecording) return;
  state.isRecording = true;
  state.recordingStartedAt = Date.now();
  resetBuffer();
  syncUi();
}

function stopRecording() {
  if (!state.isRecording) return;
  state.isRecording = false;
  const snapshot = snapshotSeries();
  let saved = false;
  if (snapshot.length && snapshot[0].data.length) {
    saveRecording({
      sensorType: state.sensorType,
      sampleRate: state.sampleRate,
      startedAt: state.recordingStartedAt,
      snapshot,
    });
    rerenderRecordings();
    saved = true;
  }
  state.recordingStartedAt = null;
  syncUi();
  // Auto-expand the recordings panel and switch to the Recordings tab so the
  // user sees the new card immediately.
  if (saved) {
    activateTab('recordings');
    setSidePanelCollapsed(false);
  }
}

/* Ranges tab content ---------------------------------------- */
const SENSOR_DISPLAY_NAME = {
  UV: 'UV',
  HUMIDITY: 'Humidity',
  TEMPERATURE: 'Temperature',
  CONDUCTIVITY: 'Conductivity',
  VOC: 'Air Quality (VOC)',
  HEART_RATE: 'Heart Rate',
};

function formatRange(cfg) {
  const fmt = (v) => Number(v).toLocaleString();
  const lo = cfg.hardFloor;
  const hi = cfg.hardCeiling;
  let bounds;
  if (lo == null && hi == null) bounds = 'auto';
  else if (lo == null) bounds = `auto – ${fmt(hi)}`;
  else if (hi == null) bounds = `${fmt(lo)} – auto`;
  else bounds = `${fmt(lo)} – ${fmt(hi)}`;
  if (cfg.log) return `log · ${bounds}`;
  return cfg.step != null ? `${bounds} · step ${cfg.step}` : bounds;
}

function renderRanges() {
  if (!els.rangesContent) return;
  const sensorTypes = Object.keys(SERIES_ORDER);
  els.rangesContent.innerHTML = sensorTypes.map((type) => {
    const labels = SERIES_ORDER[type] ?? [];
    const rows = labels.map((label) => {
      const cfg = AXIS_CONFIG[label] ?? {};
      return `
        <div class="range-row">
          <div class="range-row__label">${escapeHtml(cfg.title ?? label)}</div>
          <span class="range-row__value">${escapeHtml(formatRange(cfg))}</span>
        </div>`;
    }).join('');
    return `
      <section class="range-group">
        <h3 class="range-group__title">${escapeHtml(SENSOR_DISPLAY_NAME[type] ?? type)}</h3>
        ${rows}
      </section>`;
  }).join('');
}

/* Links tab content ----------------------------------------- */
const KIWRIOUS_LINKS = [
  {
    title: 'Kiwrious',
    url: 'https://kiwrious.com',
    desc: 'Project home — about, sensors, learning resources.',
  },
  {
    title: 'Play',
    url: 'https://play.kiwrious.com',
    desc: 'Scratch playground for building projects with Kiwrious sensors.',
  },
  {
    title: 'Developer',
    url: 'https://dev.kiwrious.com',
    desc: 'Web Serial SDK, sample code, and developer documentation.',
  },
];

function renderLinks() {
  if (!els.linksContent) return;
  els.linksContent.innerHTML = KIWRIOUS_LINKS.map((link) => `
    <a class="link-card" href="${escapeHtml(link.url)}" target="_blank" rel="noopener">
      <div class="link-card__title">
        <span>${escapeHtml(link.title)}</span>
        <span class="link-card__arrow" aria-hidden="true">↗</span>
      </div>
      <div class="link-card__url">${escapeHtml(link.url.replace(/^https?:\/\//, ''))}</div>
      <div class="link-card__desc">${escapeHtml(link.desc)}</div>
    </a>
  `).join('');
}

/* Insights tab — show reference bands per measurement for the connected
   sensor, highlight whichever band the live value falls in. ----------- */

function valueForLabel(values, label) {
  const entry = values?.find((v) => v.label === label);
  if (!entry || entry.value == null) return null;
  if (typeof entry.value === 'object') {
    if (entry.value.status && entry.value.status !== 'READY') return null;
    return Number(entry.value.value);
  }
  const n = Number(entry.value);
  return Number.isFinite(n) ? n : null;
}

function formatBandRange(band) {
  const fmt = (v) => {
    if (Math.abs(v) >= 1000) return Number(v).toLocaleString();
    // Keep one decimal only when there is a fractional part (e.g. 37.5).
    return v % 1 === 0 ? String(v) : v.toFixed(1);
  };
  if (band.from === -Infinity) return `< ${fmt(band.to)}`;
  if (band.to === Infinity) return `${fmt(band.from)}+`;
  return `${fmt(band.from)} – ${fmt(band.to)}`;
}

function renderInsights() {
  if (!els.insightsContent) return;
  const labels = state.isConnected && state.sensorType !== SENSOR_TYPE.UNKNOWN
    ? (SERIES_ORDER[state.sensorType] ?? [])
    : [];
  if (!labels.length) {
    els.insightsContent.innerHTML = `
      <p class="insight-empty">Connect a sensor to see live insights for its measurements.</p>`;
    return;
  }
  els.insightsContent.innerHTML = labels.map((label) => {
    const cfg = AXIS_CONFIG[label] ?? {};
    const bands = INSIGHT_BANDS[label] ?? [];
    if (!bands.length) return '';
    const bandsHtml = bands.map((b, i) => `
      <div class="insight-band" data-band="${i}">
        <div class="insight-band__range">${escapeHtml(formatBandRange(b))}</div>
        <div>
          <div class="insight-band__label">${escapeHtml(b.label)}</div>
          <div class="insight-band__desc">${escapeHtml(b.desc)}</div>
        </div>
      </div>
    `).join('');
    return `
      <section class="insight-group" data-label="${escapeHtml(label)}">
        <header class="insight-group__header">
          <h3 class="insight-group__title">${escapeHtml(cfg.title ?? label)}</h3>
          <div class="insight-group__value" data-current>—</div>
        </header>
        <div class="insight-group__bands">${bandsHtml}</div>
      </section>
    `;
  }).join('');
  updateInsightsHighlight();
}

function updateInsightsHighlight() {
  if (!els.insightsContent) return;
  if (!state.isConnected) return;
  const labels = SERIES_ORDER[state.sensorType] ?? [];
  for (const label of labels) {
    const group = els.insightsContent.querySelector(`[data-label="${cssEscape(label)}"]`);
    if (!group) continue;
    const v = valueForLabel(state.latestValues, label);
    const cfg = AXIS_CONFIG[label] ?? {};
    const valueEl = group.querySelector('[data-current]');
    if (valueEl) {
      valueEl.textContent = Number.isFinite(v) ? Number(v).toFixed(cfg.decimals ?? 1) : '—';
    }
    const bands = INSIGHT_BANDS[label] ?? [];
    const activeIdx = Number.isFinite(v) ? bands.findIndex((b) => v >= b.from && v < b.to) : -1;
    group.querySelectorAll('.insight-band').forEach((el, i) => {
      el.classList.toggle('is-active', i === activeIdx);
    });
  }
}

function cssEscape(s) {
  return (window.CSS && window.CSS.escape) ? window.CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&');
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function activateTab(name) {
  els.railTabs.forEach((t) => {
    const active = t.dataset.tab === name;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', String(active));
  });
  els.sidePanes.forEach((p) => {
    p.classList.toggle('is-active', p.dataset.pane === name);
  });
  syncRecordingsActions();
}

/* Recordings list rendering --------------------------------- */
function rerenderRecordings() {
  const items = listRecordings();
  els.recordingsList.innerHTML = '';
  els.recordingsEmpty.style.display = items.length ? 'none' : '';
  els.recordingsNote.hidden = items.length === 0;
  items.forEach((rec, idx) => {
    const card = cardElement(rec, {
      onRename: (r, newName) => { renameRec(r.id, newName); rerenderRecordings(); },
      onExport: (r) => exportRecording(r),
      onDelete: (r) => { deleteRecording(r.id); rerenderRecordings(); },
    });
    // First card stays fully expanded; older recordings collapse to mini.
    if (idx > 0) card.classList.add('is-mini');
    els.recordingsList.appendChild(card);
  });
  syncRecordingsActions();
}

/* Show Import always (when on Recordings tab); show Export only when
   there is at least one recording to back up. Both buttons hide when
   the user is on a different tab. */
function syncRecordingsActions() {
  const onRecordings = getActiveTab() === 'recordings';
  const hasItems = listRecordings().length > 0;
  els.importBtn.style.display = onRecordings ? '' : 'none';
  els.exportBtn.style.display = onRecordings && hasItems ? '' : 'none';
}

/* Wire UI events -------------------------------------------- */
function wireUi() {
  els.appVersion.textContent = `v${APP_VERSION}`;
  els.firmwareBanner.style.display = 'none';

  // Status button — disconnected acts as Connect, connected opens menu
  els.statusBtn.addEventListener('click', () => {
    if (state.isConnected) {
      toggleMenu(els.statusMenu, els.statusBtn);
    } else {
      serialService.connectAndReadAsync().catch((err) => console.warn('connect failed', err));
    }
  });
  els.statusMenu.addEventListener('click', (e) => {
    const item = e.target.closest('.menu__item');
    if (!item) return;
    if (item.dataset.action === 'disconnect') {
      serialService.disconnectAsync().catch((err) => console.warn('disconnect failed', err));
      closeMenu(els.statusMenu, els.statusBtn);
    }
  });

  // Record split button: main toggles recording; chevron opens rate menu
  els.recordBtn.addEventListener('click', () => {
    if (state.isRecording) stopRecording();
    else startRecording();
  });
  els.rateMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(els.rateMenu, els.rateMenuBtn);
  });

  // Click anywhere outside an open menu closes it
  document.addEventListener('click', (e) => {
    if (!els.statusBtn.contains(e.target) && !els.statusMenu.contains(e.target)) {
      closeMenu(els.statusMenu, els.statusBtn);
    }
    if (!els.rateMenuBtn.contains(e.target) && !els.rateMenu.contains(e.target)) {
      closeMenu(els.rateMenu, els.rateMenuBtn);
    }
  });
  // Escape closes any open menu
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeMenu(els.statusMenu, els.statusBtn);
    closeMenu(els.rateMenu, els.rateMenuBtn);
  });

  els.exportBtn.addEventListener('click', () => {
    try {
      exportBackup();
    } catch (err) {
      console.warn('Export failed', err);
      alert(`Export failed: ${err?.message ?? err}`);
    }
  });

  els.importBtn.addEventListener('click', () => els.importFile.click());

  els.importFile.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const added = await importBackup(file);
      rerenderRecordings();
      activateTab('recordings');
      alert(`Imported ${added} recording${added === 1 ? '' : 's'} from ${file.name}.`);
    } catch (err) {
      console.warn('Import failed', err);
      alert(`Import failed: ${err?.message ?? err}`);
    } finally {
      // Reset so picking the same file again still triggers `change`.
      e.target.value = '';
    }
  });

  // Vertical rail tabs handle both tab switching and expand/collapse
  els.railTabs.forEach((tab) => {
    tab.addEventListener('click', () => onRailTabClick(tab.dataset.tab));
  });

  // Firmware notice expand/collapse — auto-collapses 10s after appearing.
  // Manual interactions cancel any pending auto-collapse.
  els.firmwareExpandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.firmwareCollapseTimer) {
      clearTimeout(state.firmwareCollapseTimer);
      state.firmwareCollapseTimer = null;
    }
    setFirmwareCollapsed(false);
  });
  els.firmwareCollapseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.firmwareCollapseTimer) {
      clearTimeout(state.firmwareCollapseTimer);
      state.firmwareCollapseTimer = null;
    }
    setFirmwareCollapsed(true);
  });
  els.firmwareBanner.addEventListener('click', () => {
    if (els.firmwareBanner.classList.contains('is-collapsed')) {
      setFirmwareCollapsed(false);
    }
  });

  // Chart-toolbar — toggle expanded state
  els.chartToolbarToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = els.chartToolbar.classList.toggle('is-expanded');
    els.chartToolbarToggle.setAttribute('aria-expanded', String(expanded));
  });

  // Chart-toolbar — option click switches mode and auto-collapses
  els.chartToolbarOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.chart-type-btn');
    if (!btn) return;
    const type = btn.dataset.type;
    if (!type || type === state.chartType) return;
    state.chartType = type;
    setChartType(type);
    syncChartToolbarActive();
    els.chartToolbar.classList.remove('is-expanded');
    els.chartToolbarToggle.setAttribute('aria-expanded', 'false');
  });

  // Outside click closes the chart-toolbar dropdown
  document.addEventListener('click', (e) => {
    if (!els.chartToolbar.contains(e.target)) {
      els.chartToolbar.classList.remove('is-expanded');
      els.chartToolbarToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* Build the chart-toolbar option list for the connected sensor.
   Falls back to empty list when no sensor is connected. */
function rebuildChartToolbar() {
  const modes = state.isConnected ? modesFor(state.sensorType) : [];
  els.chartToolbarOptions.innerHTML = modes.map((m) => `
    <button class="chart-type-btn ${m.id === state.chartType ? 'is-active' : ''}"
            data-type="${escapeHtml(m.id)}"
            type="button"
            title="${escapeHtml(m.label)}"
            aria-label="${escapeHtml(m.label)}">${m.iconSvg}</button>
  `).join('');
  // If the previously-active mode isn't valid for this sensor, fall back
  // to the first mode (always 'line').
  if (modes.length && !modes.find((m) => m.id === state.chartType)) {
    state.chartType = modes[0].id;
    setChartType(state.chartType);
  }
  syncChartToolbarActive();
}

function syncChartToolbarActive() {
  els.chartToolbarOptions.querySelectorAll('.chart-type-btn').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.type === state.chartType);
  });
  // Mirror the active mode's icon onto the toggle button so the user can
  // see what's currently selected without opening the dropdown.
  const active = findMode(state.chartType);
  if (active && els.chartToolbarActiveIcon) {
    els.chartToolbarActiveIcon.innerHTML = active.iconSvg;
    els.chartToolbarToggle.setAttribute('aria-label',
      `Chart mode: ${active.label}. Click to choose another.`);
  }
}

/* Web Serial support detection ------------------------------ */
function checkSupport() {
  if (!('serial' in navigator)) {
    els.welcome.innerHTML = `
      <div style="max-width:520px">
        <h2 style="color:white">Web Serial is not supported in this browser</h2>
        <p>Please open this app in a Chromium-based browser (Chrome, Edge, or Opera) over HTTPS or localhost.</p>
      </div>`;
  }
}

/* ----- Boot ------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  wireUi();
  setupSdk();
  syncUi();
  checkSupport();
  renderRanges();
  renderLinks();
  renderInsights();
  rerenderRecordings();
  // Boot collapsed regardless of whether there are persisted recordings —
  // the user can click the rail tab to expand. We auto-expand when a new
  // recording is saved.
  setSidePanelCollapsed(true);
});
