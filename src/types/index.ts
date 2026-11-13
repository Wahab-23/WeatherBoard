export type TempUnit = 'C' | 'F';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface GeoCity {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region?: string;
  latitude: number;
  longitude: number;
  population?: number;
}

export interface HourlyForecast {
  time: string; // ISO string
  displayTime: string; // "14:00" or "2 PM"
  tempC: number;
  tempF: number;
  condition: string;
  icon: string;
  pop: number; // Probability of precipitation (0-100%)
  windSpeedKmh: number;
  windSpeedMph: number;
}

export interface DailyForecast {
  date: string; // ISO string
  dayName: string; // "Mon", "Tue", etc.
  tempMaxC: number;
  tempMaxF: number;
  tempMinC: number;
  tempMinF: number;
  condition: string;
  icon: string;
  pop: number;
  humidity: number;
  windSpeedKmh: number;
  windSpeedMph: number;
  summary?: string;
}

export interface CurrentWeather {
  tempC: number;
  tempF: number;
  feelsLikeC: number;
  feelsLikeF: number;
  tempMinC: number;
  tempMinF: number;
  tempMaxC: number;
  tempMaxF: number;
  condition: string;
  conditionDescription: string;
  conditionCode: string;
  icon: string;
  humidity: number;
  windSpeedKmh: number;
  windSpeedMph: number;
  windDirectionDeg: number;
  windDirectionText: string;
  pressureHpa: number;
  uvIndex: number;
  visibilityKm: number;
  visibilityMiles: number;
  dewPointC: number;
  dewPointF: number;
  cloudCoverPct: number;
  sunrise: string; // ISO string
  sunset: string; // ISO string
}

export interface WeatherData {
  city: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  source: 'OpenWeatherMap' | 'Open-Meteo' | 'Cached Payload';
  isFallback: boolean;
  fetchedAt: string;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export interface UserPreferences {
  unit: TempUnit;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  notificationTime: string; // "HH:MM" e.g. "08:00"
  savedCities: GeoCity[];
  customOpenWeatherKey?: string;
  customRapidApiKey?: string;
}
