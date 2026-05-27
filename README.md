# Kiwrious Measure — HTML5 edition

A vanilla HTML5 + ES modules port of [`measure-kiwrious-com`](../measure-kiwrious-com). Connects to Kiwrious USB sensors over the Web Serial API, charts live readings, and exports recordings as CSV.

**Zero build step.** Open `index.html` from any static server and it runs.

## Features

- **6 sensor types** — UV / Light, Climate (Humidity), Temperature (IR v1/v2), Conductivity, Air Quality (VOC), Heart Rate
- **Live SVG sensor display** with sensor-specific colour theming and dynamic UV-index bands
- **ApexCharts line chart** with dual y-axis, log scale where appropriate (Lux, Conductivity), 60-second rolling window
- **Sample-rate dropdown** — per-sensor menu (1 / minute → 5 / second)
- **Recording** — start/stop, automatic min/max/avg stats, rename, delete, CSV export, "Export all"
- **Heart rate state UX** — PROCESSING / TOO_LOW / TOO_HIGH / READY each render their own affordance with the original GIF animations
- **VOC warm-up** progress bar
- **Humidity background animation** (intensity-driven, 0–3 layers like the Vue app)
- **Auto-save** in-progress recording on disconnect
- **Firmware-update banner** when SDK reports outdated firmware

## Run locally

```bash
npm run serve              # http-server on :5173
# or
npm run serve:py           # Python's http.server
# or in VSCode:
#   Run → "Run Kiwrious Measure (Chrome)"  (F5)
```

Open `http://localhost:5173`.

> **Web Serial requires a secure context** — `http://localhost` qualifies; HTTPS otherwise. Chrome / Edge / Opera only.

## Project layout

```
measure2-kiwrious-com/
├── index.html              ← Page shell, app bar, two-column layout
├── styles/
│   ├── main.css            ← Layout, brand colours, animations
│   ├── sensor-value.css    ← SVG-based sensor display + heart-rate states
│   └── card.css            ← Recording cards
├── js/
│   ├── app.js              ← Main app entry — wires SDK, UI, state
│   ├── constants.js        ← Sensor enums, axis configs, colours, sample rates
│   ├── sensor-views.js     ← Per-sensor SVG renderers (UV, humidity, temp, …)
│   ├── chart.js            ← ApexCharts wrapper, rolling buffer
│   ├── recordings.js       ← Recording lifecycle + CSV export + card rendering
│   ├── kiwrious-webserial.esm.js   ← Bundled SDK (copied from kiwrious-web-serial-sdk/dist/)
│   └── kiwrious-webserial.esm.js.map
├── lib/                    ← Heart-rate v2 runtime (only loaded when needed)
│   ├── prog.bin            ← ARM Thumb firmware blob
│   ├── libunicorn_out.{js,wasm}
│   ├── unicorn-{wrapper,constants}.js
│   ├── libelf-integers.js
│   └── heartrate.js
├── assets/
│   ├── all-sensors@2x.png  ← Pre-connection welcome image
│   └── gif/
│       ├── humidity.gif
│       ├── HR_processing.gif
│       ├── HR_TooHigh.gif
│       └── HR_TooLow.gif
├── .vscode/
│   ├── launch.json         ← F5 → Chrome/Edge with auto-served port 5173
│   └── tasks.json
└── package.json
```

## Differences from measure-kiwrious-com

This is a port, not a 1:1 reskin. Behavioural goals: feature parity for everyday use, modernised UX where the original was awkward.

| | Vue version | HTML5 version |
|---|---|---|
| **Build** | Vue CLI, ~5 MB output | Zero build, ~50 KB JS + 20 KB CSS (excluding ApexCharts CDN and SDK) |
| **SDK** | `kiwrious-webserial@1.0.20` (CommonJS) | Bundled ESM build of `kiwrious-web-serial-sdk` (v2.0) |
| **Chart** | ApexCharts 3.28 via vue-apexcharts | ApexCharts 3.45 via CDN |
| **Recording rename** | Inline title click → input | Same |
| **Auto-save** | On disconnect mid-recording | Same |
| **Sample-rate menus** | From `SAMPLE_RATE_BY_SENSOR` constants | Identical mappings, copied verbatim |
| **Sensor visuals** | Hand-built SVG per sensor | Reimplemented hand-built SVGs (visually similar, not pixel-identical) |
| **Heart-rate animations** | Original GIFs | Same GIFs, copied from Vue assets |
| **Humidity background** | 0–3 GIF layers based on humidity | Same |

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  app.js (main entry)                     │
│                                                          │
│  serialService ── onSerialData ──► state.latestValues    │
│       │           onSerialConnection ──► toggle UI       │
│       │           onFirmwareUpdateAvailable ──► banner   │
│       │                                                  │
│       ▼                                                  │
│  setInterval(1/sampleRate) ──► chart.pushValues(values)  │
│                                                          │
│  Record click ──► recordings.saveRecording(snapshot)     │
│                                                          │
│  rate dropdown ──► chart.setSampleRate / state.sampleRate│
└──────────────────────────────────────────────────────────┘
```

- `app.js` owns the central state object and wires SDK callbacks to UI updates.
- `chart.js` is stateful (one ApexCharts instance) and exposes `initChart`, `pushValues`, `setSampleRate`, `snapshotSeries`, `resetBuffer`.
- `sensor-views.js` is pure — render `(sensorType, decodedValues) → HTML`.
- `recordings.js` keeps the recordings array and exports CSV.

## SDK source

`js/kiwrious-webserial.esm.js` is built from [`../kiwrious-web-serial-sdk`](../kiwrious-web-serial-sdk). To refresh it:

```bash
cd ../kiwrious-web-serial-sdk
npm install
npm run build
cp dist/kiwrious-webserial.esm.js ../measure2-kiwrious-com/js/
cp -r dist/js/* ../measure2-kiwrious-com/lib/   # heart-rate runtime, optional
```

## Browser support

| | Web Serial | Status |
|---|---|---|
| Chrome 89+ | ✅ | Tested |
| Edge 89+ | ✅ | Tested |
| Opera 75+ | ✅ | Should work |
| Firefox / Safari | ❌ | Page renders a "not supported" message |

## License

MIT
