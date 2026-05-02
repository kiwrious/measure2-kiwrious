/* ============================================================
   Bar mode — instantaneous bars, CSS-animated heights.
   ============================================================ */

import { AXIS_CONFIG, lastValueAt, valueToFraction, fmtNum, escapeHtml, cssEscape } from './ctx.js';

let host = null;

export default {
  id: 'bar',
  label: 'Bar',
  iconSvg:
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<rect x="2" y="9" width="3" height="5" fill="currentColor" rx="0.5"/>' +
    '<rect x="6.5" y="5" width="3" height="9" fill="currentColor" rx="0.5"/>' +
    '<rect x="11" y="2" width="3" height="12" fill="currentColor" rx="0.5"/>' +
    '</svg>',
  appliesTo: () => true,

  mount(hostEl, ctx) {
    host = hostEl;
    host.innerHTML = `
      <div class="mode-bar">
        ${ctx.seriesLabels.map((label) => {
          const cfg = AXIS_CONFIG[label] ?? {};
          return `
            <div class="cbar" data-label="${escapeHtml(label)}">
              <div class="cbar__col">
                <div class="cbar__value">—</div>
                <div class="cbar__fill" style="--cbar-color: ${cfg.color ?? '#fff'}"></div>
              </div>
              <div class="cbar__name">${escapeHtml(cfg.title ?? label)}</div>
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
      const v = lastValueAt(ctx.series, i);
      const cbar = host.querySelector(`[data-label="${cssEscape(label)}"]`);
      if (!cbar) return;
      const cfg = AXIS_CONFIG[label] ?? {};
      const fill = cbar.querySelector('.cbar__fill');
      const valueEl = cbar.querySelector('.cbar__value');
      fill.style.height = `${valueToFraction(label, v, ctx) * 100}%`;
      valueEl.textContent = fmtNum(v, cfg.decimals ?? 1);
    });
  },

  destroy() {
    if (host) host.innerHTML = '';
    host = null;
  },
};
