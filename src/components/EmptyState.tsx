import React from 'react';
import { Search, CloudSun, MapPin } from 'lucide-react';
import type { GeoCity } from '../types';

interface EmptyStateProps {
  onOpenSearch: () => void;
  onSelectCity: (city: GeoCity) => void;
  suggestedCities: GeoCity[];
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenSearch,
  onSelectCity,
  suggestedCities,
}) => {
  return (
    <div className="flex min-h-125 flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300/80 bg-white/40 p-8 text-center backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-cyan-600 shadow-inner dark:bg-neutral-800 dark:text-cyan-400">
        <CloudSun className="h-8 w-8" />
      </div>

      <h2 className="mt-5 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        No Station Selected
      </h2>
      <p className="mt-1.5 max-w-md text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
        Connect to a global meteorological station to stream synoptic forecasts, hourly trajectories, and atmospheric telemetry.
      </p>

      {/* Main Action Search CTA */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onOpenSearch}
          className="touch-target inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          <Search className="h-4 w-4" />
          <span>Search Global City</span>
        </button>
      </div>

      {/* Suggested Quick Starts */}
      {suggestedCities.length > 0 && (
        <div className="mt-10 w-full max-w-md border-t border-neutral-200/60 pt-6 dark:border-neutral-800/60">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
            Popular Stations
          </span>
          <div className="grid grid-cols-2 gap-2">
            {suggestedCities.slice(0, 4).map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => onSelectCity(city)}
                className="touch-target flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white/80 px-3 py-2 text-xs font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <MapPin className="h-3 w-3 text-cyan-500" />
                <span className="truncate">{city.name}</span>
                <span className="text-[10px] text-neutral-400">({city.countryCode})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
