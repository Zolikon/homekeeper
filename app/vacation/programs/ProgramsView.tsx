"use client";

import { useState, useEffect } from "react";
import { getProgramsForDay, addDay, deleteDay } from "@/app/__backend/VacationService";
import type { VacationDay, VacationProgram } from "@/app/__backend/vacation.types";
import DayTimeline from "./DayTimeline";
import DayModal from "./DayModal";
import { PiPlus, PiTrash } from "react-icons/pi";

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
  const [days, setDays] = useState<VacationDay[]>(initialDays);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(() => {
    const today = getTodayDate();
    const todayDay = initialDays.find((d) => d.date === today);
    return todayDay?.id ?? initialDays[0]?.id ?? null;
  });
  const [programs, setPrograms] = useState<VacationProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [addDayOpen, setAddDayOpen] = useState(false);

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

  const handleAddDay = async (date: string) => {
    // addDay returns the real server-assigned UUID so the optimistic state uses the correct ID
    const realId = await addDay(date);
    const maxOrder = days.length === 0 ? -1 : Math.max(...days.map((d) => d.order));
    const newDay: VacationDay = { id: realId, date, order: maxOrder + 1 };
    setDays([...days, newDay].sort((a, b) => a.order - b.order));
    setSelectedDayId(realId);
    setAddDayOpen(false);
  };

  const handleDeleteDay = async () => {
    if (!selectedDayId) return;
    if (!confirm("Biztosan törlöd ezt a napot az összes programjával együtt?")) return;
    await deleteDay(selectedDayId);
    const remaining = days.filter((d) => d.id !== selectedDayId);
    setDays(remaining);
    setSelectedDayId(remaining[0]?.id ?? null);
    setPrograms([]);
    if (remaining.length === 0) setLoadingPrograms(false);
  };

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
        <button
          onClick={() => setAddDayOpen(true)}
          className="shrink-0 px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-theme_primary flex items-center gap-1"
        >
          <PiPlus /> Nap
        </button>
      </div>

      {/* Day controls */}
      {selectedDay && (
        <div className="flex items-center justify-between px-4 pb-2 shrink-0">
          <p className="text-sm text-gray-500">
            {selectedDay.date === today && (
              <span className="text-theme_primary font-semibold">● Ma · </span>
            )}
            {selectedDay.date}
          </p>
          <button
            onClick={handleDeleteDay}
            className="text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950"
          >
            <PiTrash />
          </button>
        </div>
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
          {days.length === 0 ? "Még nincs nap hozzáadva." : "Betöltés..."}
        </div>
      )}

      {addDayOpen && (
        <DayModal
          existingDates={days.map((d) => d.date)}
          onAdd={handleAddDay}
          onClose={() => setAddDayOpen(false)}
        />
      )}
    </div>
  );
}
