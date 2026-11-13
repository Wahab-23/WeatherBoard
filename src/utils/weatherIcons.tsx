import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
} from 'lucide-react';

export function getWeatherIcon(_iconKey: string, condition: string, className = 'h-8 w-8') {
  const condLower = condition.toLowerCase();
  if (condLower.includes('thunder') || condLower.includes('lightning')) {
    return <CloudLightning className={`${className} text-amber-400`} />;
  }
  if (condLower.includes('snow') || condLower.includes('sleet') || condLower.includes('hail')) {
    return <CloudSnow className={`${className} text-cyan-200`} />;
  }
  if (condLower.includes('drizzle')) {
    return <CloudDrizzle className={`${className} text-cyan-400`} />;
  }
  if (condLower.includes('rain') || condLower.includes('shower')) {
    return <CloudRain className={`${className} text-cyan-400`} />;
  }
  if (condLower.includes('fog') || condLower.includes('mist') || condLower.includes('haze')) {
    return <CloudFog className={`${className} text-neutral-400`} />;
  }
  if (condLower.includes('cloud') || condLower.includes('overcast')) {
    return <Cloud className={`${className} text-neutral-300 dark:text-neutral-400`} />;
  }
  return <Sun className={`${className} text-amber-400`} />;
}
