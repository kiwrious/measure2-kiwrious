/* ============================================================
   Big-number mode — large current value + 60s sparkline.
   Universal (every sensor).
   ============================================================ */

import { AXIS_CONFIG, UNIT_SYMBOL, lastValueAt, fmtNum, escapeHtml, cssEscape } from './ctx.js';

const SPARK_W = 240;
const SPARK_H = 48;

let host = null;

export default {
  id: 'big-number',
  label: 'Big number',
  iconSvg:
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<text x="8" y="12" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor" font-family="sans-serif">42</text>' +
    '</svg>',
  appliesTo: () => true,

  mount(hostEl, ctx) {
    host = hostEl;
    host.innerHTML = `
      <div class="mode-big">
        ${ctx.seriesLabels.map((label) => {
          const cfg = AXIS_CONFIG[label] ?? {};
          const colour = cfg.color ?? '#FFF';
          const unit = UNIT_SYMBOL[label] ?? '';
          return `
            <div class="big" data-label="${escapeHtml(label)}">
              <div class="big__name">${escapeHtml(cfg.title ?? label)}</div>
              <div class="big__row">
                <div class="big__value" style="color: ${colour}">—</div>
                <div class="big__unit">${escapeHtml(unit)}</div>
              </div>
              <svg class="big__spark" viewBox="0 0 ${SPARK_W} ${SPARK_H}" preserveAspectRatio="none">
                <polyline class="big__spark-line"
                          fill="none" stroke="${colour}" stroke-width="1.5"
                          stroke-linejoin="round" stroke-linecap="round" points=""/>
              </svg>
            </div>
          `;
        }).join('')}
      </div>
    `;
    this.update(ctx);
  },

  update(ctx) {
    if (!host) return;
    ctx.seriesLabels.forEach((label, i) => {
      const big = host.querySelector(`[data-label="${cssEscape(label)}"]`);
      if (!big) return;
      const cfg = AXIS_CONFIG[label] ?? {};
      const v = lastValueAt(ctx.series, i);
      big.querySelector('.big__value').textContent = fmtNum(v, cfg.decimals ?? 1);
      const sparkLine = big.querySelector('.big__spark-line');
      sparkLine.setAttribute('points', sparklinePoints(ctx.series[i]?.data ?? []));
    });
  },

  destroy() {
    if (host) host.innerHTML = '';
    host = null;
  },
};

function sparklinePoints(data) {
  const pts = data.filter((p) => Number.isFinite(p.y));
  if (pts.length < 2) return '';
  const ys = pts.map((p) => p.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  const len = pts.length;
  return pts
    .map((p, idx) => {
      const x = (idx / (len - 1)) * SPARK_W;
      const y = SPARK_H - ((p.y - min) / range) * (SPARK_H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}
