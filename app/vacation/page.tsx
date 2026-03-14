// app/vacation/page.tsx
import { getVacationInfo, getFlight } from "@/app/__backend/VacationService";
import { VACATION_FLIGHT_OUT_ID, VACATION_FLIGHT_BACK_ID } from "@/app/__backend/vacation.types";
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
  const [weather, outboundFlight, returnFlight] = await Promise.all([
    info.weatherLat != null && info.weatherLon != null
      ? getWeather(info.weatherLat, info.weatherLon)
      : null,
    getFlight(VACATION_FLIGHT_OUT_ID),
    getFlight(VACATION_FLIGHT_BACK_ID),
  ]);

  return <VacationMain info={info} weather={weather} outboundFlight={outboundFlight} returnFlight={returnFlight} />;
}
