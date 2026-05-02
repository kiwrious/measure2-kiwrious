/* ============================================================
   Gauge mode — semicircular dial per measurement, coloured by
   the active insight band. Universal (works for every sensor).
   ============================================================ */

import {
  AXIS_CONFIG, INSIGHT_BANDS, lastValueAt, valueToFraction,
  fmtNum, escapeHtml, cssEscape, arcPoint, activeBandIndex,
} from './ctx.js';

const ARC_LEN = Math.PI * 80; // radius 80 → semicircle length

let host = null;

export default {
  id: 'gauge',
  label: 'Gauge',
  iconSvg:
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<path d="M2 12 A6 6 0 0 1 14 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
    '<line x1="8" y1="12" x2="11" y2="6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
    '<circle cx="8" cy="12" r="1.2" fill="currentColor"/>' +
    '</svg>',
  appliesTo: () => true,

  mount(hostEl, ctx) {
    host = hostEl;
    host.innerHTML = `
      <div class="mode-gauge">
        ${ctx.seriesLabels.map((label) => renderGauge(label)).join('')}
      </div>
    `;
    this.update(ctx);
  },

  update(ctx) {
    if (!host) return;
    ctx.seriesLabels.forEach((label, i) => {
      const cfg = AXIS_CONFIG[label] ?? {};
      const v = lastValueAt(ctx.series, i);
      const gauge = host.querySelector(`[data-label="${cssEscape(label)}"]`);
      if (!gauge) return;
      const fg = gauge.querySelector('.gauge__fg');
      const dot = gauge.querySelector('.gauge__dot');
      const valueEl = gauge.querySelector('.gauge__value');
      const labelEl = gauge.querySelector('.gauge__band');

      const pct = valueToFraction(label, v, ctx);
      fg.setAttribute('stroke-dasharray', `${ARC_LEN * pct} ${ARC_LEN}`);

      // Arc and dot stay in the variable's theme colour; the band label
      // below conveys the qualitative state instead of recolouring the arc.
      const colour = cfg.color ?? '#FFFFFF';
      fg.setAttribute('stroke', colour);
      dot.setAttribute('fill', colour);

      const p = arcPoint(100, 100, 80, pct);
      dot.setAttribute('cx', p.x.toFixed(1));
      dot.setAttribute('cy', p.y.toFixed(1));

      valueEl.textContent = fmtNum(v, cfg.decimals ?? 1);
      const bands = INSIGHT_BANDS[label] ?? [];
      const idx = activeBandIndex(label, v);
      labelEl.textContent = idx >= 0 ? bands[idx].label : '';
    });
  },

  destroy() {
    if (host) host.innerHTML = '';
    host = null;
  },
};

function renderGauge(label) {
  const cfg = AXIS_CONFIG[label] ?? {};
  return `
    <div class="gauge" data-label="${escapeHtml(label)}">
      <svg class="gauge__svg" viewBox="0 0 200 130">
        <path class="gauge__bg" d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="14" stroke-linecap="round"/>
        <path class="gauge__fg" d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none" stroke="${cfg.color ?? '#FFF'}" stroke-width="14"
              stroke-linecap="round" stroke-dasharray="0 ${ARC_LEN}"
              style="transition: stroke-dasharray 0.4s linear, stroke 0.3s linear"/>
        <circle class="gauge__dot" cx="20" cy="100" r="6"
                fill="${cfg.color ?? '#FFF'}" stroke="rgba(0,0,0,0.4)" stroke-width="1"
                style="transition: cx 0.4s linear, cy 0.4s linear, fill 0.3s linear"/>
        <text class="gauge__value" x="100" y="80" text-anchor="middle"
              font-size="22" font-weight="600" fill="white" font-family="Roboto">—</text>
        <text class="gauge__band" x="100" y="120" text-anchor="middle"
              font-size="11" font-weight="500" fill="rgba(255,255,255,0.7)"
              letter-spacing="0.4"></text>
      </svg>
      <div class="gauge__name">${escapeHtml(cfg.title ?? label)}</div>
    </div>
  `;
}
