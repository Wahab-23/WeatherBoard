import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Sun,
  Eye,
  Sunrise,
} from 'lucide-react';
import type { WeatherData, TempUnit } from '../types';

interface MetricsGridProps {
  weather: WeatherData;
  unit: TempUnit;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ weather, unit }) => {
  const c = weather.current;

  // Format Sunrise and Sunset
  const sunriseTime = c.sunrise
    ? new Date(c.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const sunsetTime = c.sunset
    ? new Date(c.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const windSpeed = unit === 'C' ? `${c.windSpeedKmh} km/h` : `${c.windSpeedMph} mph`;
  const visibility = unit === 'C' ? `${c.visibilityKm} km` : `${c.visibilityMiles} mi`;

  // UV interpretation
  const uvCategory = (val: number) => {
    if (val < 3) return { label: 'Low', color: 'text-emerald-500' };
    if (val < 6) return { label: 'Moderate', color: 'text-amber-500' };
    if (val < 8) return { label: 'High', color: 'text-orange-500' };
    return { label: 'Very High', color: 'text-rose-500' };
  };

  const uvInfo = uvCategory(c.uvIndex);

  const metrics = [
    {
      id: 'humidity',
      label: 'Humidity',
      value: `${c.humidity}%`,
      subtext: `Dew point: ${unit === 'C' ? c.dewPointC : c.dewPointF}°${unit}`,
      icon: <Droplets className="h-4 w-4 text-cyan-500" />,
    },
    {
      id: 'wind',
      label: 'Wind Dynamics',
      value: windSpeed,
      subtext: `${c.windDirectionText} (${c.windDirectionDeg}°)`,
      icon: <Wind className="h-4 w-4 text-sky-500" />,
    },
    {
      id: 'pressure',
      label: 'Atmospheric Pressure',
      value: `${c.pressureHpa} hPa`,
      subtext: c.pressureHpa > 1013 ? 'High pressure system' : 'Low pressure system',
      icon: <Gauge className="h-4 w-4 text-indigo-500" />,
    },
    {
      id: 'uv',
      label: 'UV Index',
      value: `${c.uvIndex}`,
      subtext: uvInfo.label,
      subtextColor: uvInfo.color,
      icon: <Sun className="h-4 w-4 text-amber-500" />,
    },
    {
      id: 'visibility',
      label: 'Horizontal Visibility',
      value: visibility,
      subtext: c.visibilityKm >= 10 ? 'Clear line of sight' : 'Reduced atmospheric visibility',
      icon: <Eye className="h-4 w-4 text-teal-500" />,
    },
    {
      id: 'sun',
      label: 'Solar Cycle',
      value: `${sunriseTime} / ${sunsetTime}`,
      subtext: 'Dawn to dusk timeline',
      icon: <Sunrise className="h-4 w-4 text-orange-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((m) => (
        <div
          key={m.id}
          className="rounded-2xl border border-neutral-200/80 bg-white/60 p-4 backdrop-blur-md transition-all hover:border-neutral-300 dark:border-neutral-800/80 dark:bg-neutral-900/40 dark:hover:border-neutral-700"
        >
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">{m.label}</span>
            {m.icon}
          </div>

          <div className="mt-2">
            <span className="font-mono text-lg sm:text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {m.value}
            </span>
          </div>

          <div className="mt-1">
            <span className={`text-[11px] font-medium ${m.subtextColor || 'text-neutral-400 dark:text-neutral-500'}`}>
              {m.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
