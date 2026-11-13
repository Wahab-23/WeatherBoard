import React from 'react';
import { Calendar, Droplets } from 'lucide-react';
import type { DailyForecast, TempUnit } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';

interface DailyForecastCardProps {
  daily: DailyForecast[];
  unit: TempUnit;
}

export const DailyForecastCard: React.FC<DailyForecastCardProps> = ({ daily, unit }) => {
  // Find global min and max across all 5 days to scale visual temperature bars
  const allMins = daily.map((d) => (unit === 'C' ? d.tempMinC : d.tempMinF));
  const allMaxs = daily.map((d) => (unit === 'C' ? d.tempMaxC : d.tempMaxF));
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const globalRange = Math.max(1, globalMax - globalMin);

  return (
    <div className="rounded-3xl border border-neutral-200/90 bg-white/70 p-6 backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-900/50">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-cyan-500" />
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            5-Day Meteorological Outlook
          </h2>
        </div>
        <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
          Synoptic Model
        </span>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
        {daily.map((d, index) => {
          const max = unit === 'C' ? d.tempMaxC : d.tempMaxF;
          const min = unit === 'C' ? d.tempMinC : d.tempMinF;

          // Calculate bar position percentages
          const leftPercent = Math.max(0, Math.min(100, ((min - globalMin) / globalRange) * 100));
          const widthPercent = Math.max(12, Math.min(100 - leftPercent, ((max - min) / globalRange) * 100));

          return (
            <div
              key={d.date}
              className="flex items-center justify-between py-3.5 text-xs sm:text-sm"
            >
              {/* Day Label */}
              <div className="w-16 sm:w-24">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {index === 0 ? 'Today' : d.dayName}
                </span>
                <span className="block text-[10px] text-neutral-400 font-mono">
                  {d.date.split('-').slice(1).join('/')}
                </span>
              </div>

              {/* Condition Icon + Pop */}
              <div className="flex items-center gap-2 sm:gap-3 w-28 sm:w-36">
                {getWeatherIcon(d.icon, d.condition, 'h-5 w-5')}
                <div className="truncate">
                  <span className="block font-medium text-neutral-700 dark:text-neutral-300 truncate">
                    {d.condition}
                  </span>
                  {d.pop > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-cyan-600 dark:text-cyan-400">
                      <Droplets className="h-2.5 w-2.5" />
                      <span>{d.pop}%</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Min Temp */}
              <span className="w-8 text-right font-mono text-neutral-400 dark:text-neutral-500">
                {Math.round(min)}°
              </span>

              {/* Visual Temperature Range Bar */}
              <div className="relative mx-3 hidden h-1.5 flex-1 rounded-full bg-neutral-100 sm:block dark:bg-neutral-800">
                <div
                  className="absolute top-0 h-1.5 rounded-full bg-linear-to-r from-cyan-500 via-sky-400 to-amber-400"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                />
              </div>

              {/* Max Temp */}
              <span className="w-8 text-right font-mono font-medium text-neutral-900 dark:text-neutral-100">
                {Math.round(max)}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
