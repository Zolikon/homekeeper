"use client";

import {
  PiSun,
  PiCloud,
  PiCloudRain,
  PiCloudSnow,
  PiCloudLightning,
} from "react-icons/pi";
import type { WeatherData } from "@/app/__backend/vacation.types";

function WeatherIcon({ code }: { code: number }) {
  const cls = "text-2xl";
  if (code <= 3) return <PiSun className={cls} />;
  if (code <= 48) return <PiCloud className={cls} />;
  if (code <= 67) return <PiCloudRain className={cls} />;
  if (code <= 77) return <PiCloudSnow className={cls} />;
  if (code <= 82) return <PiCloudRain className={cls} />;
  if (code <= 86) return <PiCloudSnow className={cls} />;  // 85-86: snow showers
  return <PiCloudLightning className={cls} />;
}

export default function WeatherWidget({ weather }: { weather: WeatherData }) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
      <WeatherIcon code={weather.weatherCode} />
      <div className="text-right">
        <p className="font-bold text-lg leading-none">{weather.temperatureCelsius}°C</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{weather.weatherDescription}</p>
      </div>
    </div>
  );
}
