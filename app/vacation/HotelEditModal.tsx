"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { updateVacationInfo } from "@/app/__backend/VacationService";
import { geocodeAndStore } from "@/app/__backend/WeatherService";
import type { VacationInfo } from "@/app/__backend/vacation.types";
import { PiX } from "react-icons/pi";

type Props = {
  info: VacationInfo;
  onClose: () => void;
};

type FormValues = {
  city: string;
  hotelName: string;
  hotelAddress: string;
  hotelNotes: string;
  startDate: string;
  endDate: string;
};

export default function HotelEditModal({ info, onClose }: Props) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      city: info.city,
      hotelName: info.hotelName,
      hotelAddress: info.hotelAddress ?? "",
      hotelNotes: info.hotelNotes ?? "",
      startDate: info.startDate,
      endDate: info.endDate,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await updateVacationInfo({
      city: values.city,
      hotelName: values.hotelName,
      hotelAddress: values.hotelAddress || undefined,
      hotelNotes: values.hotelNotes || undefined,
      startDate: values.startDate,
      endDate: values.endDate,
    });
    // Re-geocode if city changed so weather coordinates stay accurate
    if (values.city !== info.city) {
      await geocodeAndStore(values.city);
    }
    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white dark:bg-gray-900 w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Nyaralás szerkesztése</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <PiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Város" {...register("city", { required: true })} />
          <Field label="Szálloda neve" {...register("hotelName", { required: true })} />
          <Field label="Szálloda címe" {...register("hotelAddress")} placeholder="pl. 10 John Adam St, London" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kezdő dátum" type="date" {...register("startDate", { required: true })} />
            <Field label="Záró dátum" type="date" {...register("endDate", { required: true })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Megjegyzés</label>
            <textarea
              {...register("hotelNotes")}
              rows={3}
              className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-lg py-3 font-semibold dark:border-gray-600"
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-theme_primary text-white rounded-lg py-3 font-semibold disabled:opacity-50"
            >
              {isSubmitting ? "Mentés..." : "Mentés"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Simple labeled input helper — spread props BEFORE explicit attrs so react-hook-form refs are not overridden
function Field({ label, type = "text", placeholder, ...props }: { label: string; type?: string; placeholder?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        type={type}
        placeholder={placeholder}
        className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
      />
    </div>
  );
}
