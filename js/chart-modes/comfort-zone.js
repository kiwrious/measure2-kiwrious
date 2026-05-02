/* ============================================================
   Comfort zone — Temperature × Humidity scatter with a shaded
   "comfortable" region. Specific to the Humidity sensor.
   ============================================================ */

import { AXIS_CONFIG, lastValueAt } from './ctx.js';

const T_MIN = 5, T_MAX = 35;
const H_MIN = 0, H_MAX = 100;
const COMFORT_T = [20, 25];
const COMFORT_H = [30, 50];

// Roomy padding so axis tick numbers don't crowd the rotated axis titles
// or the plot edges.
const W = 360, H = 250;
const PAD_L = 56, PAD_B = 44, PAD_T = 18, PAD_R = 18;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

let host = null;

export default {
  id: 'comfort-zone',
  label: 'Comfort zone',
  iconSvg:
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.2" rx="1"/>' +
    '<rect x="6" y="5" width="4" height="4" fill="currentColor" opacity="0.3"/>' +
    '<circle cx="8" cy="7" r="1.5" fill="currentColor"/>' +
    '</svg>',
  appliesTo: (sensorType) => sensorType === 'HUMIDITY',

  mount(hostEl, ctx) {
    host = hostEl;
    const cx = PAD_L + ((COMFORT_T[0] - T_MIN) / (T_MAX - T_MIN)) * PLOT_W;
    const cw = ((COMFORT_T[1] - COMFORT_T[0]) / (T_MAX - T_MIN)) * PLOT_W;
    const cy = PAD_T + ((H_MAX - COMFORT_H[1]) / (H_MAX - H_MIN)) * PLOT_H;
    const ch = ((COMFORT_H[1] - COMFORT_H[0]) / (H_MAX - H_MIN)) * PLOT_H;
    // Use the Humidity sensor's own theme colour for the position dot so
    // the chart matches the rest of the modes for this sensor.
    const dotColour = AXIS_CONFIG.Hum?.color ?? '#80C3FF';
    host.innerHTML = `
      <div class="mode-comfort">
        <svg class="comfort__svg" viewBox="0 0 ${W} ${H}">
          <rect x="${PAD_L}" y="${PAD_T}" width="${PLOT_W}" height="${PLOT_H}"
                fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
          <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}"
                fill="rgba(0,212,114,0.12)" stroke="rgba(0,212,114,0.55)"
                stroke-width="1" stroke-dasharray="3 3" rx="2"/>
          <text x="${cx + cw / 2}" y="${cy + ch / 2 + 4}" text-anchor="middle"
                font-size="10" fill="rgba(0,212,114,0.85)">comfort</text>
          ${renderAxes()}
          <circle class="comfort__dot" cx="${PAD_L}" cy="${PAD_T + PLOT_H}" r="7"
                  fill="${dotColour}" stroke="rgba(0,0,0,0.4)" stroke-width="1.5"
                  style="transition: cx 0.4s linear, cy 0.4s linear"/>
          <text class="comfort__x-axis" x="${PAD_L + PLOT_W / 2}" y="${H - 8}"
                text-anchor="middle" font-size="11" font-weight="500"
                fill="rgba(255,255,255,0.55)">Temperature (°C)</text>
          <text class="comfort__y-axis" x="14" y="${PAD_T + PLOT_H / 2}"
                transform="rotate(-90 14 ${PAD_T + PLOT_H / 2})"
                text-anchor="middle" font-size="11" font-weight="500"
                fill="rgba(255,255,255,0.55)">Humidity (%)</text>
        </svg>
      </div>
    `;
    this.update(ctx);
  },

  update(ctx) {
    if (!host) return;
    const tIdx = ctx.seriesLabels.indexOf('Temp');
    const hIdx = ctx.seriesLabels.indexOf('Hum');
    const t = tIdx >= 0 ? lastValueAt(ctx.series, tIdx) : null;
    const h = hIdx >= 0 ? lastValueAt(ctx.series, hIdx) : null;
    const dot = host.querySelector('.comfort__dot');
    if (Number.isFinite(t) && Number.isFinite(h)) {
      const tc = Math.max(T_MIN, Math.min(T_MAX, t));
      const hc = Math.max(H_MIN, Math.min(H_MAX, h));
      const x = PAD_L + ((tc - T_MIN) / (T_MAX - T_MIN)) * PLOT_W;
      const y = PAD_T + ((H_MAX - hc) / (H_MAX - H_MIN)) * PLOT_H;
      dot.setAttribute('cx', x.toFixed(1));
      dot.setAttribute('cy', y.toFixed(1));
    }
  },

  destroy() {
    if (host) host.innerHTML = '';
    host = null;
  },
};

function renderAxes() {
  // Spread ticks more thinly so labels have room to breathe.
  const xTicks = [10, 20, 30];
  const yTicks = [0, 50, 100];
  const x = xTicks.map((t) => {
    const px = PAD_L + ((t - T_MIN) / (T_MAX - T_MIN)) * PLOT_W;
    return `<text x="${px}" y="${PAD_T + PLOT_H + 18}" text-anchor="middle"
                  font-size="11" fill="rgba(255,255,255,0.55)">${t}°</text>`;
  }).join('');
  const y = yTicks.map((h) => {
    const py = PAD_T + ((H_MAX - h) / (H_MAX - H_MIN)) * PLOT_H;
    return `<text x="${PAD_L - 12}" y="${py + 4}" text-anchor="end"
                  font-size="11" fill="rgba(255,255,255,0.55)">${h}%</text>`;
  }).join('');
  return x + y;
}
