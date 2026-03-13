"use server";

import type { WeatherData } from "./vacation.types";
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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`;
    const res = await fetch(url, { next: { revalidate: 900 } }); // cache 15 min
    if (!res.ok) return null;

    const json = await res.json();
    const current = json?.current;
    if (!current) return null;

    const weatherCode: number = current.weather_code ?? 0;
    return {
      temperatureCelsius: Math.round(current.temperature_2m),
      weatherCode,
      weatherDescription: WMO_DESCRIPTIONS[weatherCode] ?? "Ismeretlen",
      windSpeedKmh: Math.round(current.wind_speed_10m),
    };
  } catch {
    return null;
  }
}
