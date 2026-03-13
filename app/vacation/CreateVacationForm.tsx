"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createVacation } from "@/app/__backend/VacationService";
import { geocodeAndStore } from "@/app/__backend/WeatherService";

type FormValues = {
  city: string;
  hotelName: string;
};

export default function CreateVacationForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    await createVacation(values.city, values.hotelName);
    // Geocode in background after creation so weather works on next page load
    await geocodeAndStore(values.city);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm flex flex-col gap-4">
      <h2 className="text-xl font-bold text-center">Új nyaralás</h2>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Város</label>
        <input
          {...register("city", { required: "Kötelező mező" })}
          placeholder="pl. London"
          className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
        />
        {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Szálloda neve</label>
        <input
          {...register("hotelName", { required: "Kötelező mező" })}
          placeholder="pl. Premier Inn"
          className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
        />
        {errors.hotelName && <span className="text-red-500 text-xs">{errors.hotelName.message}</span>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-theme_primary text-white rounded-lg py-3 font-semibold disabled:opacity-50"
      >
        {isSubmitting ? "Mentés..." : "Nyaralás létrehozása"}
      </button>
    </form>
  );
}
