/* ============================================================
   Line mode — Apex line chart, time-series rolling window.
   ============================================================ */

import { AXIS_CONFIG } from './ctx.js';

const X_AXIS_RANGE_S = 60;

let chart = null;
let lastRangesSig = '';
let lastSampleRate = null;

export default {
  id: 'line',
  label: 'Line',
  iconSvg:
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<polyline points="1,12 5,7 9,10 15,3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>',
  appliesTo: () => true,

  mount(host, ctx) {
    host.innerHTML = '';
    lastRangesSig = JSON.stringify(ctx.currentRanges ?? {});
    lastSampleRate = ctx.sampleRate;
    const opts = baseOptions(ctx);
    if (ctx.series.some((s) => s.data.length)) opts.series = ctx.series;
    chart = new ApexCharts(host, opts);
    chart.render();
  },

  update(ctx) {
    if (!chart) return;
    chart.updateSeries(ctx.series, false);

    const sig = JSON.stringify(ctx.currentRanges);
    if (sig !== lastRangesSig) {
      chart.updateOptions({ yaxis: buildYaxis(ctx) }, false, true);
      lastRangesSig = sig;
    }
    if (ctx.sampleRate !== lastSampleRate) {
      lastSampleRate = ctx.sampleRate;
      chart.updateOptions({
        chart: { animations: { dynamicAnimation: { speed: Math.max(250, 1000 / ctx.sampleRate) } } },
        stroke: { width: ctx.sampleRate >= 5 ? 2 : 3 },
        xaxis: { labels: { formatter: timeAxisFormatter(ctx.sampleRate) } },
      }, false, false);
    }
  },

  destroy() {
    if (chart) {
      try { chart.destroy(); } catch (_) {}
      chart = null;
    }
  },
};

function timeAxisFormatter(sampleRate) {
  return (v) => {
    if (sampleRate < 1) return '';
    const total = Math.max(0, Math.floor(v));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
}

function buildYaxis(ctx) {
  return ctx.seriesLabels.map((label, i) => {
    const cfg = AXIS_CONFIG[label] ?? {};
    const isOpposite = i === 1;
    const item = {
      seriesName: label,
      opposite: isOpposite,
      logarithmic: !!cfg.log,
      forceNiceScale: true,
      decimalsInFloat: cfg.decimals ?? 1,
      title: {
        text: cfg.title ?? label,
        offsetX: isOpposite ? 8 : -8,
        style: { color: cfg.color ?? '#D3D3D3', fontSize: '13px', fontWeight: 500 },
      },
      labels: {
        style: { colors: cfg.color ?? '#D3D3D3', fontSize: '12px' },
        formatter: (v) => {
          if (v == null || !Number.isFinite(v)) return '';
          if (cfg.log) return Number(v).toFixed(0);
          return Number(v).toFixed(cfg.decimals ?? 1);
        },
      },
      axisBorder: { show: false, color: 'transparent', width: 0 },
      axisTicks: { show: false, color: 'transparent' },
      crosshairs: { show: false },
    };
    const range = ctx.currentRanges[label];
    if (range) {
      item.min = range.min;
      item.max = range.max;
    }
    return item;
  });
}

function baseOptions(ctx) {
  const labels = ctx.seriesLabels;
  const colors = labels.map((l) => (AXIS_CONFIG[l]?.color) ?? '#FFFFFF');
  const sampleRate = ctx.sampleRate;
  return {
    chart: {
      type: 'line',
      height: '100%',
      foreColor: '#D3D3D3',
      fontFamily: 'Roboto, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: { enabled: true, speed: Math.max(250, 1000 / sampleRate) },
      },
    },
    stroke: { curve: 'smooth', width: sampleRate >= 5 ? 2 : 3 },
    fill: { type: 'solid', opacity: 1 },
    markers: { size: 0, strokeWidth: 0 },
    dataLabels: { enabled: false },
    colors,
    series: labels.map((l) => ({ name: l, data: [] })),
    legend: { show: false },
    tooltip: { enabled: false },
    grid: {
      borderColor: 'rgba(255,255,255,0.06)',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      type: 'numeric',
      range: X_AXIS_RANGE_S,
      tickAmount: 6,
      labels: {
        style: { colors: '#D3D3D3', fontSize: '12px' },
        formatter: timeAxisFormatter(sampleRate),
      },
      axisBorder: { color: '#D3D3D3' },
      axisTicks: { color: '#D3D3D3' },
    },
    yaxis: buildYaxis(ctx),
    noData: { text: '', style: { color: '#D3D3D3', fontSize: '14px' } },
  };
}
