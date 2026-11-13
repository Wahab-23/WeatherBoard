import React from 'react';
import { Clock, Droplets } from 'lucide-react';
import type { HourlyForecast, TempUnit } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';

interface HourlyForecastCardProps {
  hourly: HourlyForecast[];
  unit: TempUnit;
}

export const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({ hourly, unit }) => {
  return (
    <div className="rounded-3xl border border-neutral-200/90 bg-white/70 p-6 backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-900/50">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-500" />
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Hourly Trajectory (Next 24h)
          </h2>
        </div>
        <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
          Scrollable Timeline
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
        {hourly.map((h, i) => {
          const temp = unit === 'C' ? h.tempC : h.tempF;
          return (
            <div
              key={`${h.time}-${i}`}
              className="flex min-w-[80px] flex-col items-center justify-between rounded-2xl border border-neutral-200/60 bg-neutral-50/70 p-3 text-center transition-all hover:border-neutral-300 dark:border-neutral-800/60 dark:bg-neutral-800/30 dark:hover:border-neutral-700"
            >
              <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                {i === 0 ? 'Now' : h.displayTime}
              </span>

              <div className="my-2.5">
                {getWeatherIcon(h.icon, h.condition, 'h-6 w-6')}
              </div>

              <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {Math.round(temp)}°
              </span>

              {h.pop > 0 ? (
                <div className="mt-1 flex items-center gap-0.5 text-[10px] font-medium text-cyan-600 dark:text-cyan-400">
                  <Droplets className="h-2.5 w-2.5" />
                  <span>{h.pop}%</span>
                </div>
              ) : (
                <div className="mt-1 h-3 text-[10px] text-neutral-400 opacity-0">-</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
