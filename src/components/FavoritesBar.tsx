import React from 'react';
import { MapPin, Plus, X, Star } from 'lucide-react';
import type { GeoCity } from '../types';

interface FavoritesBarProps {
  favorites: GeoCity[];
  selectedCity: GeoCity | null;
  onSelectCity: (city: GeoCity) => void;
  onRequestRemove: (city: GeoCity) => void;
  onOpenSearch: () => void;
  maxFavorites: number;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({
  favorites,
  selectedCity,
  onSelectCity,
  onRequestRemove,
  onOpenSearch,
  maxFavorites,
}) => {
  return (
    <nav
      aria-label="Pinned meteorological stations"
      className="w-full border-b border-neutral-200/60 bg-neutral-100/40 px-4 py-2 dark:border-neutral-800/60 dark:bg-neutral-900/30"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Quick Access Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <div className="hidden md:flex items-center gap-1 pr-2 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
            <Star className="h-3 w-3 text-amber-500" />
            <span>Pinned:</span>
          </div>

          {favorites.map((city) => {
            const isSelected =
              selectedCity?.id === city.id ||
              (selectedCity?.name === city.name && selectedCity?.countryCode === city.countryCode);

            return (
              <div
                key={city.id}
                className={`group flex items-center rounded-lg border text-xs font-medium transition-all ${isSelected
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50'
                  : 'border-neutral-200/80 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300 dark:hover:border-neutral-700'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectCity(city)}
                  className="touch-target flex items-center gap-1.5 px-3 py-1.5 focus:outline-none"
                  aria-label={`Select ${city.name}, ${city.country}`}
                >
                  <MapPin className={`h-3 w-3 ${isSelected ? 'text-cyan-400' : 'text-neutral-400'}`} />
                  <span className="truncate max-w-27.5">{city.name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                    {city.countryCode}
                  </span>
                </button>

                {/* Remove button trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestRemove(city);
                  }}
                  className={`touch-target rounded-r-lg px-2 text-neutral-400 hover:text-rose-500 inline-flex justify-center focus:outline-none ${isSelected ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100'
                    }`}
                  aria-label={`Remove ${city.name} from pinned locations`}
                  title="Remove from pinned"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}

          {/* Add City Button if under limit */}
          {favorites.length < maxFavorites && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="h-11 inline-flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-xs text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200"
              title="Pin a new city"
            >
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline text-[11px]">Pin City</span>
              <span className="text-[10px] text-neutral-400 font-mono">
                ({favorites.length}/{maxFavorites})
              </span>
            </button>
          )}
        </div>

        {/* Counter pill on desktop */}
        <div className="hidden sm:flex items-center text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
          <span>{favorites.length} of {maxFavorites} slots used</span>
        </div>
      </div>
    </nav>
  );
};

