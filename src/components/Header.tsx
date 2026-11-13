import React from 'react';
import { CloudSun, Search, Sun, Moon, Sliders } from 'lucide-react';
import type { TempUnit } from '../types';

interface HeaderProps {
  unit: TempUnit;
  onToggleUnit: () => void;
  resolvedTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  isOnline: boolean;
  isFallback: boolean;
  source: string;
}

export const Header: React.FC<HeaderProps> = ({
  unit,
  onToggleUnit,
  resolvedTheme,
  onToggleTheme,
  onOpenSearch,
  onOpenSettings,
  isOnline,
  isFallback,
  source,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-[#090b10]/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-cyan-400 shadow-sm dark:bg-neutral-800/80 dark:text-cyan-300 dark:ring-1 dark:ring-white/10">
            <CloudSun className="h-5 w-5" />
          </div>

          <div className="hidden flex-col md:flex">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                WeatherBoard
              </span>
            </div>

            {/* Engine Status Subtitle */}
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${!isOnline
                  ? 'bg-amber-500'
                  : isFallback
                    ? 'bg-cyan-500'
                    : 'bg-emerald-500'
                  }`}
              />
              <span className="font-mono text-[10px] truncate max-w-35 sm:max-w-none">
                {!isOnline ? 'Offline' : source}
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Bar (Linear style) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="group flex h-11 w-full mx-2 md:mx-4 items-center justify-between rounded-lg border border-neutral-200/90 bg-neutral-100/60 px-3 text-sm text-neutral-500 transition-all hover:border-neutral-300 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80"
          aria-label="Search city or coordinates"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300" />
            <span className="truncate text-xs sm:text-sm">Search city...</span>
          </div>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-neutral-300/80 bg-white px-1.5 font-mono text-[10px] font-medium text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </button>

        {/* Action Controls (Enforcing >= 44x44px touch targets) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Unit Toggle Button */}
          <button
            type="button"
            onClick={onToggleUnit}
            className="px-4 w-19 touch-target relative rounded-lg hidden md:inline-flex border border-neutral-200/80 bg-white text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 active:scale-95 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800"
            title={`Switch to °${unit === 'C' ? 'F' : 'C'}`}
            aria-label={`Current unit is degrees ${unit}. Toggle to degrees ${unit === 'C' ? 'F' : 'C'}`}
          >
            <span className="font-mono text-xs">
              <span className={unit === 'C' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-neutral-400'}>
                °C
              </span>
              <span className="text-neutral-300 dark:text-neutral-700 mx-0.5">/</span>
              <span className={unit === 'F' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-neutral-400'}>
                °F
              </span>
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="touch-target inline-flex justify-center  rounded-lg border border-neutral-200/80 bg-white text-neutral-700 transition hover:bg-neutral-50 active:scale-95 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800"
            title={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label="Toggle theme color scheme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-700 transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="touch-target inline-flex justify-center rounded-lg border border-neutral-200/80 bg-white text-neutral-700 transition hover:bg-neutral-50 active:scale-95 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800"
            title="Configure notifications, API keys, and preferences"
            aria-label="Open settings and preferences"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
