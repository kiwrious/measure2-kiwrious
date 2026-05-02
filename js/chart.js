/* ============================================================
   Chart orchestrator
   ------------------------------------------------------------
   Owns the rolling time-series buffer (used by recordings) and
   the cluster-band tracking. Delegates rendering to a chart-
   mode component (see chart-modes/registry.js).
   ============================================================ */

import { AXIS_CONFIG, SERIES_ORDER, INSIGHT_BANDS } from './constants.js';
import { findMode, modesFor } from './chart-modes/registry.js';

const X_AXIS_RANGE_S = 60;

let modeHost = null;
let activeMode = null;

let series = [];        // [{ name, data: [{x,y}] }] — rolling time-series
let seriesLabels = [];  // ['Temp', 'Hum'] — labels for current sensor
let xCounter = 0;
let timeDelta = 1;
let currentSensorType = null;
let currentSampleRate = 1;
let currentChartType = 'line';
let currentRanges = {}; // { label: { min, max } }
let latestValues = null;

/* ----- cluster-band tracking ------------------------------- */

function clusterRangeFor(label) {
  const cfg = AXIS_CONFIG[label] ?? {};
  if (cfg.log || cfg.step == null) return null;
  let dataMin = Infinity, dataMax = -Infinity;
  for (let i = 0; i < seriesLabels.length; i++) {
    const otherLabel = seriesLabels[i];
    const otherCfg = AXIS_CONFIG[otherLabel] ?? {};
    const sameAxis = otherLabel === label
      || (cfg.axisGroup && otherCfg.axisGroup === cfg.axisGroup);
    if (!sameAxis) continue;
    for (const p of series[i].data) {
      if (Number.isFinite(p.y)) {
        if (p.y < dataMin) dataMin = p.y;
        if (p.y > dataMax) dataMax = p.y;
      }
    }
  }
  if (!Number.isFinite(dataMin)) return null;
  const step = cfg.step;
  let min = Math.floor(dataMin / step) * step;
  let max = Math.ceil(dataMax / step) * step;
  if (cfg.hardFloor != null && min < cfg.hardFloor) min = cfg.hardFloor;
  if (cfg.hardCeiling != null && max > cfg.hardCeiling) max = cfg.hardCeiling;
  if (max <= min) max = min + step;
  return { min, max };
}

function updateClusterRanges() {
  if (!seriesLabels.length) return;
  for (const label of seriesLabels) {
    const range = clusterRangeFor(label);
    if (range) currentRanges[label] = range;
  }
}

/* ----- mode lifecycle helpers ------------------------------ */

function makeCtx() {
  return {
    sensorType: currentSensorType,
    seriesLabels,
    series,
    currentRanges,
    latestValues,
    sampleRate: currentSampleRate,
    timeDelta,
    axisConfig: AXIS_CONFIG,
    insightBands: INSIGHT_BANDS,
  };
}

function ensureValidMode() {
  const valid = modesFor(currentSensorType ?? '');
  if (!valid.find((m) => m.id === currentChartType)) {
    currentChartType = 'line';
  }
}

function activateMode() {
  if (activeMode) {
    try { activeMode.destroy(); } catch (_) {}
    activeMode = null;
  }
  if (!modeHost) return;
  ensureValidMode();
  const mode = findMode(currentChartType) ?? findMode('line');
  if (!mode) return;
  activeMode = mode;
  mode.mount(modeHost, makeCtx());
}

/* ----- public API ------------------------------------------ */

export function initChart(host, sensorType, sampleRate, chartType) {
  modeHost = host;
  series = SERIES_ORDER[sensorType]?.map((l) => ({ name: l, data: [] })) ?? [];
  seriesLabels = SERIES_ORDER[sensorType] ?? [];
  xCounter = 0;
  timeDelta = 1 / sampleRate;
  currentSensorType = sensorType;
  currentSampleRate = sampleRate;
  if (chartType) currentChartType = chartType;
  currentRanges = {};
  latestValues = null;
  activateMode();
}

export function setChartType(chartType) {
  if (chartType === currentChartType) return;
  const mode = findMode(chartType);
  if (!mode || !mode.appliesTo(currentSensorType)) return;
  currentChartType = chartType;
  activateMode();
}

export function pushValues(decodedValues) {
  if (seriesLabels.length === 0) return;
  latestValues = decodedValues;
  xCounter += timeDelta;
  const x = +xCounter.toFixed(3);
  for (let i = 0; i < seriesLabels.length; i++) {
    const label = seriesLabels[i];
    const v = valueForLabel(decodedValues, label);
    series[i].data.push({ x, y: v });
    const maxPoints = Math.ceil(X_AXIS_RANGE_S / timeDelta) + 8;
    if (series[i].data.length > maxPoints) series[i].data.shift();
  }
  updateClusterRanges();
  if (activeMode) activeMode.update(makeCtx());
}

export function snapshotSeries() {
  return series.map((s) => ({
    name: s.name,
    data: s.data.map((p) => ({ x: p.x, y: p.y })),
  }));
}

export function resetBuffer() {
  xCounter = 0;
  series = seriesLabels.map((l) => ({ name: l, data: [] }));
  if (activeMode) activeMode.update(makeCtx());
}

export function setSampleRate(sampleRate) {
  timeDelta = 1 / sampleRate;
  currentSampleRate = sampleRate;
  if (activeMode) activeMode.update(makeCtx());
}

export function getChartType() { return currentChartType; }
export function getChartElement() { return modeHost; }
export function isInitialized() { return !!modeHost; }

/* ----- internals ------------------------------------------- */

function valueForLabel(decodedValues, label) {
  const entry = decodedValues.find((v) => v.label === label);
  if (!entry) return null;
  const raw = entry.value;
  if (raw == null) return null;
  if (typeof raw === 'object') {
    if (raw.status && raw.status !== 'READY') return null;
    return Number(raw.value);
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
