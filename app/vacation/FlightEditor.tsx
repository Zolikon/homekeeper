"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { upsertFlight } from "@/app/__backend/VacationService";
import type { VacationFlight } from "@/app/__backend/vacation.types";
import { PiPencil, PiSuitcase } from "react-icons/pi";

type Props = {
  flight: VacationFlight | null;
  flightId: string;
  directionLabel: string;
};

type FormValues = Omit<VacationFlight, "id">;

export default function FlightEditor({ flight, flightId, directionLabel }: Props) {
  const [editing, setEditing] = useState(!flight); // auto-open if no flight yet
  const router = useRouter();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      flightNumber: flight?.flightNumber ?? "",
      airline: flight?.airline ?? "",
      departureTime: flight?.departureTime ?? "",
      departureTerminal: flight?.departureTerminal ?? "",
      arrivalTime: flight?.arrivalTime ?? "",
      arrivalTerminal: flight?.arrivalTerminal ?? "",
      baggageInfo: flight?.baggageInfo ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await upsertFlight({ id: flightId, ...values });
    router.refresh();
    setEditing(false);
  };

  if (editing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <h2 className="text-lg font-bold">{directionLabel} – Adatok</h2>

        <FlightField label="Járatszám" {...register("flightNumber")} placeholder="pl. BA2759" />
        <FlightField label="Légitársaság" {...register("airline")} placeholder="pl. British Airways" />

        <div className="border-t dark:border-gray-700 pt-3">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Indulás</p>
          <FlightField label="Időpont (ÉÉÉÉ-HH-NN ÓÓ:PP)" {...register("departureTime", { required: true })} placeholder="2026-08-01 07:30" />
          {/* Terminal is optional — budget airlines assign terminals close to departure */}
          <FlightField label="Terminál (opcionális)" {...register("departureTerminal")} placeholder="pl. T2" className="mt-3" />
        </div>

        <div className="border-t dark:border-gray-700 pt-3">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Érkezés</p>
          <FlightField label="Időpont (ÉÉÉÉ-HH-NN ÓÓ:PP)" {...register("arrivalTime", { required: true })} placeholder="2026-08-01 10:00" />
          <FlightField label="Terminál (opcionális)" {...register("arrivalTerminal")} placeholder="pl. T5" className="mt-3" />
        </div>

        <div className="border-t dark:border-gray-700 pt-3">
          <FlightField label="Poggyászinformáció (opcionális)" {...register("baggageInfo")} placeholder="pl. 1 kabincsomag + 1 feladott 23kg" />
        </div>

        <div className="flex gap-3 pt-2">
          {flight && (
            <button type="button" onClick={() => setEditing(false)} className="flex-1 border rounded-lg py-3 font-semibold dark:border-gray-600">
              Mégse
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-theme_primary text-white rounded-lg py-3 font-semibold disabled:opacity-50">
            {isSubmitting ? "Mentés..." : "Mentés"}
          </button>
        </div>
      </form>
    );
  }

  // Read-only display — flight is null briefly between setEditing(false) and router.refresh() completing
  if (!flight) return null;

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{directionLabel}</h2>
        <button onClick={() => setEditing(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <PiPencil className="text-xl text-theme_primary" />
        </button>
      </div>

      {(flight!.flightNumber || flight!.airline) && (
        <InfoRow label="Járat" value={[flight!.airline, flight!.flightNumber].filter((s): s is string => Boolean(s)).join(" · ")} />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Indulás</p>
        <p className="font-semibold text-lg">{formatDateTime(flight!.departureTime)}</p>
        {flight!.departureTerminal && (
          <p className="text-sm text-gray-500">Terminál: <span className="font-medium text-gray-900 dark:text-white">{flight!.departureTerminal}</span></p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Érkezés</p>
        <p className="font-semibold text-lg">{formatDateTime(flight!.arrivalTime)}</p>
        {flight!.arrivalTerminal && (
          <p className="text-sm text-gray-500">Terminál: <span className="font-medium text-gray-900 dark:text-white">{flight!.arrivalTerminal}</span></p>
        )}
      </div>

      {flight!.baggageInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-3">
          <PiSuitcase className="text-xl text-theme_primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Poggyász</p>
            <p className="text-sm">{flight!.baggageInfo}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-gray-500">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// Spread props before className so react-hook-form ref is not shadowed
function FlightField({ label, className, ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label className="text-sm font-medium">{label}</label>
      <input {...props} className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
    </div>
  );
}

function formatDateTime(dt: string): string {
  try {
    const [datePart, timePart] = dt.split(" ");
    const date = new Date(datePart + "T" + timePart);
    return date.toLocaleString("hu-HU", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dt;
  }
}
