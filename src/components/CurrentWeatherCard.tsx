import React from 'react';
import { Star, RefreshCw, Layers } from 'lucide-react';
import type { WeatherData, TempUnit } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  unit: TempUnit;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  unit,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  isRefreshing,
}) => {
  const current = weather.current;
  const temp = unit === 'C' ? current.tempC : current.tempF;
  const feelsLike = unit === 'C' ? current.feelsLikeC : current.feelsLikeF;
  const tempMax = unit === 'C' ? current.tempMaxC : current.tempMaxF;
  const tempMin = unit === 'C' ? current.tempMinC : current.tempMinF;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-white/70 p-6 sm:p-8 backdrop-blur-xl shadow-xs transition-all dark:border-neutral-800/80 dark:bg-neutral-900/50">

      {/* Background subtle atmospheric gradient glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/15" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />

      {/* Top Header: Location, Badges, and Action Tools */}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              {weather.city}
            </h1>
            <span className="rounded-md border border-neutral-200 bg-neutral-100/80 px-2 py-0.5 text-xs font-mono font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300">
              {weather.country}
            </span>
          </div>
          {weather.region && (
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {weather.region}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Favorite Pin Button */}
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`touch-target rounded-xl border p-2.5 transition active:scale-95 justify-center inline-flex ${isFavorite
              ? 'border-amber-400/50 bg-amber-500/10 text-amber-500 dark:border-amber-400/30'
              : 'border-neutral-200 bg-white text-neutral-400 hover:text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            title={isFavorite ? 'Remove from pinned locations' : 'Pin to favorites (max 5)'}
            aria-label={isFavorite ? 'Remove from pinned locations' : 'Pin to favorites'}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Refresh Data Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="touch-target justify-center inline-flex rounded-xl border border-neutral-200 bg-white p-2.5 text-neutral-600 transition hover:bg-neutral-50 active:scale-95 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50"
            title="Refresh current meteorological reading"
            aria-label="Refresh current weather data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-cyan-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Temp & Atmospheric Display */}
      <div className="relative mt-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
        <div>
          <div className="flex items-baseline">
            <span className="font-mono text-6xl sm:text-8xl font-light tracking-tighter text-neutral-900 dark:text-white tabular-nums">
              {Math.round(temp)}
            </span>
            <span className="ml-1 text-3xl sm:text-5xl font-light text-neutral-400 dark:text-neutral-500">
              °{unit}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            <span>Feels like <strong className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">{Math.round(feelsLike)}°{unit}</strong></span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span>H: <strong className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">{Math.round(tempMax)}°</strong></span>
            <span>L: <strong className="font-semibold text-neutral-800 dark:text-neutral-200 font-mono">{Math.round(tempMin)}°</strong></span>
          </div>
        </div>

        {/* Condition Symbol & Description */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            {getWeatherIcon(current.icon, current.condition, 'h-10 w-10 sm:h-12 sm:w-12')}
            <div className="sm:text-right">
              <span className="block text-lg font-medium text-neutral-900 dark:text-white">
                {current.condition}
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                {current.conditionDescription}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info: Engine Tag & Timestamp */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 text-[11px] text-neutral-400 dark:border-neutral-800/80 dark:text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono">
            <Layers className="h-3 w-3 text-cyan-500" />
            <span className="text-neutral-700 dark:text-neutral-300 font-medium">Source:</span> {weather.source}
          </span>
          {weather.isFallback && (
            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700 dark:text-cyan-300">
              Active Fallback
            </span>
          )}
        </div>

        <div className="font-mono text-[10px]">
          Synced {new Date(weather.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

    </div>
  );
};
