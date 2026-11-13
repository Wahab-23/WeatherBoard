import type { WeatherData, DailyForecast, HourlyForecast, CurrentWeather } from '../types';
import { safeStorage } from './safeStorage';

export const LAST_WEATHER_STORAGE_KEY = 'weatherboard_last_weather_payload';

// Conversion helpers
export function cToF(celsius: number): number {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371 * 10) / 10;
}

export function degToCompass(num: number): string {
  const val = Math.floor(num / 22.5 + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16];
}

// WMO Weather code mapper for Open-Meteo
function interpretWmoCode(code: number): { condition: string; description: string; icon: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear', description: 'Clear sky', icon: 'clear-day' };
    case 1:
      return { condition: 'Mainly Clear', description: 'Mainly clear', icon: 'partly-cloudy-day' };
    case 2:
      return { condition: 'Partly Cloudy', description: 'Partly cloudy sky', icon: 'partly-cloudy-day' };
    case 3:
      return { condition: 'Overcast', description: 'Overcast conditions', icon: 'cloudy' };
    case 45:
    case 48:
      return { condition: 'Fog', description: 'Depositing rime fog', icon: 'fog' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', description: 'Light to dense drizzle', icon: 'drizzle' };
    case 56:
    case 57:
      return { condition: 'Freezing Drizzle', description: 'Freezing drizzle', icon: 'sleet' };
    case 61:
      return { condition: 'Slight Rain', description: 'Slight rain showers', icon: 'rain' };
    case 63:
      return { condition: 'Moderate Rain', description: 'Moderate rain', icon: 'rain' };
    case 65:
      return { condition: 'Heavy Rain', description: 'Heavy rain downpour', icon: 'heavy-rain' };
    case 66:
    case 67:
      return { condition: 'Freezing Rain', description: 'Freezing rain', icon: 'sleet' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snowfall', description: 'Slight to heavy snowfall', icon: 'snow' };
    case 77:
      return { condition: 'Snow Grains', description: 'Snow grains', icon: 'snow' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', description: 'Violent rain showers', icon: 'heavy-rain' };
    case 85:
    case 86:
      return { condition: 'Snow Showers', description: 'Snow showers', icon: 'snow' };
    case 95:
      return { condition: 'Thunderstorm', description: 'Thunderstorm', icon: 'thunderstorm' };
    case 96:
    case 99:
      return { condition: 'Thunderstorm with Hail', description: 'Thunderstorm with heavy hail', icon: 'thunderstorm' };
    default:
      return { condition: 'Atmospheric', description: 'Variable meteorological conditions', icon: 'partly-cloudy-day' };
  }
}

/**
 * Normalizes OpenWeatherMap 2.5 API response
 */
function normalizeOpenWeather(
  currentJson: any,
  forecastJson: any,
  cityName: string,
  country: string,
  region?: string
): WeatherData {
  const c = currentJson;
  const tempC = Math.round(c.main.temp * 10) / 10;
  const feelsLikeC = Math.round(c.main.feels_like * 10) / 10;
  const tempMinC = Math.round(c.main.temp_min * 10) / 10;
  const tempMaxC = Math.round(c.main.temp_max * 10) / 10;
  const windKmh = Math.round((c.wind.speed * 3.6) * 10) / 10;
  const visibilityKm = c.visibility ? Math.round((c.visibility / 1000) * 10) / 10 : 10;

  // Process 5-day / 3-hour list
  const list = forecastJson?.list || [];
  const hourly: HourlyForecast[] = list.slice(0, 12).map((item: any) => {
    const d = new Date(item.dt * 1000);
    const itemTempC = Math.round(item.main.temp * 10) / 10;
    return {
      time: d.toISOString(),
      displayTime: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tempC: itemTempC,
      tempF: cToF(itemTempC),
      condition: item.weather[0]?.main || 'Clear',
      icon: item.weather[0]?.icon || '01d',
      pop: Math.round((item.pop || 0) * 100),
      windSpeedKmh: Math.round((item.wind.speed * 3.6) * 10) / 10,
      windSpeedMph: kmhToMph((item.wind.speed * 3.6)),
    };
  });

  // Aggregate daily forecast from 3-hour forecast steps
  const dailyMap: Record<string, any[]> = {};
  list.forEach((item: any) => {
    const dateKey = item.dt_txt.split(' ')[0];
    if (!dailyMap[dateKey]) dailyMap[dateKey] = [];
    dailyMap[dateKey].push(item);
  });

  const daily: DailyForecast[] = Object.keys(dailyMap).slice(0, 5).map((dateKey) => {
    const items = dailyMap[dateKey];
    const temps = items.map((i) => i.main.temp);
    const maxC = Math.round(Math.max(...temps) * 10) / 10;
    const minC = Math.round(Math.min(...temps) * 10) / 10;
    const midItem = items[Math.floor(items.length / 2)] || items[0];
    const dateObj = new Date(dateKey + 'T12:00:00Z');
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    const maxPop = Math.max(...items.map((i) => i.pop || 0));

    return {
      date: dateKey,
      dayName,
      tempMaxC: maxC,
      tempMaxF: cToF(maxC),
      tempMinC: minC,
      tempMinF: cToF(minC),
      condition: midItem.weather[0]?.main || 'Clear',
      icon: midItem.weather[0]?.icon || '01d',
      pop: Math.round(maxPop * 100),
      humidity: Math.round(items.reduce((acc, i) => acc + i.main.humidity, 0) / items.length),
      windSpeedKmh: Math.round((midItem.wind.speed * 3.6) * 10) / 10,
      windSpeedMph: kmhToMph(midItem.wind.speed * 3.6),
    };
  });

  const current: CurrentWeather = {
    tempC,
    tempF: cToF(tempC),
    feelsLikeC,
    feelsLikeF: cToF(feelsLikeC),
    tempMinC,
    tempMinF: cToF(tempMinC),
    tempMaxC,
    tempMaxF: cToF(tempMaxC),
    condition: c.weather[0]?.main || 'Clear',
    conditionDescription: c.weather[0]?.description || 'Clear sky',
    conditionCode: String(c.weather[0]?.id || 800),
    icon: c.weather[0]?.icon || '01d',
    humidity: c.main.humidity,
    windSpeedKmh: windKmh,
    windSpeedMph: kmhToMph(windKmh),
    windDirectionDeg: c.wind.deg || 0,
    windDirectionText: degToCompass(c.wind.deg || 0),
    pressureHpa: c.main.pressure,
    uvIndex: 5, // OpenWeather 2.5 free does not include UV, default to 5 or calculated
    visibilityKm,
    visibilityMiles: Math.round(visibilityKm * 0.621371 * 10) / 10,
    dewPointC: Math.round((tempC - (100 - c.main.humidity) / 5) * 10) / 10,
    dewPointF: cToF(Math.round((tempC - (100 - c.main.humidity) / 5) * 10) / 10),
    cloudCoverPct: c.clouds?.all ?? 0,
    sunrise: new Date(c.sys.sunrise * 1000).toISOString(),
    sunset: new Date(c.sys.sunset * 1000).toISOString(),
  };

  return {
    city: cityName || c.name,
    country: country || c.sys?.country || '',
    region,
    latitude: c.coord.lat,
    longitude: c.coord.lon,
    timezone: 'UTC',
    source: 'OpenWeatherMap',
    isFallback: false,
    fetchedAt: new Date().toISOString(),
    current,
    hourly,
    daily,
  };
}

/**
 * Normalizes Open-Meteo API response
 */
function normalizeOpenMeteo(
  data: any,
  cityName: string,
  country: string,
  region?: string
): WeatherData {
  const currentData = data.current;
  const hourlyData = data.hourly;
  const dailyData = data.daily;

  const wmo = interpretWmoCode(currentData.weather_code);
  const tempC = Math.round(currentData.temperature_2m * 10) / 10;
  const feelsLikeC = Math.round(currentData.apparent_temperature * 10) / 10;
  const windKmh = Math.round(currentData.wind_speed_10m * 10) / 10;

  // Process hourly (next 24 hours)
  const currentTimeIso = currentData.time;
  const startIndex = Math.max(0, hourlyData.time.findIndex((t: string) => t >= currentTimeIso));
  const hourly: HourlyForecast[] = [];

  for (let i = startIndex; i < Math.min(startIndex + 16, hourlyData.time.length); i++) {
    const timeStr = hourlyData.time[i];
    const d = new Date(timeStr);
    const hTempC = Math.round(hourlyData.temperature_2m[i] * 10) / 10;
    const hWmo = interpretWmoCode(hourlyData.weather_code[i]);
    const hWindKmh = Math.round(hourlyData.wind_speed_10m[i] * 10) / 10;

    hourly.push({
      time: d.toISOString(),
      displayTime: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tempC: hTempC,
      tempF: cToF(hTempC),
      condition: hWmo.condition,
      icon: hWmo.icon,
      pop: Math.round(hourlyData.precipitation_probability?.[i] || 0),
      windSpeedKmh: hWindKmh,
      windSpeedMph: kmhToMph(hWindKmh),
    });
  }

  // Process daily (next 5-7 days)
  const daily: DailyForecast[] = [];
  const daysCount = Math.min(5, dailyData.time.length);

  for (let i = 0; i < daysCount; i++) {
    const dateStr = dailyData.time[i];
    const dateObj = new Date(dateStr + 'T12:00:00Z');
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dMaxC = Math.round(dailyData.temperature_2m_max[i] * 10) / 10;
    const dMinC = Math.round(dailyData.temperature_2m_min[i] * 10) / 10;
    const dWmo = interpretWmoCode(dailyData.weather_code[i]);
    const dWind = Math.round(dailyData.wind_speed_10m_max[i] * 10) / 10;

    daily.push({
      date: dateStr,
      dayName,
      tempMaxC: dMaxC,
      tempMaxF: cToF(dMaxC),
      tempMinC: dMinC,
      tempMinF: cToF(dMinC),
      condition: dWmo.condition,
      icon: dWmo.icon,
      pop: Math.round(dailyData.precipitation_probability_max?.[i] || 0),
      humidity: Math.round(currentData.relative_humidity_2m),
      windSpeedKmh: dWind,
      windSpeedMph: kmhToMph(dWind),
      summary: dWmo.description,
    });
  }

  // Visibility and dew point from hourly index
  const visMeters = hourlyData.visibility?.[startIndex] ?? 10000;
  const visKm = Math.round((visMeters / 1000) * 10) / 10;
  const dewC = hourlyData.dew_point_2m?.[startIndex]
    ? Math.round(hourlyData.dew_point_2m[startIndex] * 10) / 10
    : Math.round((tempC - (100 - currentData.relative_humidity_2m) / 5) * 10) / 10;

  const current: CurrentWeather = {
    tempC,
    tempF: cToF(tempC),
    feelsLikeC,
    feelsLikeF: cToF(feelsLikeC),
    tempMinC: daily[0]?.tempMinC ?? tempC,
    tempMinF: daily[0]?.tempMinF ?? cToF(tempC),
    tempMaxC: daily[0]?.tempMaxC ?? tempC,
    tempMaxF: daily[0]?.tempMaxF ?? cToF(tempC),
    condition: wmo.condition,
    conditionDescription: wmo.description,
    conditionCode: String(currentData.weather_code),
    icon: wmo.icon,
    humidity: Math.round(currentData.relative_humidity_2m),
    windSpeedKmh: windKmh,
    windSpeedMph: kmhToMph(windKmh),
    windDirectionDeg: currentData.wind_direction_10m,
    windDirectionText: degToCompass(currentData.wind_direction_10m),
    pressureHpa: Math.round(currentData.surface_pressure || currentData.pressure_msl || 1013),
    uvIndex: Math.round((dailyData.uv_index_max?.[0] || 4) * 10) / 10,
    visibilityKm: visKm,
    visibilityMiles: Math.round(visKm * 0.621371 * 10) / 10,
    dewPointC: dewC,
    dewPointF: cToF(dewC),
    cloudCoverPct: Math.round(currentData.cloud_cover || 0),
    sunrise: dailyData.sunrise?.[0] || new Date().toISOString(),
    sunset: dailyData.sunset?.[0] || new Date().toISOString(),
  };

  return {
    city: cityName,
    country,
    region,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone || 'UTC',
    source: 'Open-Meteo',
    isFallback: true,
    fetchedAt: new Date().toISOString(),
    current,
    hourly,
    daily,
  };
}

/**
 * Weather Engine with Automatic Fallback:
 * Attempts OpenWeatherMap first if an API key is provided.
 * Seamlessly catches network failures, rate limits, or authorization errors
 * and falls back to Open-Meteo, storing the resulting normalized data in SafeStorage.
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  cityName: string,
  country: string,
  region?: string,
  signal?: AbortSignal
): Promise<WeatherData> {
  // If offline, attempt immediate load of cached payload
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const cached = getCachedWeather();
    if (cached) {
      return {
        ...cached,
        source: 'Cached Payload',
        isFallback: true,
      };
    }
  }

  const customKey = safeStorage.getItem('weatherboard_custom_openweather_key');
  const envKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const apiKey = (customKey || envKey || '').trim();

  // Try OpenWeatherMap if key is available
  if (apiKey.length > 0) {
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`,
          { signal }
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`,
          { signal }
        ),
      ]);

      if (currentRes.ok && forecastRes.ok) {
        const currentJson = await currentRes.json();
        const forecastJson = await forecastRes.json();
        const normalized = normalizeOpenWeather(currentJson, forecastJson, cityName, country, region);
        saveCachedWeather(normalized);
        return normalized;
      }

      console.warn(
        `[WeatherEngine] OpenWeatherMap returned HTTP ${currentRes.status}/${forecastRes.status}. Engaging Open-Meteo fallback.`
      );
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') throw err;
      console.warn('[WeatherEngine] OpenWeatherMap request failed, seamlessly switching to Open-Meteo fallback:', err);
    }
  }

  // Keyless Fallback Engine: Open-Meteo Forecast API
  const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,weather_code,pressure_msl,surface_pressure,visibility,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  try {
    const res = await fetch(openMeteoUrl, { signal });
    if (!res.ok) {
      throw {
        status: res.status,
        message: `Open-Meteo weather request failed with status ${res.status}`,
      };
    }
    const data = await res.json();
    const normalized = normalizeOpenMeteo(data, cityName, country, region);
    saveCachedWeather(normalized);
    return normalized;
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') throw err;

    // Check if we have an offline cached copy before throwing
    const cached = getCachedWeather();
    if (cached) {
      console.warn('[WeatherEngine] Network failed. Serving cached payload.');
      return {
        ...cached,
        source: 'Cached Payload',
        isFallback: true,
      };
    }
    throw err;
  }
}

/**
 * Saves last-viewed city weather payload to safe storage
 */
export function saveCachedWeather(data: WeatherData): void {
  safeStorage.setJSON(LAST_WEATHER_STORAGE_KEY, data);
}

/**
 * Retrieves last-viewed city weather payload from safe storage
 */
export function getCachedWeather(): WeatherData | null {
  return safeStorage.getJSON<WeatherData | null>(LAST_WEATHER_STORAGE_KEY, null);
}
