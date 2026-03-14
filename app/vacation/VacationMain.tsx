"use client";

import Link from "next/link";
import { useState } from "react";
import { PiAirplaneTakeoff, PiAirplaneLanding, PiCalendar, PiBuildings, PiCalendarBlank, PiWarning } from "react-icons/pi";
import type { VacationInfo, VacationFlight, WeatherData } from "@/app/__backend/vacation.types";
import WeatherWidget, { WeatherIcon } from "./WeatherWidget";
import HotelEditModal from "./HotelEditModal";
import DeleteVacationButton from "./DeleteVacationButton";

type Props = {
  info: VacationInfo;
  weather: WeatherData | null;
  outboundFlight: VacationFlight | null;
  returnFlight: VacationFlight | null;
};

export default function VacationMain({ info, weather, outboundFlight, returnFlight }: Props) {
  const [hotelModalOpen, setHotelModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{info.city}</h1>
        {weather && (
          <div className="flex items-center gap-1.5 shrink-0">
            <WeatherIcon code={weather.current.weatherCode} />
            <span className="text-lg font-semibold">{weather.current.temperatureCelsius}°C</span>
          </div>
        )}
      </div>
      {weather && <WeatherWidget weather={weather} />}

      {/* Date range */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <PiCalendarBlank className="text-theme_primary shrink-0" />
        <span>{info.startDate} – {info.endDate}</span>
      </div>

      {/* Hotel card */}
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer active:opacity-80"
        onClick={() => setHotelModalOpen(true)}
      >
        <div className="flex items-center gap-3">
          <PiBuildings className="text-2xl text-theme_primary shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold truncate">{info.hotelName}</p>
            {info.hotelAddress && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(info.hotelAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-theme_primary underline truncate block"
              >
                {info.hotelAddress}
              </a>
            )}
          </div>
        </div>
        {info.hotelNotes && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 border-t dark:border-gray-700 pt-2">
            {info.hotelNotes}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2 text-right">Koppints a szerkesztéshez</p>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 gap-3">
        <NavCard href="/vacation/flight-out" icon={<PiAirplaneTakeoff />} label="Oda repülés" missing={!outboundFlight} />
        <NavCard href="/vacation/programs" icon={<PiCalendar />} label="Napi programok" />
        <NavCard href="/vacation/flight-back" icon={<PiAirplaneLanding />} label="Vissza repülés" missing={!returnFlight} />
      </div>

      {/* Delete section */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <DeleteVacationButton />
      </div>

      {hotelModalOpen && (
        <HotelEditModal info={info} onClose={() => setHotelModalOpen(false)} />
      )}
    </div>
  );
}

function NavCard({ href, icon, label, missing }: { href: string; icon: React.ReactNode; label: string; missing?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border active:opacity-80 ${
        missing ? "border-orange-300 dark:border-orange-700" : "border-gray-100 dark:border-gray-700"
      }`}
    >
      <span className="text-2xl text-theme_primary">{icon}</span>
      <span className="font-semibold">{label}</span>
      {missing && (
        <span className="ml-auto flex items-center gap-1 text-xs text-orange-500 font-medium">
          <PiWarning className="text-base" />
          Nincs beállítva
        </span>
      )}
      {!missing && <span className="ml-auto text-gray-400">›</span>}
    </Link>
  );
}
