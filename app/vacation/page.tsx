// app/vacation/page.tsx
import { getVacationInfo } from "@/app/__backend/VacationService";
import { getWeather } from "@/app/__backend/WeatherService";
import VacationMain from "./VacationMain";
import CreateVacationForm from "./CreateVacationForm";

export const dynamic = "force-dynamic";

export default async function VacationPage() {
  const info = await getVacationInfo();

  if (!info) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Még nincs nyaralás rögzítve.
        </p>
        <CreateVacationForm />
      </div>
    );
  }

  // Use stored coordinates to avoid geocoding on every page load (force-dynamic bypasses fetch cache)
  const weather =
    info.weatherLat != null && info.weatherLon != null
      ? await getWeather(info.weatherLat, info.weatherLon)
      : null;

  return <VacationMain info={info} weather={weather} />;
}
