/* ============================================================
   VOC traffic-light — single coloured chip + verdict + advice.
   Specific to the VOC sensor.
   ============================================================ */

import { INSIGHT_BANDS, lastValueAt, fmtNum } from './ctx.js';

const VL_COLORS = ['#00D472', '#7BD300', '#FEBF3A', '#FF6B2F', '#E30E37'];

let host = null;

export default {
  id: 'voc-light',
  label: 'Air quality',
  iconSvg:
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<rect x="5" y="1" width="6" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
    '<circle cx="8" cy="4.5" r="1.4" fill="currentColor"/>' +
    '<circle cx="8" cy="8" r="1.4" fill="currentColor" opacity="0.4"/>' +
    '<circle cx="8" cy="11.5" r="1.4" fill="currentColor" opacity="0.4"/>' +
    '</svg>',
  appliesTo: (sensorType) => sensorType === 'VOC',

  mount(hostEl, ctx) {
    host = hostEl;
    host.innerHTML = `
      <div class="mode-voclight">
        <div class="voclight__chip">
          <div class="voclight__halo"></div>
          <div class="voclight__core"></div>
        </div>
        <div class="voclight__band">—</div>
        <div class="voclight__row">
          <span class="voclight__value">—</span>
          <span class="voclight__unit">ppb</span>
        </div>
        <div class="voclight__desc">Connect to read air quality</div>
      </div>
    `;
    this.update(ctx);
  },

  update(ctx) {
    if (!host) return;
    const i = ctx.seriesLabels.indexOf('Voc');
    const v = i >= 0 ? lastValueAt(ctx.series, i) : null;
    const bands = INSIGHT_BANDS.Voc ?? [];
    const idx = Number.isFinite(v) ? bands.findIndex((b) => v >= b.from && v < b.to) : -1;
    const chip = host.querySelector('.voclight__chip');
    const bandEl = host.querySelector('.voclight__band');
    const descEl = host.querySelector('.voclight__desc');
    const valEl = host.querySelector('.voclight__value');
    const colour = idx >= 0 ? VL_COLORS[idx] : '#666';
    chip.style.setProperty('--vl-color', colour);
    valEl.textContent = fmtNum(v, 0);
    if (idx >= 0) {
      bandEl.textContent = bands[idx].label;
      bandEl.style.color = colour;
      descEl.textContent = bands[idx].desc;
    } else {
      bandEl.textContent = '—';
      bandEl.style.color = '';
      descEl.textContent = '—';
    }
  },

  destroy() {
    if (host) host.innerHTML = '';
    host = null;
  },
};
