"use client";

import {
  PiSun,
  PiCloud,
  PiCloudRain,
  PiCloudSnow,
  PiCloudLightning,
} from "react-icons/pi";
import type { WeatherData } from "@/app/__backend/vacation.types";

const DAY_LABELS = ["Ma", "Holnap", "Holnapután"];

function WeatherIcon({ code }: { code: number }) {
  const cls = "text-xl";
  if (code <= 3)  return <PiSun className={cls} />;
  if (code <= 48) return <PiCloud className={cls} />;
  if (code <= 67) return <PiCloudRain className={cls} />;
  if (code <= 77) return <PiCloudSnow className={cls} />;
  if (code <= 82) return <PiCloudRain className={cls} />;
  if (code <= 86) return <PiCloudSnow className={cls} />;
  return <PiCloudLightning className={cls} />;
}

export default function WeatherWidget({ weather }: { weather: WeatherData }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {weather.map((day, i) => (
        <div
          key={day.date}
          className="flex flex-col items-center gap-1 bg-white dark:bg-gray-800 rounded-xl px-2 py-2 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{DAY_LABELS[i]}</p>
          <WeatherIcon code={day.weatherCode} />
          <p className="text-sm font-bold leading-none">{day.tempMax}°</p>
          <p className="text-xs text-gray-400 leading-none">{day.tempMin}°</p>
        </div>
      ))}
    </div>
  );
}
