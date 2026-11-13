import React, { useRef } from 'react';
import { Droplets } from 'lucide-react';
import type { HourlyForecast, TempUnit } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';

interface HourlyForecastCardProps {
  hourly: HourlyForecast[];
  unit: TempUnit;
}

export const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({ hourly, unit }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Temperature range for relative warmth bar */
  const temps = hourly.map(h => (unit === 'C' ? h.tempC : h.tempF));
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = maxTemp - minTemp || 1;

  return (
    <div className="rounded-3xl border border-neutral-200/90 bg-white/70 backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-900/50">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15">
          <svg
            className="h-3.5 w-3.5 text-cyan-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
        <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Next 24 Hours
        </h2>
      </div>

      {/* ── Scroll shell with edge fades ── */}
      <div className="relative">
        {/* Left fade — mobile only (on sm+ the grid fills the full width) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white/80 to-transparent dark:from-neutral-900/70 sm:hidden" />
        {/* Right fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white/90 to-transparent dark:from-neutral-900/80 sm:hidden" />

        {/*
          ── Layout strategy ──────────────────────────────────────────────
          Mobile  (< sm):  flex row  → 1 row, horizontal scroll, snap
          Tablet+ (≥ sm):  CSS grid  → 2 rows, grid-auto-flow: column,
                           items fill columns left-to-right, row 1 then row 2
          ────────────────────────────────────────────────────────────────
        */}
        <div
          ref={scrollRef}
          className={[
            /* shared */
            'overflow-x-auto px-5 pb-5 pt-5 ml-2 scrollbar-none',
            /* mobile: single flex row + snap */
            'flex gap-2.5 scroll-smooth snap-x snap-mandatory',
            /* tablet+: 2-row CSS grid, column flow */
            'sm:grid sm:grid-rows-2 sm:grid-flow-col sm:gap-2 sm:snap-none',
          ].join(' ')}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {hourly.map((h, i) => {
            const temp = unit === 'C' ? h.tempC : h.tempF;
            const isNow = i === 0;
            const warmth = (temp - minTemp) / range; // 0–1

            return (
              <div
                key={`${h.time}-${i}`}
                className={[
                  /* Base — mobile: snap item, fixed width */
                  'relative flex shrink-0 snap-start flex-col items-center',
                  /* Width: wider on larger screens; on tablet+ auto-cols fills space */
                  'w-18 sm:w-auto sm:min-w-18',
                  'rounded-2xl px-2 py-3 sm:py-3.5',
                  'transition-all duration-200',
                  /* "Now" card accent */
                  isNow
                    ? 'border border-cyan-400/50 bg-linear-to-b from-cyan-500/15 to-cyan-500/5 shadow-sm shadow-cyan-500/10 dark:border-cyan-500/40 dark:from-cyan-500/20 dark:to-cyan-500/8'
                    : 'border border-neutral-200/60 bg-neutral-50/60 dark:border-neutral-800/50 dark:bg-neutral-800/25',
                ].join(' ')}
              >
                {/* "Now" badge */}
                {isNow && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cyan-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
                    Now
                  </span>
                )}

                {/* Time */}
                <span
                  className={[
                    'mb-2 mt-1 font-mono text-[11px] leading-none',
                    isNow
                      ? 'font-semibold text-cyan-600 dark:text-cyan-400'
                      : 'text-neutral-400 dark:text-neutral-500',
                  ].join(' ')}
                >
                  {isNow ? '—' : h.displayTime}
                </span>

                {/* Weather icon */}
                <div className="mb-2.5 flex items-center justify-center">
                  {getWeatherIcon(h.icon, h.condition, 'h-6 w-6 sm:h-7 sm:w-7')}
                </div>

                {/* Temperature */}
                <span
                  className={[
                    'mb-2.5 font-mono text-[15px] font-bold leading-none tracking-tight sm:text-base',
                    isNow
                      ? 'text-cyan-700 dark:text-cyan-300'
                      : 'text-neutral-900 dark:text-neutral-100',
                  ].join(' ')}
                >
                  {Math.round(temp)}°
                </span>

                {/* Relative warmth bar */}
                <div className="mb-2 h-1 w-9 overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-700/60">
                  <div
                    className={[
                      'h-full rounded-full',
                      warmth > 0.6
                        ? 'bg-amber-400'
                        : warmth > 0.3
                          ? 'bg-cyan-400'
                          : 'bg-sky-300',
                    ].join(' ')}
                    style={{ width: `${Math.max(15, warmth * 100)}%` }}
                  />
                </div>

                {/* Precipitation */}
                {h.pop > 0 ? (
                  <div
                    className={[
                      'flex items-center gap-0.5 text-[10px] font-semibold leading-none',
                      h.pop >= 50
                        ? 'text-blue-500 dark:text-blue-400'
                        : 'text-cyan-500 dark:text-cyan-400',
                    ].join(' ')}
                  >
                    <Droplets className="h-2.5 w-2.5 shrink-0" />
                    <span className="font-mono">{h.pop}%</span>
                  </div>
                ) : (
                  <div className="h-3.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
