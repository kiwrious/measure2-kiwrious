/* ============================================================
   Classic sensor value renderers — port of the original
   measure-kiwrious-com sensor pebble SVGs (the recognisable
   hexagonal sensor "rocks" with the reading overlaid).
   Each renderer accepts the decodedValues array from the SDK.
   viewBox is 640x400 to match the Vue layout coordinates 1:1.
   ============================================================ */

import { SENSOR_TYPE, uvBand } from './constants.js';

const escape = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* Pebble values are anchored inside a ~160px-wide hexagon. The reading's
   character count varies a lot (UV "9.9" vs lux "100,000"), so pick a
   font-size that keeps the longest string from spilling over the rim. */
function fitFontSize(s, sizes = [44, 38, 32, 26, 22]) {
  const len = String(s).length;
  if (len <= 3) return sizes[0];
  if (len <= 4) return sizes[1];
  if (len <= 5) return sizes[2];
  if (len <= 6) return sizes[3];
  return sizes[4];
}

/* Tight viewBox crops the empty whitespace around the pebbles in the
   ported Vue layouts (originally 0 0 640 400). The pebbles sit roughly
   in x:150–490, y:30–300; this window pads that bbox modestly so every
   sensor still fits, while letting the content render ~1.45× larger
   inside the same .sensor-value-area — without resizing the container
   or shrinking the chart below it. */
function svg(content) {
  return `<svg class="sv-svg sv-svg--classic" xmlns="http://www.w3.org/2000/svg"
              viewBox="100 20 440 290" preserveAspectRatio="xMidYMid meet">${content}</svg>`;
}

/* ------------------------------------------------------------
   Conductivity — yellow pebble with bolt glyph, single value
   Vue: SensorValueConductivity.html (translate 240,120)
   ------------------------------------------------------------ */
function renderConductivityClassic(values) {
  const decoded = values[0]?.value;
  const status = decoded?.status ?? 'READY';
  const raw = decoded?.value;
  const isMax = status === 'MAX';
  const isMin = status === 'MIN';
  const display = isMax ? 'MAX' : isMin ? '0' : (typeof raw === 'number' ? raw.toFixed(1) : (raw ?? ''));

  return svg(`
    <g fill="none" fill-rule="evenodd" transform="translate(240,120)">
      <path fill="#FABC14"
        d="M6.307 48.683c-1.741 21.153-1.752 41.48.023 62.632.504 6.254 3.232 12.478 8.204 16.2 18.032 12.37 36.129 22.354 56.596 30.818 5.57 2.223 11.987 2.223 17.557 0 20.462-8.45 38.517-18.44 56.524-30.823 4.96-3.723 7.682-9.948 8.231-16.198 1.936-21.167 1.862-41.459.057-62.629-.49-6.255-3.221-12.48-8.196-16.2-18.042-12.362-36.139-22.36-56.616-30.816-5.57-2.223-11.988-2.223-17.557 0-20.473 8.467-38.588 18.454-56.634 30.815-4.98 3.72-7.71 9.946-8.189 16.201"/>
      <g>
        <path d="M0 0H32V32H0z" transform="translate(64 16)"/>
        <path fill="#FFF" fill-rule="nonzero"
          d="M23.954 12.992L19.74 11.99c-.238-.057-.444-.208-.57-.419-.126-.21-.162-.464-.1-.703l1.856-7.162c.063-.246-.044-.504-.262-.63-.219-.127-.494-.091-.673.087-4.903 4.913-9.062 9.718-11.838 14.323-.197.325-.204.732-.019 1.065.185.332.534.538.912.538l4.328.894c.245.05.457.2.589.413.132.214.17.472.107.715l-1.861 7.184c-.064.247.046.508.268.633.221.125.499.084.676-.1 4.392-4.58 8.411-9.274 11.674-14.202.212-.324.23-.739.048-1.08-.183-.342-.537-.555-.921-.554z"
          transform="translate(64 16)"/>
      </g>
      <text fill="#002C33" font-family="sans-serif" font-size="24" font-weight="bold" letter-spacing=".852">
        <tspan x="63.478" y="133">μ</tspan>
        <tspan x="80.958" y="133">S</tspan>
      </text>
      ${(() => {
        const condStr = String(display);
        const size = fitFontSize(condStr, [36, 32, 28, 24, 20]);
        const tracking = (size / 36 * 2).toFixed(2);
        return `<text fill="#002C33" font-family="sans-serif" font-size="${size}" font-weight="bold" letter-spacing="${tracking}" style="text-anchor: middle">
          <tspan x="78.977" y="92">${escape(condStr)}</tspan>
        </text>`;
      })()}
    </g>
  `);
}

/* ------------------------------------------------------------
   VOC — green pebble with bulb glyph, ppb units
   Vue: SensorValueVOC.html (translate 240,120)
   ------------------------------------------------------------ */
function renderVOCClassic(values) {
  const decoded = values[0]?.value;
  const status = decoded?.status ?? 'PROCESSING';
  const pct = num(decoded?.dataReadyPercentage);
  const v = num(decoded?.value);

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

  const vocStr = Math.round(v).toLocaleString();
  const size = fitFontSize(vocStr, [40, 36, 30, 26, 22]);
  return svg(`
    <g fill="none" fill-rule="evenodd" transform="translate(240,120)">
      <path fill="#00D36A" fill-rule="nonzero"
        d="M176 75.567c-.009-11.615-5.558-22.535-14.951-29.419-9.393-6.883-21.51-8.911-32.646-5.463C123.966 28 111.79 19.635 98.31 20.012c-13.482.377-25.167 9.406-28.884 22.32-17.238-9.232-38.411-6.887-53.192 5.891C1.453 61.002-3.857 81.553 2.894 99.851c6.75 18.298 24.156 30.533 43.727 30.738 4.15 16.096 18.05 27.829 34.672 29.264 16.622 1.435 32.342-7.74 39.21-22.886 7.298 7.665 19.423 8.075 27.226.921 7.804-7.154 8.397-19.223 1.332-27.102 15.911-4.367 26.936-18.78 26.939-35.219z"
        transform="translate(-8)"/>
      <text fill="#FFF" font-family="sans-serif" font-size="20" font-weight="bold" letter-spacing=".7" text-anchor="middle" transform="translate(-8)">
        <tspan x="80" y="115">ppb</tspan>
      </text>
      <text fill="#FFF" font-family="sans-serif" font-size="${size}" font-weight="bold" letter-spacing="1.5" text-anchor="middle" transform="translate(-8)">
        <tspan x="80" y="85">${escape(vocStr)}</tspan>
      </text>
    </g>
  `);
}

/* ------------------------------------------------------------
   UV — UV index pebble (band-coloured) + lux pebble (purple)
   Vue: SensorValueUV.html
   ------------------------------------------------------------ */
function renderUVClassic(values) {
  const lux = num(values.find((v) => v.label === 'Lux')?.value);
  const uv  = num(values.find((v) => v.label === 'Uv')?.value);
  const band = uvBand(uv);

  return svg(`
    <g fill="none" fill-rule="evenodd">
      <g transform="translate(150,100)">
        <path fill="${band.color}"
          d="M6.307 48.683c-1.741 21.153-1.752 41.48.023 62.632.504 6.254 3.232 12.478 8.204 16.2 18.032 12.37 36.129 22.354 56.596 30.818 5.57 2.223 11.987 2.223 17.557 0 20.462-8.45 38.517-18.44 56.524-30.823 4.96-3.723 7.682-9.948 8.231-16.198 1.936-21.167 1.862-41.459.057-62.629-.49-6.255-3.221-12.48-8.196-16.2-18.042-12.362-36.139-22.36-56.616-30.816-5.57-2.223-11.988-2.223-17.557 0-20.473 8.467-38.588 18.454-56.634 30.815-4.98 3.72-7.71 9.946-8.189 16.201"/>
        <text fill="#FFF" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing=".568">
          <tspan text-anchor="middle" x="78" y="125">${escape(band.label)}</tspan>
        </text>
        ${(() => {
          const uvStr = uv.toFixed(1);
          const size = fitFontSize(uvStr, [56, 48, 40, 34, 28]);
          const tracking = (size / 56 * 2).toFixed(2);
          return `<text fill="#FFF" font-family="sans-serif" font-size="${size}" font-weight="bold" letter-spacing="${tracking}">
            <tspan text-anchor="middle" x="78" y="102">${escape(uvStr)}</tspan>
          </text>`;
        })()}
        <text fill="#FFF" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing=".568">
          <tspan x="42.073" y="45">UV INDEX</tspan>
        </text>
      </g>
      <g transform="translate(330,100)">
        <path fill="#8038EA" fill-rule="nonzero"
          d="M73.818 2.257c3.572-3.01 8.792-3.01 12.364 0l5.659 5.009c4.03 3.179 9.191 4.561 14.272 3.824l7.404-1.508c4.599-.82 9.12 1.79 10.708 6.182l2.396 7.167c1.902 4.768 5.68 8.546 10.448 10.448l7.167 2.396c4.393 1.588 7.003 6.11 6.182 10.708l-1.508 7.404c-.737 5.08.645 10.241 3.824 14.272l5.009 5.659c3.01 3.572 3.01 8.792 0 12.364l-5.009 5.659c-3.179 4.03-4.561 9.191-3.824 14.272l1.508 7.404c.82 4.599-1.79 9.12-6.182 10.708l-7.167 2.396c-4.768 1.902-8.546 5.68-10.448 10.448l-2.396 7.167c-1.588 4.393-6.11 7.003-10.708 6.182l-7.404-1.508c-5.08-.737-10.241.645-14.272 3.824l-5.659 5.009c-3.572 3.01-8.792 3.01-12.364 0l-5.659-5.009c-4.03-3.179-9.191-4.561-14.272-3.824l-7.404 1.508c-4.599.82-9.12-1.79-10.708-6.182l-2.396-7.167c-1.902-4.768-5.68-8.546-10.448-10.448l-7.167-2.396c-4.393-1.588-7.003-6.11-6.182-10.708l1.508-7.404c.737-5.08-.645-10.241-3.824-14.272l-5.009-5.659c-3.01-3.572-3.01-8.792 0-12.364l5.009-5.659c3.179-4.03 4.561-9.191 3.824-14.272l-1.508-7.404c-.82-4.599 1.79-9.12 6.182-10.708l7.167-2.396c4.768-1.902 8.546-5.68 10.448-10.448l2.396-7.167c1.588-4.393 6.11-7.003 10.708-6.182l7.404 1.508c5.08.737 10.241-.645 14.272-3.824l5.659-5.009z"/>
        <path fill="#FFF"
          d="M87.613 29.28L84 25.667v-5.334C84 19.6 83.4 19 82.667 19h-5.334C76.6 19 76 19.6 76 20.333v5.334l-3.613 3.613c-.254.253-.387.587-.387.947V35c0 .733.6 1.333 1.333 1.333h13.334c.733 0 1.333-.6 1.333-1.333v-4.787c0-.346-.147-.693-.387-.933zM80 45.667c-.733 0-1.333-.6-1.333-1.334V43c0-.733.6-1.333 1.333-1.333s1.333.6 1.333 1.333v1.333c0 .734-.6 1.334-1.333 1.334zm10.387-4.227c-.52.52-1.36.52-1.894 0l-.946-.947c-.52-.52-.52-1.36 0-1.88.52-.52 1.36-.52 1.88 0l.96.947c.25.25.39.587.39.94s-.14.69-.39.94zm-17.947-.947l-.947.947c-.52.52-1.36.52-1.88 0-.52-.52-.52-1.36 0-1.88l.947-.947c.52-.52 1.36-.52 1.88 0 .25.25.39.588.39.94 0 .353-.14.691-.39.94z"/>
        <text fill="#FFF" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing=".568">
          <tspan x="64.412" y="125">LUX</tspan>
        </text>
        ${(() => {
          const luxStr = Math.round(lux).toLocaleString();
          const size = fitFontSize(luxStr);
          // Letter-spacing scaled with font-size so very long values pack tighter.
          const tracking = (size / 44 * 2.271).toFixed(2);
          return `<text fill="#FFF" font-family="sans-serif" font-size="${size}" font-weight="bold" letter-spacing="${tracking}" style="text-anchor: middle">
            <tspan x="78.977" y="98">${escape(luxStr)}</tspan>
          </text>`;
        })()}
      </g>
    </g>
  `);
}

/* ------------------------------------------------------------
   Humidity — red temperature pebble + blue water-drop
   Vue: SensorValueHumidity.html (translate 200,30)
   ------------------------------------------------------------ */
function renderHumidityClassic(values) {
  const t = num(values.find((v) => v.label === 'Temp')?.value);
  const h = num(values.find((v) => v.label === 'Hum')?.value);
  return svg(`
    <g fill="none" fill-rule="evenodd" transform="translate(200,30)">
      <g>
        <path fill="#D90033"
          d="M6.307 48.683c-1.741 21.153-1.752 41.48.023 62.632.504 6.254 3.232 12.478 8.204 16.2 18.032 12.37 36.129 22.354 56.596 30.818 5.57 2.223 11.987 2.223 17.557 0 20.462-8.45 38.517-18.44 56.524-30.823 4.96-3.723 7.682-9.948 8.231-16.198 1.936-21.167 1.862-41.459.057-62.629-.49-6.255-3.221-12.48-8.196-16.2-18.042-12.362-36.139-22.36-56.616-30.816-5.57-2.223-11.988-2.223-17.557 0-20.473 8.467-38.588 18.454-56.634 30.815-4.98 3.72-7.71 9.946-8.189 16.201"
          transform="translate(91 100)"/>
        <path fill="#FFF"
          d="M83.837 32.595V20.312c-.004-1.275-1.074-2.308-2.396-2.312h-2.882c-1.322.004-2.392 1.037-2.396 2.312v12.283c-2.588 1.637-3.755 4.72-2.87 7.582C74.178 43.04 76.905 45 80 45c3.095 0 5.822-1.961 6.707-4.823.885-2.862-.282-5.945-2.87-7.582z"
          transform="translate(91 100)"/>
        <text fill="#FFF" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing=".568" transform="translate(91 100)">
          <tspan x="45.693" y="125">CELSIUS</tspan>
        </text>
        <text fill="#FFF" font-family="sans-serif" font-size="44" font-weight="bold" letter-spacing="1.5" text-anchor="middle" transform="translate(91 100)">
          <tspan x="80" y="100">${escape(t.toFixed(1))}<tspan font-size="26" dy="-10">°</tspan></tspan>
        </text>
      </g>
      <path fill="#3BA3FF" fill-rule="nonzero"
        d="M75.505 167C113.285 167 144 133.68 144 92.711c0-40.208-62.567-89.504-65.235-91.588h.01c-1.918-1.497-4.622-1.497-6.54 0C69.597 3.207 7 52.506 7 92.71 7.01 133.681 37.724 167 75.505 167z"/>
      <text fill="#FFF" font-family="sans-serif" font-size="44" font-weight="bold" letter-spacing="1.5" text-anchor="middle">
        <tspan x="76" y="118">${escape(h.toFixed(1))}<tspan font-size="22" dy="-12">%</tspan></tspan>
      </text>
      <text fill="#FFF" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing=".568">
        <tspan x="35.121" y="65">HUMIDITY</tspan>
      </text>
    </g>
  `);
}

/* ------------------------------------------------------------
   Temperature — large red infrared pebble + small pink ambient
   Vue: SensorValueTemperature.html (translate 200,120)
   ------------------------------------------------------------ */
function renderTemperatureClassic(values) {
  const ir = num(values.find((v) => v.label === 'InfraredTemp')?.value);
  const ambient = num(values.find((v) => v.label === 'AmbientTemp')?.value);
  return svg(`
    <g fill="none" fill-rule="evenodd" transform="translate(200,120)">
      <g>
        <g>
          <g>
            <g>
              <g fill="#D90033">
                <path d="M1.307 48.683c-1.741 21.153-1.752 41.48.023 62.632.504 6.254 3.232 12.478 8.204 16.2 18.032 12.37 36.129 22.354 56.596 30.818 5.57 2.223 11.987 2.223 17.557 0 20.462-8.45 38.517-18.44 56.524-30.823 4.96-3.723 7.682-9.948 8.231-16.198 1.936-21.167 1.862-41.459.057-62.629-.49-6.255-3.221-12.48-8.196-16.2-18.042-12.362-36.139-22.36-56.616-30.816-5.57-2.223-11.988-2.223-17.557 0C45.657 10.134 27.542 20.12 9.496 32.482c-4.98 3.72-7.71 9.946-8.189 16.201"
                  transform="translate(43 5)"/>
              </g>
              <g fill="#FFF">
                <path d="M19.837 16.595V4.312C19.833 3.037 18.763 2.004 17.441 2h-2.882c-1.322.004-2.392 1.037-2.396 2.312v12.283c-2.588 1.637-3.755 4.72-2.87 7.582C10.178 27.04 12.905 29 16 29c3.095 0 5.822-1.961 6.707-4.823.885-2.862-.282-5.945-2.87-7.582z"
                  transform="translate(107 21)"/>
              </g>
              <text fill="#FFF" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing=".568" transform="translate(43 5)">
                <tspan x="45.693" y="125">CELSIUS</tspan>
              </text>
              <text fill="#FFF" font-family="sans-serif" font-size="40" font-weight="bold" letter-spacing="1.2" text-anchor="middle" transform="translate(43 5)">
                <tspan x="80" y="92">${escape(ir.toFixed(1))}<tspan font-size="24" dy="-8">°</tspan></tspan>
              </text>
            </g>
          </g>
          <g>
            <g>
              <g fill="#F05479">
                <path d="M.654 24.342c-.871 10.576-.876 20.74.011 31.316.252 3.126 1.616 6.239 4.102 8.1 9.016 6.184 18.064 11.177 28.298 15.409 2.785 1.11 5.994 1.11 8.778 0 10.232-4.225 19.26-9.22 28.263-15.412 2.48-1.861 3.84-4.974 4.115-8.099.968-10.583.93-20.73.029-31.314-.246-3.128-1.611-6.24-4.098-8.1C61.13 10.06 52.082 5.062 41.843.833c-2.784-1.11-5.993-1.11-8.778 0-10.236 4.234-19.294 9.228-28.317 15.408-2.49 1.86-3.855 4.973-4.094 8.1"
                  transform="translate(.5)"/>
              </g>
              <text fill="#FFF" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing=".355">
                <tspan x="16.558" y="65">CELSIUS</tspan>
              </text>
              <text fill="#FFF" font-family="sans-serif" font-size="22" font-weight="bold" letter-spacing=".7" text-anchor="middle">
                <tspan x="38" y="51">${escape(ambient.toFixed(1))}<tspan font-size="14" dy="-6">°</tspan></tspan>
              </text>
              <text fill="#FFF" font-family="sans-serif" font-size="10" font-weight="bold" letter-spacing=".355">
                <tspan x="15.268" y="24">AMBIENT</tspan>
              </text>
            </g>
          </g>
        </g>
      </g>
    </g>
  `);
}

/* ------------------------------------------------------------
   Heart rate — pink heart pebble with bpm. Non-READY states
   reuse the existing GIFs (already shipped under assets/gif/).
   Vue: SensorValueHeartRate.html
   ------------------------------------------------------------ */
function renderHeartRateClassic(values) {
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

  return svg(`
    <g fill="none" fill-rule="evenodd" transform="translate(240,90)">
      <g fill="#FF006E">
        <path d="M114.12 0c-13.024-.037-25.448 5.54-34.168 15.338C67.212 1.095 47.132-3.744 29.424 3.16 11.714 10.065.023 27.29 0 46.51c0 35.38 48.395 74.61 69.893 90.197 6.036 4.39 14.164 4.39 20.2 0C111.605 121.12 160 81.892 160 46.51 160 20.84 139.465.023 114.12 0z"
          transform="translate(0 13)"/>
      </g>
      <text fill="#FFF" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing=".568">
        <tspan x="63.148" y="125">bpm</tspan>
      </text>
      <text fill="#FFF" font-size="64" font-weight="bold" letter-spacing="2.271" font-family="sans-serif">
        <tspan text-anchor="middle" x="80.977" y="102">${escape(Math.round(bpm))}</tspan>
      </text>
      <text fill="#FFF" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing=".568">
        <tspan x="30.141" y="45">HEART RATE</tspan>
      </text>
    </g>
  `);
}

/* Dispatcher — same signature as renderSensor (the modern one) */
export function renderSensorClassic(sensorType, decodedValues) {
  if (!decodedValues || decodedValues.length === 0) {
    return '<div class="hr-state"><p class="hr-state__title">Waiting for data…</p></div>';
  }
  switch (sensorType) {
    case SENSOR_TYPE.UV:           return renderUVClassic(decodedValues);
    case SENSOR_TYPE.HUMIDITY:     return renderHumidityClassic(decodedValues);
    case SENSOR_TYPE.TEMPERATURE:  return renderTemperatureClassic(decodedValues);
    case SENSOR_TYPE.CONDUCTIVITY: return renderConductivityClassic(decodedValues);
    case SENSOR_TYPE.VOC:          return renderVOCClassic(decodedValues);
    case SENSOR_TYPE.HEART_RATE:   return renderHeartRateClassic(decodedValues);
    default:
      return `<div class="hr-state"><p class="hr-state__title">Unknown sensor: ${escape(sensorType)}</p></div>`;
  }
}
