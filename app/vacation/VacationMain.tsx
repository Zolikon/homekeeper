"use client";

import Link from "next/link";
import { useState } from "react";
import { PiAirplaneTakeoff, PiAirplaneLanding, PiCalendar, PiBuildings } from "react-icons/pi";
import type { VacationInfo, WeatherData } from "@/app/__backend/vacation.types";
import WeatherWidget from "./WeatherWidget";
import HotelEditModal from "./HotelEditModal";
import DeleteVacationButton from "./DeleteVacationButton";

type Props = {
  info: VacationInfo;
  weather: WeatherData | null;
};

export default function VacationMain({ info, weather }: Props) {
  const [hotelModalOpen, setHotelModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{info.city}</h1>
        {weather && <WeatherWidget weather={weather} />}
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
            {(info.hotelCheckIn || info.hotelCheckOut) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {info.hotelCheckIn && `Be: ${info.hotelCheckIn}`}
                {info.hotelCheckIn && info.hotelCheckOut && " · "}
                {info.hotelCheckOut && `Ki: ${info.hotelCheckOut}`}
              </p>
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
        <NavCard href="/vacation/flight-out" icon={<PiAirplaneTakeoff />} label="Oda repülés" />
        <NavCard href="/vacation/programs" icon={<PiCalendar />} label="Napi programok" />
        <NavCard href="/vacation/flight-back" icon={<PiAirplaneLanding />} label="Vissza repülés" />
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

function NavCard({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:opacity-80"
    >
      <span className="text-2xl text-theme_primary">{icon}</span>
      <span className="font-semibold">{label}</span>
      <span className="ml-auto text-gray-400">›</span>
    </Link>
  );
}
