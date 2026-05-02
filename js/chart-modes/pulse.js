/* ============================================================
   Pulse — beating heart that scales at the current BPM.
   Specific to the Heart Rate sensor.
   ============================================================ */

import { AXIS_CONFIG, lastValueAt, fmtNum, INSIGHT_BANDS } from './ctx.js';

let host = null;

export default {
  id: 'pulse',
  label: 'Pulse',
  iconSvg:
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<path d="M8 14 L 2.5 8 A 3 3 0 0 1 6.5 3.5 L 8 5 L 9.5 3.5 A 3 3 0 0 1 13.5 8 Z" fill="currentColor"/>' +
    '</svg>',
  appliesTo: (sensorType) => sensorType === 'HEART_RATE',

  mount(hostEl, ctx) {
    host = hostEl;
    const colour = AXIS_CONFIG.HeartRate?.color ?? '#FFCBE1';
    host.innerHTML = `
      <div class="mode-pulse" style="--pulse-color: ${colour}">
        <svg class="pulse__heart" viewBox="0 0 100 92">
          <path d="M50 86 L 8 46 A 22 22 0 0 1 38 16 L 50 28 L 62 16 A 22 22 0 0 1 92 46 Z"
                fill="${colour}"/>
        </svg>
        <div class="pulse__row">
          <span class="pulse__bpm">—</span>
          <span class="pulse__unit">bpm</span>
        </div>
        <div class="pulse__band">—</div>
      </div>
    `;
    this.update(ctx);
  },

  update(ctx) {
    if (!host) return;
    const i = ctx.seriesLabels.indexOf('HeartRate');
    const v = i >= 0 ? lastValueAt(ctx.series, i) : null;
    host.querySelector('.pulse__bpm').textContent = fmtNum(v, 0);
    const heart = host.querySelector('.pulse__heart');
    if (Number.isFinite(v) && v > 0) {
      heart.style.animationDuration = `${(60 / v).toFixed(2)}s`;
      heart.style.animationPlayState = 'running';
    } else {
      heart.style.animationPlayState = 'paused';
    }
    const bands = INSIGHT_BANDS.HeartRate ?? [];
    const idx = Number.isFinite(v) ? bands.findIndex((b) => v >= b.from && v < b.to) : -1;
    host.querySelector('.pulse__band').textContent = idx >= 0 ? bands[idx].label : '—';
  },

  destroy() {
    if (host) host.innerHTML = '';
    host = null;
  },
};
