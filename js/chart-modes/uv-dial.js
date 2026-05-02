/* ============================================================
   UV safety dial — large coloured arc with safety advisory.
   Specific to the UV sensor (uses the Uv index).
   ============================================================ */

import { INSIGHT_BANDS, lastValueAt, fmtNum, escapeHtml, BAND_COLOR_RAMP } from './ctx.js';

const UV_MAX = 12;
const CX = 140, CY = 130, R = 110;

let host = null;

export default {
  id: 'uv-dial',
  label: 'UV safety',
  iconSvg:
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<circle cx="8" cy="8" r="3" fill="currentColor"/>' +
    '<g stroke="currentColor" stroke-width="1.4" stroke-linecap="round">' +
    '<line x1="8" y1="1" x2="8" y2="2.5"/><line x1="8" y1="13.5" x2="8" y2="15"/>' +
    '<line x1="1" y1="8" x2="2.5" y2="8"/><line x1="13.5" y1="8" x2="15" y2="8"/>' +
    '<line x1="3" y1="3" x2="4" y2="4"/><line x1="12" y1="12" x2="13" y2="13"/>' +
    '<line x1="3" y1="13" x2="4" y2="12"/><line x1="12" y1="4" x2="13" y2="3"/>' +
    '</g></svg>',
  appliesTo: (sensorType) => sensorType === 'UV',

  mount(hostEl, ctx) {
    host = hostEl;
    const bandsSvg = INSIGHT_BANDS.Uv.map((b, i) => {
      const a1 = (180 - (Math.min(b.from, UV_MAX) / UV_MAX) * 180) * Math.PI / 180;
      const a2 = (180 - (Math.min(b.to, UV_MAX) / UV_MAX) * 180) * Math.PI / 180;
      const x1 = CX + R * Math.cos(a1), y1 = CY - R * Math.sin(a1);
      const x2 = CX + R * Math.cos(a2), y2 = CY - R * Math.sin(a2);
      return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}"
                    fill="none" stroke="${BAND_COLOR_RAMP[i]}" stroke-width="22" stroke-linecap="butt"/>`;
    }).join('');
    host.innerHTML = `
      <div class="mode-uvdial">
        <svg class="uvdial__svg" viewBox="0 0 280 180">
          ${bandsSvg}
          <circle class="uvdial__dot" cx="${CX - R}" cy="${CY}" r="9"
                  fill="white" stroke="rgba(0,0,0,0.5)" stroke-width="2"
                  style="transition: cx 0.4s linear, cy 0.4s linear"/>
          <text x="${CX}" y="100" text-anchor="middle"
                font-size="48" font-weight="700" fill="white"
                font-family="Roboto" class="uvdial__value">—</text>
          <text x="${CX}" y="125" text-anchor="middle"
                font-size="11" fill="rgba(255,255,255,0.55)"
                letter-spacing="2">UV INDEX</text>
        </svg>
        <div class="uvdial__band">—</div>
        <div class="uvdial__desc">Connect a UV sensor to read live UV index</div>
      </div>
    `;
    this.update(ctx);
  },

  update(ctx) {
    if (!host) return;
    const i = ctx.seriesLabels.indexOf('Uv');
    const v = i >= 0 ? lastValueAt(ctx.series, i) : null;
    const bands = INSIGHT_BANDS.Uv ?? [];
    const idx = Number.isFinite(v) ? bands.findIndex((b) => v >= b.from && v < b.to) : -1;
    host.querySelector('.uvdial__value').textContent = fmtNum(v, 0);
    const bandEl = host.querySelector('.uvdial__band');
    const descEl = host.querySelector('.uvdial__desc');
    if (idx >= 0) {
      bandEl.textContent = bands[idx].label;
      bandEl.style.color = BAND_COLOR_RAMP[idx];
      descEl.textContent = bands[idx].desc;
    } else {
      bandEl.textContent = '—';
      bandEl.style.color = '';
      descEl.textContent = '—';
    }
    const dot = host.querySelector('.uvdial__dot');
    if (Number.isFinite(v)) {
      const pct = Math.max(0, Math.min(1, v / UV_MAX));
      const a = (180 - pct * 180) * Math.PI / 180;
      dot.setAttribute('cx', (CX + R * Math.cos(a)).toFixed(1));
      dot.setAttribute('cy', (CY - R * Math.sin(a)).toFixed(1));
    }
  },

  destroy() {
    if (host) host.innerHTML = '';
    host = null;
  },
};
