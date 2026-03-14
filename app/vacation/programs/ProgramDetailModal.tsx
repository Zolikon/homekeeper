"use client";

import { PiX, PiPencil, PiMapPin } from "react-icons/pi";
import type { VacationProgram } from "@/app/__backend/vacation.types";

type Props = {
  program: VacationProgram;
  onClose: () => void;
  onEdit: () => void;
};

export default function ProgramDetailModal({ program, onClose, onEdit }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white dark:bg-gray-900 w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold leading-tight pr-2">{program.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0">
            <PiX className="text-xl" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {program.startTime}{program.endTime ? ` – ${program.endTime}` : ""}
          </p>

          {program.address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(program.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-theme_primary"
            >
              <PiMapPin className="shrink-0" />
              <span className="underline">{program.address}</span>
            </a>
          )}

          {program.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{program.notes}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border rounded-lg py-3 font-semibold dark:border-gray-600">
            Bezárás
          </button>
          <button
            onClick={onEdit}
            className="flex-1 bg-theme_primary text-white rounded-lg py-3 font-semibold flex items-center justify-center gap-2"
          >
            <PiPencil />
            Szerkesztés
          </button>
        </div>
      </div>
    </div>
  );
}
