import { useState, useEffect, useCallback } from 'react';
import type { GeoCity, WeatherData } from './types';
import { safeStorage } from './services/safeStorage';
import { fetchWeather, getCachedWeather } from './services/weatherService';
import { mapHttpOrNetworkError, type ActionableError } from './services/errorMapper';
import { usePreferences } from './hooks/usePreferences';
import { useFavorites, DEFAULT_CITIES } from './hooks/useFavorites';
import { useNotifications } from './hooks/useNotifications';
import { useNetworkStatus } from './hooks/useNetworkStatus';

import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { FavoritesBar } from './components/FavoritesBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { MetricsGrid } from './components/MetricsGrid';
import { HourlyForecastCard } from './components/HourlyForecastCard';
import { DailyForecastCard } from './components/DailyForecastCard';
import { SearchModal } from './components/SearchModal';
import { SettingsModal } from './components/SettingsModal';
import { RemoveCityDialog } from './components/RemoveCityDialog';
import { SkeletonLoader } from './components/SkeletonLoader';
import { EmptyState } from './components/EmptyState';

const SELECTED_CITY_KEY = 'weatherboard_selected_city';

export function App() {
  const { unit, toggleUnit, theme, resolvedTheme, setTheme, toggleTheme, setUnit } = usePreferences();
  const { favorites, addFavorite, removeFavorite, isFavorite, maxFavorites } = useFavorites();
  const { isOnline } = useNetworkStatus();

  const notifications = useNotifications();

  // Selected city state
  const [selectedCity, setSelectedCity] = useState<GeoCity | null>(() => {
    const saved = safeStorage.getJSON<GeoCity | null>(SELECTED_CITY_KEY, null);
    if (saved) return saved;
    return favorites[0] || DEFAULT_CITIES[0];
  });

  // Weather payload state
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    return getCachedWeather();
  });
  const [isLoading, setIsLoading] = useState<boolean>(!weather);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ActionableError | null>(null);

  // Modal dialog states
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [cityToRemove, setCityToRemove] = useState<GeoCity | null>(null);

  // Load weather for a given city
  const loadWeather = useCallback(
    async (city: GeoCity, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchWeather(
          city.latitude,
          city.longitude,
          city.name,
          city.country,
          city.region
        );
        setWeather(data);
      } catch (err) {
        console.error('[App] Failed to load weather data:', err);
        setError(mapHttpOrNetworkError(err, 'weather'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Effect to load weather when selectedCity changes
  useEffect(() => {
    if (selectedCity) {
      safeStorage.setJSON(SELECTED_CITY_KEY, selectedCity);
      loadWeather(selectedCity);
    }
  }, [selectedCity, loadWeather]);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCity = (city: GeoCity) => {
    setSelectedCity(city);
  };

  const handleToggleFavorite = () => {
    if (!selectedCity) return;
    if (isFavorite(selectedCity)) {
      setCityToRemove(selectedCity);
    } else {
      addFavorite(selectedCity);
    }
  };

  const handleConfirmRemoveCity = () => {
    if (cityToRemove) {
      removeFavorite(cityToRemove.id);
      setCityToRemove(null);
    }
  };

  const handleManualRefresh = () => {
    if (selectedCity) {
      loadWeather(selectedCity, true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 transition-colors dark:bg-[#090b10] dark:text-neutral-100">
      
      {/* Header Bar */}
      <Header
        unit={unit}
        onToggleUnit={toggleUnit}
        resolvedTheme={resolvedTheme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOnline={isOnline}
        isFallback={weather?.isFallback ?? false}
        source={weather?.source ?? 'Connecting...'}
      />

      {/* Offline Mode Alert Banner */}
      <OfflineBanner
        isOnline={isOnline}
        isCachedPayload={weather?.source === 'Cached Payload'}
        fetchedAt={weather?.fetchedAt}
        onRefresh={handleManualRefresh}
      />

      {/* Pinned Stations Quick Navigation */}
      <FavoritesBar
        favorites={favorites}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        onRequestRemove={(city) => setCityToRemove(city)}
        onOpenSearch={() => setIsSearchOpen(true)}
        maxFavorites={maxFavorites}
      />

      {/* Main Responsive Shell Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Error notification if live load fails and no cached data exists */}
        {error && !weather && (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-50/70 p-4 text-xs text-rose-900 dark:border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-200">
            <h3 className="font-semibold text-sm">{error.title}</h3>
            <p className="mt-1">{error.message}</p>
            {error.actionHint && (
              <p className="mt-1 font-medium text-rose-700 dark:text-rose-300">{error.actionHint}</p>
            )}
            <button
              type="button"
              onClick={handleManualRefresh}
              className="touch-target mt-3 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading skeleton state */}
        {isLoading && !weather ? (
          <SkeletonLoader />
        ) : !selectedCity && !weather ? (
          <EmptyState
            onOpenSearch={() => setIsSearchOpen(true)}
            onSelectCity={handleSelectCity}
            suggestedCities={favorites}
          />
        ) : weather ? (
          <div className="space-y-6">
            
            {/* Hero Current Weather */}
            <CurrentWeatherCard
              weather={weather}
              unit={unit}
              isFavorite={isFavorite(selectedCity)}
              onToggleFavorite={handleToggleFavorite}
              onRefresh={handleManualRefresh}
              isRefreshing={isRefreshing}
            />

            {/* Meteorological Indicators Grid */}
            <MetricsGrid weather={weather} unit={unit} />

            {/* Responsive Grid for Hourly and Daily Forecasts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Trajectory */}
              <HourlyForecastCard hourly={weather.hourly} unit={unit} />

              {/* 5-Day Synoptic Outlook */}
              <DailyForecastCard daily={weather.daily} unit={unit} />
            </div>

          </div>
        ) : null}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200/60 bg-white/40 py-6 text-center text-xs text-neutral-400 dark:border-neutral-800/60 dark:bg-neutral-900/20 dark:text-neutral-500">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px]">
            WeatherBoard Precision Meteorological Dashboard &copy; 2026
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Vite + React + TypeScript + PWA</span>
            <span>•</span>
            <span>OpenWeatherMap &rarr; Open-Meteo Engine</span>
          </div>
        </div>
      </footer>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCity={handleSelectCity}
        favorites={favorites}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        unit={unit}
        onSetUnit={setUnit}
        theme={theme}
        onSetTheme={setTheme}
        notificationPermission={notifications.permission}
        isNotificationsEnabled={notifications.isEnabled}
        isNotificationsSupported={notifications.isSupported}
        reminderTime={notifications.reminderTime}
        testSent={notifications.testSent}
        onRequestNotificationPermission={notifications.requestPermission}
        onDisableNotifications={notifications.disableNotifications}
        onUpdateReminderTime={notifications.updateReminderTime}
        onSendTestNotification={() =>
          notifications.sendTestNotification(
            weather?.city,
            weather ? `${Math.round(unit === 'C' ? weather.current.tempC : weather.current.tempF)}°${unit}` : undefined,
            weather?.current.condition
          )
        }
      />

      {/* Confirmation Dialog for Removing a Saved City */}
      <RemoveCityDialog
        city={cityToRemove}
        isOpen={cityToRemove !== null}
        onConfirm={handleConfirmRemoveCity}
        onCancel={() => setCityToRemove(null)}
      />

    </div>
  );
}

export default App;
