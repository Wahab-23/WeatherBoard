import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, AlertCircle, X, Sparkles, Globe } from 'lucide-react';
import type { GeoCity } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { searchCities } from '../services/citySearchService';
import { validateCityInput, mapHttpOrNetworkError, type ActionableError } from '../services/errorMapper';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: GeoCity) => void;
  favorites: GeoCity[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  favorites,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<ActionableError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GeoCity[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [searchSource, setSearchSource] = useState<'geodb' | 'open-meteo' | null>(null);

  const debouncedQuery = useDebounce(query, 280);

  // Manage native dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setQuery('');
        setValidationError(null);
        setApiError(null);
        setResults([]);
        setSelectedIndex(-1);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Execute debounced search
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setApiError(null);
      return;
    }

    const abortController = new AbortController();
    setIsLoading(true);
    setApiError(null);
    setValidationError(null);

    searchCities(trimmed, abortController.signal)
      .then(({ cities, source }) => {
        setResults(cities);
        setSearchSource(source);
        setIsLoading(false);
        setSelectedIndex(-1);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setIsLoading(false);
        setResults([]);
        setApiError(mapHttpOrNetworkError(err, 'search'));
      });

    return () => {
      abortController.abort();
    };
  }, [debouncedQuery]);

  // Client-side blur validation
  const handleBlur = () => {
    if (query.trim().length > 0 && query.trim().length < 2) {
      setValidationError('City name must contain at least 2 characters.');
    }
  };

  // Client-side submit validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateCityInput(query);
    if (err) {
      setValidationError(err);
      return;
    }

    if (results.length > 0) {
      const target = selectedIndex >= 0 ? results[selectedIndex] : results[0];
      handleSelect(target);
    }
  };

  const handleSelect = (city: GeoCity) => {
    onSelectCity(city);
    onClose();
  };

  // Keyboard navigation through suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    }
  };

  // Native Esc and light dismiss
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (isOutside) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-labelledby="search-dialog-title"
      className="m-auto w-fit max-w-lg rounded-2xl border border-neutral-200 bg-white p-0 shadow-2xl backdrop:bg-black/60 dark:border-neutral-800 dark:bg-[#0c0e14] dark:text-neutral-100 overflow-hidden"
    >
      {/* Search Header Form */}
      <form onSubmit={handleSubmit} className="relative border-b border-neutral-200/80 p-4 dark:border-neutral-800">
        <h2 id="search-dialog-title" className="sr-only">
          Search City Meteorological Station
        </h2>

        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Search city by name (e.g. London, Tokyo, New York)..."
            className="w-full rounded-xl border border-neutral-200/90 bg-neutral-50 py-3 pl-10 pr-24 text-sm text-neutral-900 placeholder-neutral-400 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-cyan-400 dark:focus:bg-neutral-900"
            aria-autocomplete="list"
            aria-controls="city-suggestions-list"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />}
            <button
              type="button"
              onClick={onClose}
              className="touch-target rounded-lg inline-flex justify-center p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </form>

      {/* Suggestion & Results Container */}
      <div id="city-suggestions-list" className="max-h-80 overflow-y-auto p-2 scrollbar-none">

        {/* Loading State */}
        {isLoading && results.length === 0 && (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex h-12 w-full animate-pulse items-center gap-3 rounded-xl bg-neutral-100 px-3 dark:bg-neutral-800/50"
              >
                <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-2.5 w-1/4 rounded bg-neutral-200/70 dark:bg-neutral-700/70" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API / Network Error State */}
        {apiError && !isLoading && (
          <div className="m-2 rounded-xl border border-amber-500/20 bg-amber-50/60 p-4 text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="font-semibold">{apiError.title}</h3>
                <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">{apiError.message}</p>
                {apiError.actionHint && (
                  <p className="mt-1 font-medium text-amber-800 dark:text-amber-300">{apiError.actionHint}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty Search Results */}
        {!isLoading && !apiError && query.trim().length >= 2 && results.length === 0 && (
          <div className="py-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
            <Globe className="mx-auto h-7 w-7 text-neutral-300 dark:text-neutral-600" />
            <p className="mt-2 font-medium">No matching cities found for &ldquo;{query}&rdquo;</p>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              Check for typos or try searching with the English name.
            </p>
          </div>
        )}

        {/* Successful Suggestions List */}
        {!isLoading && results.length > 0 && (
          <ul className="space-y-1" role="listbox">
            {results.map((city, idx) => {
              const isHighlighted = idx === selectedIndex;
              return (
                <li key={city.id} role="option" aria-selected={isHighlighted}>
                  <button
                    type="button"
                    onClick={() => handleSelect(city)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`justify-between touch-target w-full rounded-xl px-3 py-2.5 text-left transition-colors flex items-center ${isHighlighted
                      ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50'
                      : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                          {city.name}
                        </span>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                          {city.region ? `${city.region}, ` : ''}
                          {city.country}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {city.countryCode && (
                        <span className="rounded bg-neutral-200/60 px-1.5 py-0.5 font-mono text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                          {city.countryCode}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Initial Empty Query / Pinned Shortcuts */}
        {query.trim().length < 2 && (
          <div className="p-3">
            <div className="flex items-center gap-1.5 pb-2 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
              <span>Quick Select Pinned Cities</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {favorites.map((fav) => (
                <button
                  key={fav.id}
                  type="button"
                  onClick={() => handleSelect(fav)}
                  className="touch-target flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 px-3 py-2 text-left text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{fav.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/80 px-4 py-2.5 text-[11px] text-neutral-400 dark:border-neutral-800/80 dark:bg-neutral-900/40 dark:text-neutral-500">
        <div className="flex items-center gap-1.5">
          <span>Engine:</span>
          <span className="font-mono text-[10px] text-neutral-600 dark:text-neutral-400">
            {searchSource === 'geodb' ? 'GeoDB Cities (RapidAPI)' : 'Open-Meteo Geocoding'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span>Navigate:</span>
          <kbd className="rounded border border-neutral-200 bg-white px-1 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
            ↑↓
          </kbd>
          <span>Select:</span>
          <kbd className="rounded border border-neutral-200 bg-white px-1 font-mono text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
            ↵
          </kbd>
        </div>
      </div>
    </dialog>
  );
};
