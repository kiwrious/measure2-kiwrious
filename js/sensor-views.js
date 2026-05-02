/* ============================================================
   Sensor value renderers — produce SVG/HTML for each sensor type
   Mirrors the per-sensor SVG components from kiwrious-measure-vue
   ============================================================ */

import { SENSOR_TYPE, uvBand } from './constants.js';

const escape = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function svg(content, opts = {}) {
  const vb = opts.viewBox || '0 0 640 320';
  return `<svg class="sv-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet">${content}</svg>`;
}

/* UV: Lux + UV index (two side-by-side gauges, dynamic UV band colour)
 * Vue index lookup: decoded[0] = Lux, decoded[1] = Uv
 * --------------------------------------------------------- */
function renderUV(values) {
  const lux = num(values.find((v) => v.label === 'Lux')?.value);
  const uv  = num(values.find((v) => v.label === 'Uv')?.value);
  const band = uvBand(uv);

  return svg(`
    <!-- Left: UV index -->
    <g transform="translate(150,80)" font-family="Roboto, sans-serif" text-anchor="middle">
      <!-- Sun glyph -->
      <g transform="translate(0,-20)" fill="${band.color}">
        <circle cx="0" cy="0" r="22"/>
        <g stroke="${band.color}" stroke-width="4" stroke-linecap="round">
          <line x1="0" y1="-36" x2="0" y2="-46"/>
          <line x1="0" y1="36"  x2="0" y2="46"/>
          <line x1="-36" y1="0" x2="-46" y2="0"/>
          <line x1="36"  y1="0" x2="46"  y2="0"/>
          <line x1="-26" y1="-26" x2="-33" y2="-33"/>
          <line x1="26"  y1="-26" x2="33"  y2="-33"/>
          <line x1="-26" y1="26"  x2="-33" y2="33"/>
          <line x1="26"  y1="26"  x2="33"  y2="33"/>
        </g>
      </g>
      <text x="0" y="80" font-size="64" font-weight="700" fill="${band.color}">${uv.toFixed(1)}</text>
      <text x="0" y="110" font-size="14" letter-spacing="0.6" fill="#cfd0d3">UV INDEX</text>
      <text x="0" y="135" font-size="14" font-weight="700" letter-spacing="0.6" fill="${band.color}">${band.label}</text>
    </g>

    <!-- Right: Lux -->
    <g transform="translate(450,80)" font-family="Roboto, sans-serif" text-anchor="middle">
      <!-- Bulb glyph -->
      <g transform="translate(0,-20)" fill="#8038EA">
        <path d="M0 -36 a24 24 0 0 1 24 24 c0 12 -8 16 -12 24 l-24 0 c-4 -8 -12 -12 -12 -24 a24 24 0 0 1 24 -24 z"/>
        <rect x="-10" y="14" width="20" height="6" rx="2"/>
        <rect x="-7"  y="22" width="14" height="4" rx="2"/>
      </g>
      <text x="0" y="80" font-size="44" font-weight="700" fill="#FFFFFF">${Math.round(lux).toLocaleString()}</text>
      <text x="0" y="110" font-size="14" letter-spacing="0.6" fill="#cfd0d3">LUX</text>
    </g>
  `);
}

/* HUMIDITY: ambient temperature + relative humidity (two gauges)
 * Vue: decoded[0]=Temp, decoded[1]=Hum
 * --------------------------------------------------------- */
function renderHumidity(values) {
  const t = num(values.find((v) => v.label === 'Temp')?.value);
  const h = num(values.find((v) => v.label === 'Hum')?.value);
  return svg(`
    <!-- Left: temperature -->
    <g transform="translate(160,80)" font-family="Roboto, sans-serif" text-anchor="middle">
      <g transform="translate(0,-22)" fill="#D90033">
        <rect x="-6" y="-30" width="12" height="42" rx="6"/>
        <circle cx="0" cy="20" r="14"/>
      </g>
      <text x="0" y="80" font-size="58" font-weight="700" fill="#FFFFFF">${t.toFixed(1)}<tspan font-size="32" dy="-18">°</tspan></text>
      <text x="0" y="110" font-size="14" letter-spacing="0.6" fill="#cfd0d3">CELSIUS</text>
    </g>

    <!-- Right: humidity -->
    <g transform="translate(440,80)" font-family="Roboto, sans-serif" text-anchor="middle">
      <g transform="translate(0,-20)" fill="#3BA3FF">
        <path d="M0 -28 C-12 -10 -24 4 -24 16 a24 24 0 0 0 48 0 C24 4 12 -10 0 -28 z"/>
      </g>
      <text x="0" y="80" font-size="58" font-weight="700" fill="#FFFFFF">${h.toFixed(1)}<tspan font-size="22" dy="-18">%</tspan></text>
      <text x="0" y="110" font-size="14" letter-spacing="0.6" fill="#cfd0d3">HUMIDITY</text>
    </g>
  `);
}

/* TEMPERATURE: infrared (large) + ambient (small)
 * Vue: decoded[0]=AmbientTemp, decoded[1]=InfraredTemp
 * --------------------------------------------------------- */
function renderTemperature(values) {
  const ir = num(values.find((v) => v.label === 'InfraredTemp')?.value);
  const ambient = num(values.find((v) => v.label === 'AmbientTemp')?.value);
  return svg(`
    <g transform="translate(320,80)" font-family="Roboto, sans-serif" text-anchor="middle">
      <g transform="translate(-100,-26)" fill="#D90033">
        <rect x="-6" y="-32" width="12" height="44" rx="6"/>
        <circle cx="0" cy="20" r="14"/>
      </g>
      <text x="20" y="50" font-size="14" letter-spacing="0.6" fill="#cfd0d3" text-anchor="start">SURFACE</text>
      <text x="20" y="-10" font-size="56" font-weight="700" fill="#FFFFFF" text-anchor="start">${ir.toFixed(1)}<tspan font-size="28" dy="-18">°</tspan></text>
    </g>

    <g transform="translate(320,210)" font-family="Roboto, sans-serif" text-anchor="middle">
      <g transform="translate(-100,-12)" fill="#F05479">
        <circle cx="0" cy="0" r="10"/>
      </g>
      <text x="20" y="-2" font-size="32" font-weight="700" fill="#cfd0d3" text-anchor="start">${ambient.toFixed(1)}<tspan font-size="18" dy="-10">°</tspan></text>
      <text x="20" y="22" font-size="11" letter-spacing="0.6" fill="#9aa1a8" text-anchor="start">AMBIENT (CELSIUS)</text>
    </g>
  `);
}

/* CONDUCTIVITY: single centred gauge with status overlay */
function renderConductivity(values) {
  const decoded = values[0]?.value;
  const status = decoded?.status ?? 'READY';
  const raw = decoded?.value;
  const isMax = status === 'MAX';
  const isMin = status === 'MIN';
  const display = isMax ? 'MAX' : isMin ? '0' : (typeof raw === 'number' ? raw.toFixed(1) : raw);
  const fill = isMax || isMin ? '#9aa1a8' : '#FFFFFF';
  const sub = isMax ? 'OVER RANGE'
            : isMin ? 'OPEN CIRCUIT'
                    : 'µS / cm';

  return svg(`
    <g transform="translate(320,140)" font-family="Roboto, sans-serif" text-anchor="middle">
      <g transform="translate(-130,-20)" fill="#FABC14">
        <path d="M0 -36 L-16 4 L-4 4 L-12 36 L20 -8 L8 -8 L20 -36 z"/>
      </g>
      <text x="-50" y="-4" font-size="56" font-weight="700" fill="${fill}" text-anchor="start">${display}</text>
      <text x="-50" y="22" font-size="18" letter-spacing="0.6" fill="#9aa1a8" text-anchor="start">${sub}</text>
    </g>
  `);
}

/* VOC: single gauge + warm-up overlay */
function renderVOC(values) {
  const decoded = values[0]?.value;
  const status = decoded?.status ?? 'PROCESSING';
  const pct = num(decoded?.dataReadyPercentage);
  const v   = num(decoded?.value);

  if (status !== 'READY') {
    return `
      <div class="voc-overlay">
        <p class="voc-overlay__title">VOC sensor warming up…</p>
        <div class="voc-overlay__progress">
          <div class="voc-overlay__bar" style="width:${Math.min(100, pct).toFixed(0)}%"></div>
        </div>
        <p class="voc-overlay__title" style="font-size:14px; color:#9aa1a8">${pct.toFixed(0)}%</p>
      </div>
    `;
  }

  return svg(`
    <g transform="translate(320,140)" font-family="Roboto, sans-serif" text-anchor="middle">
      <g transform="translate(-130,-20)" fill="#00D36A">
        <path d="M0 -28 C-30 -28 -36 0 -28 24 C-4 22 12 4 16 -16 C8 -4 -4 0 -16 -8 C-12 -22 0 -28 0 -28 z"/>
      </g>
      <text x="-50" y="-4" font-size="48" font-weight="700" fill="#FFFFFF" text-anchor="start">${Math.round(v).toLocaleString()}</text>
      <text x="-50" y="22" font-size="18" letter-spacing="0.6" fill="#9aa1a8" text-anchor="start">ppb</text>
    </g>
  `);
}

/* HEART_RATE: 4 states — READY / PROCESSING / TOO_LOW / TOO_HIGH */
function renderHeartRate(values) {
  const decoded = values[0]?.value;
  const status = decoded?.status ?? 'PROCESSING';
  const bpm = num(decoded?.value);

  if (status === 'PROCESSING') {
    return `
      <div class="hr-state">
        <p class="hr-state__title">Detecting pulse…</p>
        <img class="hr-state__gif" src="assets/gif/HR_processing.gif" alt="">
      </div>`;
  }
  if (status === 'TOO_LOW') {
    return `
      <div class="hr-state">
        <p class="hr-state__title">Place your fingertip on the sensor</p>
        <img class="hr-state__gif" src="assets/gif/HR_TooLow.gif" alt="">
        <p class="hr-state__sub">Cover the sensor lightly — do not press down hard</p>
      </div>`;
  }
  if (status === 'TOO_HIGH') {
    return `
      <div class="hr-state">
        <p class="hr-state__title">Heartbeat detection error</p>
        <img class="hr-state__gif" src="assets/gif/HR_TooHigh.gif" alt="">
        <p class="hr-state__sub">Do not press down too hard on the sensor</p>
      </div>`;
  }

  // READY
  return svg(`
    <g transform="translate(320,140)" font-family="Roboto, sans-serif" text-anchor="middle">
      <g transform="translate(-110,-30)" fill="#FF006E">
        <path d="M0 0 C-30 -34 -68 -8 -34 28 C-22 40 0 60 0 60 C0 60 22 40 34 28 C68 -8 30 -34 0 0 z" transform="translate(0,-10)"/>
      </g>
      <text x="-30" y="6" font-size="64" font-weight="700" fill="#FFFFFF" text-anchor="start">${Math.round(bpm)}</text>
      <text x="-30" y="36" font-size="16" letter-spacing="0.6" fill="#cfd0d3" text-anchor="start">BPM • HEART RATE</text>
    </g>
  `, { viewBox: '0 0 640 320' });
}

/* Dispatcher */
export function renderSensor(sensorType, decodedValues) {
  if (!decodedValues || decodedValues.length === 0) {
    return '<div class="hr-state"><p class="hr-state__title">Waiting for data…</p></div>';
  }
  switch (sensorType) {
    case SENSOR_TYPE.UV:           return renderUV(decodedValues);
    case SENSOR_TYPE.HUMIDITY:     return renderHumidity(decodedValues);
    case SENSOR_TYPE.TEMPERATURE:  return renderTemperature(decodedValues);
    case SENSOR_TYPE.CONDUCTIVITY: return renderConductivity(decodedValues);
    case SENSOR_TYPE.VOC:          return renderVOC(decodedValues);
    case SENSOR_TYPE.HEART_RATE:   return renderHeartRate(decodedValues);
    default:
      return `<div class="hr-state"><p class="hr-state__title">Unknown sensor: ${escape(sensorType)}</p></div>`;
  }
}
