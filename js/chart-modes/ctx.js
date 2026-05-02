/* ============================================================
   Shared helpers for chart-mode components.
   ============================================================ */

import { AXIS_CONFIG, INSIGHT_BANDS, SENSOR_COLORS, UNIT_SYMBOL } from '../constants.js';

export { AXIS_CONFIG, INSIGHT_BANDS, SENSOR_COLORS, UNIT_SYMBOL };

/* Last buffered value for a series at the given index. Returns null if
   no data has arrived yet. */
export function lastValueAt(series, i) {
  const data = series[i]?.data;
  if (!data || !data.length) return null;
  return data[data.length - 1].y;
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function cssEscape(s) {
  return (window.CSS && window.CSS.escape)
    ? window.CSS.escape(s)
    : String(s).replace(/["\\]/g, '\\$&');
}

export function fmtNum(v, decimals = 1) {
  if (v == null || !Number.isFinite(v)) return '—';
  if (Math.abs(v) >= 1000) return Number(v).toLocaleString();
  return Number(v).toFixed(decimals);
}

/* Map a value to a 0..1 fraction of its display range. Prefers the
   sensor's documented hardCeiling/hardFloor; falls back to the live
   cluster band; finally a data-driven 0..value*1.2 scale. Log-scale
   measurements (Lux, Conductivity) are mapped on a log axis so a
   1k-lux indoor reading isn't a sliver against a 100k ceiling. */
export function valueToFraction(label, v, ctx) {
  if (!Number.isFinite(v)) return 0;
  const cfg = ctx.axisConfig[label] ?? {};
  let lo, hi;
  if (cfg.hardCeiling != null) {
    lo = cfg.hardFloor ?? 0;
    hi = cfg.hardCeiling;
  } else {
    const r = ctx.currentRanges[label];
    if (r && r.max > r.min) { lo = r.min; hi = r.max; }
    else { lo = 0; hi = Math.max(v * 1.2, 1); }
  }
  if (cfg.log) {
    const lv = Math.log10(Math.max(v, 1));
    const llo = Math.log10(Math.max(lo, 1));
    const lhi = Math.log10(Math.max(hi, 1));
    return lhi > llo ? clamp01((lv - llo) / (lhi - llo)) : 0;
  }
  return hi > lo ? clamp01((v - lo) / (hi - lo)) : 0;
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

/* Index of the active insight band for a given value. -1 if no match. */
export function activeBandIndex(label, v) {
  if (!Number.isFinite(v)) return -1;
  const bands = INSIGHT_BANDS[label] ?? [];
  return bands.findIndex((b) => v >= b.from && v < b.to);
}

/* Polar-to-cartesian on a semicircle gauge (180° at left, 0° at right,
   travelling along the upper arc).  pct ∈ [0,1] returns the point on
   that arc at the given fraction of the sweep. */
export function arcPoint(cx, cy, r, pct) {
  const theta = (180 - clamp01(pct) * 180) * Math.PI / 180;
  return {
    x: cx + r * Math.cos(theta),
    y: cy - r * Math.sin(theta),
  };
}

/* Stroke colours that escalate across insight bands (green → purple). */
export const BAND_COLOR_RAMP = ['#00D472', '#7BD300', '#FEBF3A', '#FF6B2F', '#E30E37', '#8B25E4'];

export function bandColor(idx, total) {
  if (idx < 0) return '#666';
  // Map idx∈[0,total-1] onto BAND_COLOR_RAMP indices.
  if (total <= BAND_COLOR_RAMP.length) {
    const stride = (BAND_COLOR_RAMP.length - 1) / Math.max(1, total - 1);
    return BAND_COLOR_RAMP[Math.min(BAND_COLOR_RAMP.length - 1, Math.round(idx * stride))];
  }
  return BAND_COLOR_RAMP[idx % BAND_COLOR_RAMP.length];
}
