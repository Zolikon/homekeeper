"use client";

import { useForm } from "react-hook-form";
import { PiX } from "react-icons/pi";

type Props = {
  existingDates: string[];
  onAdd: (date: string) => Promise<void>;
  onClose: () => void;
};

export default function DayModal({ existingDates, onAdd, onClose }: Props) {
  const { register, handleSubmit, setError, formState: { isSubmitting, errors } } = useForm<{ date: string }>();

  const onSubmit = async ({ date }: { date: string }) => {
    if (existingDates.includes(date)) {
      setError("date", { message: "Ez a dátum már hozzá van adva" });
      return;
    }
    await onAdd(date);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white dark:bg-gray-900 w-full md:max-w-sm rounded-t-2xl md:rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Nap hozzáadása</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <PiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Dátum</label>
            <input
              type="date"
              {...register("date", { required: "Kötelező" })}
              className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
            />
            {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-3 font-semibold dark:border-gray-600">
              Mégse
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-theme_primary text-white rounded-lg py-3 font-semibold disabled:opacity-50">
              {isSubmitting ? "Hozzáadás..." : "Hozzáadás"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
