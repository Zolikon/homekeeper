"use client";

import { useState, useEffect } from "react";
import { getProgramsForDay } from "@/app/__backend/VacationService";
import type { VacationDay, VacationProgram } from "@/app/__backend/vacation.types";
import DayTimeline from "./DayTimeline";

type Props = {
  initialDays: VacationDay[];
};

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDayLabel(date: string): string {
  try {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("hu-HU", { month: "short", day: "numeric", weekday: "short" });
  } catch {
    return date;
  }
}

export default function ProgramsView({ initialDays }: Props) {
  const days = initialDays;
  const [selectedDayId, setSelectedDayId] = useState<string | null>(() => {
    const today = getTodayDate();
    const todayDay = initialDays.find((d) => d.date === today);
    return todayDay?.id ?? initialDays[0]?.id ?? null;
  });
  const [programs, setPrograms] = useState<VacationProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  useEffect(() => {
    if (!selectedDayId) return;
    setLoadingPrograms(true);
    getProgramsForDay(selectedDayId).then((progs) => {
      setPrograms(progs);
      setLoadingPrograms(false);
    }).catch((err) => {
      console.error("Failed to load programs:", err);
      setLoadingPrograms(false);
    });
  }, [selectedDayId]);

  const today = getTodayDate();
  const selectedDay = days.find((d) => d.id === selectedDayId);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day selector tabs */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto shrink-0 scrollbar-hide">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => setSelectedDayId(day.id)}
            className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedDayId === day.id
                ? "bg-theme_primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            } ${day.date === today ? "ring-2 ring-theme_primary ring-offset-1" : ""}`}
          >
            {formatDayLabel(day.date)}
          </button>
        ))}
      </div>

      {/* Selected day date */}
      {selectedDay && (
        <p className="text-sm text-gray-500 px-4 pb-2 shrink-0">
          {selectedDay.date === today && (
            <span className="text-theme_primary font-semibold">● Ma · </span>
          )}
          {selectedDay.date}
        </p>
      )}

      {/* Timeline */}
      {selectedDayId && !loadingPrograms ? (
        <DayTimeline
          dayId={selectedDayId}
          programs={programs}
          isToday={selectedDay?.date === today}
          onProgramsChange={setPrograms}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          {days.length === 0 ? "Nincsenek napok." : "Betöltés..."}
        </div>
      )}

    </div>
  );
}
