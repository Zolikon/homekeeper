"use client";

import { useState, useEffect } from "react";
import { deleteProgram } from "@/app/__backend/VacationService";
import type { VacationProgram } from "@/app/__backend/vacation.types";
import ProgramModal from "./ProgramModal";
import { PiMapPin, PiPlus, PiPencil, PiTrash } from "react-icons/pi";

type Props = {
  dayId: string;
  programs: VacationProgram[];
  isToday: boolean;
  onProgramsChange: (programs: VacationProgram[]) => void;
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export default function DayTimeline({ dayId, programs, isToday, onProgramsChange }: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<VacationProgram | null>(null);
  const [currentMinutes, setCurrentMinutes] = useState(nowMinutes());

  useEffect(() => {
    if (!isToday) return;
    const interval = setInterval(() => setCurrentMinutes(nowMinutes()), 60_000);
    return () => clearInterval(interval);
  }, [isToday]);

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törlöd ezt a programot?")) return;
    await deleteProgram(id);
    onProgramsChange(programs.filter((p) => p.id !== id));
  };

  const handleSaved = (updated: VacationProgram) => {
    const exists = programs.find((p) => p.id === updated.id);
    if (exists) {
      onProgramsChange(programs.map((p) => (p.id === updated.id ? updated : p)).sort((a, b) => a.startTime.localeCompare(b.startTime)));
    } else {
      onProgramsChange([...programs, updated].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 relative">
      {programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
          Még nincs program ezen a napon.
        </div>
      ) : (
        <div className="relative ml-4">
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {programs.map((program) => {
            const startMin = timeToMinutes(program.startTime);
            const endMin = program.endTime ? timeToMinutes(program.endTime) : null;
            const isActive = isToday && currentMinutes >= startMin && (endMin === null || currentMinutes < endMin);
            const isPast = isToday && (endMin !== null ? currentMinutes >= endMin : currentMinutes >= startMin + 60);

            return (
              <div key={program.id} className="relative pl-6 pb-6">
                {/* Timeline dot */}
                <div className={`absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full border-2 ${
                  isActive ? "bg-theme_primary border-theme_primary scale-125" : isPast ? "bg-gray-300 dark:bg-gray-600 border-gray-300" : "bg-white dark:bg-gray-900 border-theme_primary"
                }`} />

                {/* Program card */}
                <div className={`rounded-2xl p-3 border transition-all ${
                  isActive
                    ? "bg-theme_primary/10 border-theme_primary dark:bg-theme_primary/20"
                    : isPast
                    ? "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-60"
                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{program.name}</p>
                        {isActive && (
                          <span className="text-xs bg-theme_primary text-white rounded-full px-2 py-0.5 font-semibold shrink-0">
                            Most
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {program.startTime}{program.endTime ? ` – ${program.endTime}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setEditingProgram(program)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <PiPencil className="text-sm text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete(program.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950">
                        <PiTrash className="text-sm text-red-500" />
                      </button>
                    </div>
                  </div>

                  {program.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(program.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-theme_primary mt-2"
                    >
                      <PiMapPin className="shrink-0" />
                      <span className="underline truncate">{program.address}</span>
                    </a>
                  )}

                  {program.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 border-t dark:border-gray-700 pt-1.5">
                      {program.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Current-time "Most" badge is shown INSIDE the active card (see isActive styling above),
              not as a floating positioned indicator, because card heights vary and percentage-of-height
              positioning does not correspond to percentage-of-time on a variable-height list. */}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-14 right-4 size-14 rounded-full bg-theme_primary text-white shadow-lg flex items-center justify-center"
      >
        <PiPlus className="text-2xl" />
      </button>

      {addModalOpen && (
        <ProgramModal dayId={dayId} program={null} onSaved={handleSaved} onClose={() => setAddModalOpen(false)} />
      )}
      {editingProgram && (
        <ProgramModal dayId={dayId} program={editingProgram} onSaved={handleSaved} onClose={() => setEditingProgram(null)} />
      )}
    </div>
  );
}
