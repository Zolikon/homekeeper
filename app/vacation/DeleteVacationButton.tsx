"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteVacation } from "@/app/__backend/VacationService";
import { PiTrash } from "react-icons/pi";

export default function DeleteVacationButton() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    setError(false);
    try {
      await deleteVacation();
      router.refresh();
    } catch {
      setDeleting(false);
      setError(true);
    }
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-2 text-red-500 text-sm font-medium py-2"
      >
        <PiTrash /> Nyaralás törlése
      </button>
    );
  }

  return (
    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex flex-col gap-3">
      <p className="font-bold text-red-700 dark:text-red-400">⚠️ Figyelem!</p>
      <p className="text-sm text-red-700 dark:text-red-300">
        Ez a művelet <strong>véglegesen törli</strong> a teljes nyaralást, beleértve az összes
        programot, napi tervet és repülési adatot. Ez a művelet nem visszafordítható!
      </p>
      {error && <p className="text-xs text-red-600 font-medium">Törlés sikertelen. Kérjük, próbáld újra.</p>}
      <div className="flex gap-3">
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 font-semibold"
        >
          Mégse
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 bg-red-600 text-white rounded-lg py-2 font-semibold disabled:opacity-50"
        >
          {deleting ? "Törlés..." : "Igen, töröld!"}
        </button>
      </div>
    </div>
  );
}
