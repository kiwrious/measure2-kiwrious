/* ============================================================
   Chart-mode registry. Add a mode = import + push it into the array.
   `modesFor(sensorType)` returns the modes valid for that sensor.
   ============================================================ */

import line from './line.js';
import bar from './bar.js';
import gauge from './gauge.js';
import bigNumber from './big-number.js';
import uvDial from './uv-dial.js';
import vocLight from './voc-light.js';
import pulse from './pulse.js';
import comfortZone from './comfort-zone.js';

export const ALL_MODES = [
  line,
  bar,
  gauge,
  bigNumber,
  uvDial,
  vocLight,
  pulse,
  comfortZone,
];

export function modesFor(sensorType) {
  return ALL_MODES.filter((m) => m.appliesTo(sensorType));
}

export function findMode(id) {
  return ALL_MODES.find((m) => m.id === id);
}
