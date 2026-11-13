import type { GeoCity } from '../types';
import { safeStorage } from './safeStorage';

export interface GeoDBCityResponse {
  data: Array<{
    id: number;
    city: string;
    name: string;
    country: string;
    countryCode: string;
    region?: string;
    latitude: number;
    longitude: number;
    population?: number;
  }>;
}

export interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    country_code: string;
    admin1?: string;
    population?: number;
  }>;
}

/**
 * Searches for cities with GeoDB Cities RapidAPI as primary,
 * seamlessly falling back to Open-Meteo Geocoding API when keys are omitted,
 * unauthorized, or rate-limited.
 */
export async function searchCities(
  query: string,
  signal?: AbortSignal
): Promise<{ cities: GeoCity[]; source: 'geodb' | 'open-meteo' }> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { cities: [], source: 'geodb' };
  }

  // Check custom user key in safeStorage or Vite env
  const customRapidKey = safeStorage.getItem('weatherboard_custom_rapidapi_key');
  const envRapidKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const rapidApiKey = customRapidKey || envRapidKey;
  const rapidApiHost = import.meta.env.VITE_RAPIDAPI_HOST || 'wft-geo-db.p.rapidapi.com';

  if (rapidApiKey && rapidApiKey.trim().length > 0) {
    try {
      const url = `https://${rapidApiHost}/v1/geo/cities?namePrefix=${encodeURIComponent(
        trimmed
      )}&limit=8&sort=-population`;

      const response = await fetch(url, {
        headers: {
          'x-rapidapi-key': rapidApiKey.trim(),
          'x-rapidapi-host': rapidApiHost,
        },
        signal,
      });

      if (response.ok) {
        const json = (await response.json()) as GeoDBCityResponse;
        if (json.data && Array.isArray(json.data)) {
          const mapped: GeoCity[] = json.data.map((c) => ({
            id: `geodb-${c.id}`,
            name: c.name || c.city,
            country: c.country,
            countryCode: c.countryCode || '',
            region: c.region,
            latitude: c.latitude,
            longitude: c.longitude,
            population: c.population,
          }));
          return { cities: mapped, source: 'geodb' };
        }
      } else {
        console.warn(`[CitySearch] GeoDB returned HTTP ${response.status}. Falling back to Open-Meteo Geocoding.`);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') throw err;
      console.warn('[CitySearch] GeoDB request failed, switching to Open-Meteo Geocoding:', err);
    }
  }

  // Keyless Fallback: Open-Meteo Geocoding API
  const fallbackUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=8&language=en&format=json`;

  const fallbackRes = await fetch(fallbackUrl, { signal });
  if (!fallbackRes.ok) {
    throw {
      status: fallbackRes.status,
      message: `Geocoding fallback failed with status ${fallbackRes.status}`,
    };
  }

  const data = (await fallbackRes.json()) as OpenMeteoGeocodingResponse;
  if (!data.results || data.results.length === 0) {
    return { cities: [], source: 'open-meteo' };
  }

  const mapped: GeoCity[] = data.results.map((c) => ({
    id: `om-${c.id}`,
    name: c.name,
    country: c.country,
    countryCode: c.country_code ? c.country_code.toUpperCase() : '',
    region: c.admin1,
    latitude: c.latitude,
    longitude: c.longitude,
    population: c.population,
  }));

  return { cities: mapped, source: 'open-meteo' };
}
