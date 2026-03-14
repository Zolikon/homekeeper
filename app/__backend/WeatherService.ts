"use server";

import type { WeatherData, WeatherDay } from "./vacation.types";
import { updateVacationInfo } from "./VacationService";

// https://open-meteo.com/en/docs/geocoding-api
async function geocode(city: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  const result = json?.results?.[0];
  if (!result) return null;
  return { lat: result.latitude, lon: result.longitude };
}

/** Call after createVacation or when city changes to persist coordinates. */
export async function geocodeAndStore(city: string): Promise<void> {
  const coords = await geocode(city);
  if (!coords) return;
  await updateVacationInfo({ weatherLat: coords.lat, weatherLon: coords.lon });
}

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Tiszta ég",
  1: "Főleg napos",
  2: "Részben felhős",
  3: "Borult",
  45: "Köd",
  48: "Zúzmarás köd",
  51: "Enyhe szitálás",
  53: "Mérsékelt szitálás",
  55: "Erős szitálás",
  61: "Enyhe eső",
  63: "Mérsékelt eső",
  65: "Erős eső",
  71: "Enyhe havazás",
  73: "Mérsékelt havazás",
  75: "Erős havazás",
  80: "Enyhe zápor",
  81: "Mérsékelt zápor",
  82: "Erős zápor",
  85: "Gyenge hózápor",
  86: "Erős hózápor",
  95: "Zivatar",
  96: "Zivatar jégesővel",
  99: "Erős zivatar jégesővel",
};

/**
 * Fetch current weather using pre-stored coordinates.
 * Pass lat/lon from VacationInfo to avoid re-geocoding on every page load.
 */
export async function getWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=3&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 900 } }); // cache 15 min
    if (!res.ok) return null;

    const json = await res.json();
    const current = json?.current;
    const daily = json?.daily;
    if (!current || !daily?.time?.length) return null;

    const currentCode: number = current.weather_code ?? 0;
    return {
      current: {
        temperatureCelsius: Math.round(current.temperature_2m),
        weatherCode: currentCode,
        weatherDescription: WMO_DESCRIPTIONS[currentCode] ?? "Ismeretlen",
      },
      days: (daily.time as string[]).map((date, i): WeatherDay => {
        const code: number = daily.weather_code[i] ?? 0;
        return {
          date,
          tempMax: Math.round(daily.temperature_2m_max[i]),
          tempMin: Math.round(daily.temperature_2m_min[i]),
          weatherCode: code,
          weatherDescription: WMO_DESCRIPTIONS[code] ?? "Ismeretlen",
        };
      }),
    };
  } catch {
    return null;
  }
}
