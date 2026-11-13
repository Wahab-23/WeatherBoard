import { useState, useCallback } from 'react';
import type { GeoCity } from '../types';
import { safeStorage } from '../services/safeStorage';

const FAVORITES_STORAGE_KEY = 'weatherboard_favorites';
export const MAX_FAVORITES = 5;

// Default initial cities if none are saved
export const DEFAULT_CITIES: GeoCity[] = [
  {
    id: 'om-default-london',
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    id: 'om-default-tokyo',
    name: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    id: 'om-default-new-york',
    name: 'New York',
    country: 'United States',
    countryCode: 'US',
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: 'om-default-lahore',
    name: 'Lahore',
    country: 'Pakistan',
    countryCode: 'PK',
    latitude: 31.5497,
    longitude: 74.3436,
  },
];

export function useFavorites() {
  const [favorites, setFavorites] = useState<GeoCity[]>(() => {
    const saved = safeStorage.getJSON<GeoCity[]>(FAVORITES_STORAGE_KEY, []);
    return saved.length > 0 ? saved : DEFAULT_CITIES;
  });

  const saveFavoritesList = useCallback((updated: GeoCity[]) => {
    setFavorites(updated);
    safeStorage.setJSON(FAVORITES_STORAGE_KEY, updated);
  }, []);

  const addFavorite = useCallback(
    (city: GeoCity): { success: boolean; message?: string } => {
      // Check if already in favorites by coordinates or name+country
      const exists = favorites.some(
        (f) =>
          f.id === city.id ||
          (Math.abs(f.latitude - city.latitude) < 0.05 &&
            Math.abs(f.longitude - city.longitude) < 0.05) ||
          (f.name.toLowerCase() === city.name.toLowerCase() &&
            f.countryCode === city.countryCode)
      );

      if (exists) {
        return { success: false, message: `${city.name} is already in your pinned locations.` };
      }

      if (favorites.length >= MAX_FAVORITES) {
        return {
          success: false,
          message: `Saved locations capped at ${MAX_FAVORITES}. Remove one to add ${city.name}.`,
        };
      }

      const updated = [city, ...favorites];
      saveFavoritesList(updated);
      return { success: true };
    },
    [favorites, saveFavoritesList]
  );

  const removeFavorite = useCallback(
    (cityId: string) => {
      const updated = favorites.filter((f) => f.id !== cityId);
      saveFavoritesList(updated);
    },
    [favorites, saveFavoritesList]
  );

  const isFavorite = useCallback(
    (city: GeoCity | null) => {
      if (!city) return false;
      return favorites.some(
        (f) =>
          f.id === city.id ||
          (Math.abs(f.latitude - city.latitude) < 0.05 &&
            Math.abs(f.longitude - city.longitude) < 0.05)
      );
    },
    [favorites]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    maxFavorites: MAX_FAVORITES,
  };
}
