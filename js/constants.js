/* ============================================================
   Constants — colours, axis configs, sample-rate menus per sensor
   Mirrors src/constants.ts in kiwrious-measure-vue (refreshed for HTML5)
   ============================================================ */

export const SENSOR_TYPE = {
  UNKNOWN: 'UNKNOWN',
  UV: 'UV',
  HUMIDITY: 'HUMIDITY',
  VOC: 'VOC',
  CONDUCTIVITY: 'CONDUCTIVITY',
  HEART_RATE: 'HEART_RATE',
  TEMPERATURE: 'TEMPERATURE',
};

// Per-observable label keys (match SDK's SENSOR_VALUE)
export const LABEL = {
  UV_INDEX: 'Uv',
  LUX: 'Lux',
  HUMIDITY: 'Hum',
  TEMPERATURE: 'Temp',
  VOC: 'Voc',
  CONDUCTIVITY: 'Con',
  HEART_RATE: 'HeartRate',
  INFRARED_TEMPERATURE: 'InfraredTemp',
  AMBIENT_TEMPERATURE: 'AmbientTemp',
};

export const SENSOR_COLORS = {
  Uv:  '#FFFFFF',
  Lux: '#BEAAFF',
  Hum: '#80C3FF',
  Temp: '#FDDCCD',
  Con: '#FCD666',
  Voc: '#72E4AB',
  HeartRate: '#FFCBE1',
  AmbientTemp: '#FFFFFF',
  InfraredTemp: '#FABBCC',
};

// Series order per sensor type — defines chart legend order & y-axis assignment
export const SERIES_ORDER = {
  UV: ['Lux', 'Uv'],
  HUMIDITY: ['Temp', 'Hum'],
  TEMPERATURE: ['AmbientTemp', 'InfraredTemp'],
  CONDUCTIVITY: ['Con'],
  VOC: ['Voc'],
  HEART_RATE: ['HeartRate'],
};

/* Cluster bands snap each y-axis range to a multiple of `step`, so the axis
   doesn't jitter on every sample. `axisGroup` pools series that measure the
   same physical quantity (e.g. AmbientTemp + InfraredTemp) so they share one
   scale — the band is computed from the combined min/max. `hardFloor` /
   `hardCeiling` pin the sensor's documented operating range (sourced from
   kiwrious-sdk-docs). Log-scale axes (Lux, Con) opt out of clustering but
   still display their documented range in the Ranges tab. */
export const AXIS_CONFIG = {
  Uv:  { title: 'UV Radiation (UV Index)',         color: '#FFFFFF', log: false, decimals: 1, step: 1,   hardFloor: 0,   hardCeiling: 12 },
  Lux: { title: 'Illuminance (lux)',               color: '#BEAAFF', log: true,  decimals: 0,             hardFloor: 0,   hardCeiling: 100000 },
  Hum: { title: 'Humidity (%)',                    color: '#80C3FF', log: false, decimals: 1, step: 10,  hardFloor: 0,   hardCeiling: 100, axisGroup: 'humidity' },
  Temp: { title: 'Temperature (°C)',               color: '#FDDCCD', log: false, decimals: 1, step: 10,  hardFloor: -40, hardCeiling: 85, axisGroup: 'temperature' },
  Con: { title: 'Conductivity (µS/cm)',            color: '#FCD666', log: true,  decimals: 1,             hardFloor: 0,   hardCeiling: 200000 },
  Voc: { title: 'VOC (ppb)',                       color: '#72E4AB', log: false, decimals: 0, step: 100, hardFloor: 0 },
  HeartRate: { title: 'Heart Rate (bpm)',          color: '#FFCBE1', log: false, decimals: 0, step: 20,  hardFloor: 30,  hardCeiling: 220 },
  AmbientTemp:  { title: 'Ambient Temperature (°C)',  color: '#FFFFFF', log: false, decimals: 1, step: 10, hardFloor: -40, hardCeiling: 85, axisGroup: 'temperature' },
  InfraredTemp: { title: 'Infrared Temperature (°C)', color: '#FABBCC', log: false, decimals: 1, step: 10, hardFloor: -40, hardCeiling: 85, axisGroup: 'temperature' },
};

export const UNIT_SYMBOL = {
  Uv: 'UVI',
  Lux: 'lux',
  Hum: '%',
  Temp: '°C',
  Con: 'µS/cm',
  Voc: 'ppb',
  HeartRate: 'bpm',
  AmbientTemp: '°C',
  InfraredTemp: '°C',
};

// Sample-rate menus (label -> Hz). 1/60 Hz = "1 sample / minute" etc.
const HIGH_RATES = {
  '1 sample / minute':  1/60,
  '1 sample / 30 s':    1/30,
  '1 sample / 5 s':     1/5,
  '1 sample / second':  1,
  '5 samples / second': 5,
};
const LOW_RATES = {
  '1 sample / minute':  1/60,
  '1 sample / 30 s':    1/30,
  '1 sample / 5 s':     1/5,
  '1 sample / second':  1,
};
const MIX_RATES = {
  '1 sample / minute':  1/60,
  '1 sample / 30 s':    1/30,
  '1 sample / 5 s':     1/5,
  '1 sample / second':  1,
  '5 samples / second': 5,
};

export const SAMPLE_RATE_BY_SENSOR = {
  UV:           MIX_RATES,
  HUMIDITY:     LOW_RATES,
  VOC:          LOW_RATES,
  CONDUCTIVITY: HIGH_RATES,
  TEMPERATURE:  LOW_RATES,
  HEART_RATE:   HIGH_RATES,
};

export const DEFAULT_SAMPLE_RATE = {
  UV: 1, HUMIDITY: 1, VOC: 1, CONDUCTIVITY: 1, TEMPERATURE: 1, HEART_RATE: 1,
};

export const APP_VERSION = '1.0.0';

// UV index colour bands (from Vue SensorValueUV)
export const UV_BANDS = [
  { max: 3,  color: '#00D472', label: 'LOW' },
  { max: 5,  color: '#FEBF3A', label: 'MEDIUM' },
  { max: 7,  color: '#FF6B2F', label: 'HIGH' },
  { max: 10, color: '#E30E37', label: 'VERY HIGH' },
  { max: Infinity, color: '#8B25E4', label: 'EXTREME' },
];

export function uvBand(uvIndex) {
  return UV_BANDS.find((b) => uvIndex < b.max) ?? UV_BANDS[UV_BANDS.length - 1];
}

/* Insight bands — per measurement, ordered low→high. Each band's range is
   `[from, to)` (inclusive of `from`, exclusive of `to`). The `desc` lines
   are short, real-world reference points so a value reads as something
   meaningful (e.g. "office task lighting", "drinking water") rather than
   just a number. Used by the Insights tab. */
export const INSIGHT_BANDS = {
  Uv: [
    { from: 0,  to: 3,        label: 'Low',        desc: 'Minimal risk. No protection needed.' },
    { from: 3,  to: 6,        label: 'Moderate',   desc: 'SPF 15+, sunglasses, hat midday.' },
    { from: 6,  to: 8,        label: 'High',       desc: 'SPF 30+, seek shade 11–4 pm.' },
    { from: 8,  to: 11,       label: 'Very High',  desc: 'Cover up. Avoid sun midday.' },
    { from: 11, to: Infinity, label: 'Extreme',    desc: 'Stay indoors. Burn within minutes.' },
  ],
  Lux: [
    { from: 0,      to: 10,      label: 'Pitch dark',         desc: 'Single candle is about 10 lux at 1 m.' },
    { from: 10,     to: 50,      label: 'Twilight / dim',     desc: 'Sunset, mood lighting, stairwell.' },
    { from: 50,     to: 200,     label: 'Living room',        desc: 'Soft ambient, ~40 W bulb at 1 m.' },
    { from: 200,    to: 500,     label: 'Reading / hallway',  desc: 'Comfortable indoor reading.' },
    { from: 500,    to: 1000,    label: 'Office task',        desc: 'Recommended for desk work.' },
    { from: 1000,   to: 5000,    label: 'Overcast outdoor',   desc: 'Cloudy daylight or bright store.' },
    { from: 5000,   to: 25000,   label: 'Daylight',           desc: 'Indirect sunlight, full shade.' },
    { from: 25000,  to: Infinity,label: 'Direct sunlight',    desc: 'Noon sun reaches ~100,000 lux.' },
  ],
  Hum: [
    { from: 0,  to: 30,        label: 'Very dry',     desc: 'Static, dry skin, sinus discomfort.' },
    { from: 30, to: 50,        label: 'Comfortable',  desc: 'Ideal indoor range (30–50%).' },
    { from: 50, to: 60,        label: 'Slightly humid', desc: 'Still comfortable for most.' },
    { from: 60, to: 70,        label: 'Humid',        desc: 'Feels muggy; ventilate.' },
    { from: 70, to: 101,       label: 'Very humid',   desc: 'Mould risk. Run a dehumidifier.' },
  ],
  Temp: [
    { from: -Infinity, to: 0,  label: 'Freezing',     desc: 'Water freezes. Bundle up.' },
    { from: 0,  to: 15,        label: 'Cold',         desc: 'Winter clothing.' },
    { from: 15, to: 20,        label: 'Cool',         desc: 'Light jacket comfortable.' },
    { from: 20, to: 25,        label: 'Comfortable',  desc: 'Ideal indoor range.' },
    { from: 25, to: 30,        label: 'Warm',         desc: 'Light clothing.' },
    { from: 30, to: 35,        label: 'Hot',          desc: 'Hydrate, slow down.' },
    { from: 35, to: Infinity,  label: 'Very hot',     desc: 'Heat-stress risk.' },
  ],
  AmbientTemp: [
    { from: -Infinity, to: 0,  label: 'Freezing',    desc: 'Water freezes.' },
    { from: 0,  to: 15,        label: 'Cold',        desc: 'Winter clothing.' },
    { from: 15, to: 20,        label: 'Cool',        desc: 'Light jacket comfortable.' },
    { from: 20, to: 25,        label: 'Comfortable', desc: 'Ideal indoor range.' },
    { from: 25, to: 30,        label: 'Warm',        desc: 'Light clothing.' },
    { from: 30, to: 35,        label: 'Hot',         desc: 'Hydrate, slow down.' },
    { from: 35, to: Infinity,  label: 'Very hot',    desc: 'Heat-stress risk.' },
  ],
  InfraredTemp: [
    { from: -Infinity, to: 20, label: 'Cool surface',    desc: 'Below room temperature.' },
    { from: 20, to: 30,        label: 'Room surface',    desc: 'Typical wall, table top.' },
    { from: 30, to: 35,        label: 'Skin / warm',     desc: 'Skin surface ~32–34 °C.' },
    { from: 35, to: 37.5,      label: 'Body normal',     desc: 'Healthy core temperature.' },
    { from: 37.5, to: 38.5,    label: 'Mild fever',      desc: 'Low-grade fever.' },
    { from: 38.5, to: 40,      label: 'Fever',           desc: 'Elevated body temperature.' },
    { from: 40, to: 60,        label: 'Hot to touch',    desc: 'Hot drink, warm pan.' },
    { from: 60, to: Infinity,  label: 'Very hot surface',desc: 'Hot food, stove top.' },
  ],
  Con: [
    { from: 0,    to: 50,        label: 'Pure water',     desc: 'Distilled / deionised.' },
    { from: 50,   to: 500,       label: 'Drinking water', desc: 'Typical tap water.' },
    { from: 500,  to: 1500,      label: 'Mineral water',  desc: 'High mineral content.' },
    { from: 1500, to: 5000,      label: 'Brackish',       desc: 'Slightly salty, estuary.' },
    { from: 5000, to: 50000,     label: 'Saline',         desc: 'Approaching seawater.' },
    { from: 50000,to: Infinity,  label: 'Sea water',      desc: 'Ocean water (~50,000 µS/cm).' },
  ],
  Voc: [
    { from: 0,    to: 50,        label: 'Excellent', desc: 'Clean indoor air.' },
    { from: 50,   to: 150,       label: 'Good',      desc: 'Acceptable indoor air.' },
    { from: 150,  to: 500,       label: 'Moderate',  desc: 'Some pollution. Ventilate.' },
    { from: 500,  to: 1500,      label: 'Poor',      desc: 'Open windows, find source.' },
    { from: 1500, to: Infinity,  label: 'Unhealthy', desc: 'Strong odour, leave room.' },
  ],
  HeartRate: [
    { from: 0,   to: 60,         label: 'Below resting', desc: 'Athletic / asleep.' },
    { from: 60,  to: 100,        label: 'Resting',       desc: 'Normal adult resting rate.' },
    { from: 100, to: 140,        label: 'Light activity',desc: 'Walking, light effort.' },
    { from: 140, to: 170,        label: 'Aerobic',       desc: 'Cardio zone, can speak short.' },
    { from: 170, to: Infinity,   label: 'High intensity',desc: 'Near maximum effort.' },
  ],
};
