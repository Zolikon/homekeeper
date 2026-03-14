"use client";

import { useForm } from "react-hook-form";
import { addProgram, updateProgram } from "@/app/__backend/VacationService";
import type { VacationProgram } from "@/app/__backend/vacation.types";
import { PiX } from "react-icons/pi";

type Props = {
  dayId: string;
  program: VacationProgram | null;
  onSaved: (program: VacationProgram) => void;
  onClose: () => void;
};

type FormValues = {
  name: string;
  startTime: string;
  endTime: string;
  address: string;
  notes: string;
};

export default function ProgramModal({ dayId, program, onSaved, onClose }: Props) {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormValues>({
    defaultValues: {
      name: program?.name ?? "",
      startTime: program?.startTime ?? "",
      endTime: program?.endTime ?? "",
      address: program?.address ?? "",
      notes: program?.notes ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (program) {
      const updated: VacationProgram = {
        ...program,
        name: values.name,
        startTime: values.startTime,
        endTime: values.endTime || undefined,
        address: values.address || undefined,
        notes: values.notes || undefined,
      };
      await updateProgram(updated);
      onSaved(updated);
    } else {
      const newProg: Omit<VacationProgram, "id"> = {
        dayId,
        name: values.name,
        startTime: values.startTime,
        endTime: values.endTime || undefined,
        address: values.address || undefined,
        notes: values.notes || undefined,
      };
      const realId = await addProgram(newProg);
      onSaved({ id: realId, ...newProg });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white dark:bg-gray-900 w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{program ? "Program szerkesztése" : "Új program"}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <PiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Program neve *</label>
            <input
              {...register("name", { required: "Kötelező" })}
              className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
              placeholder="pl. Buckingham-palota"
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Kezdés *</label>
              <input
                type="time"
                {...register("startTime", { required: "Kötelező" })}
                className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
              />
              {errors.startTime && <span className="text-red-500 text-xs">{errors.startTime.message}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Vége</label>
              <input
                type="time"
                {...register("endTime")}
                className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Cím</label>
            <input
              {...register("address")}
              className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
              placeholder="pl. Buckingham Palace, London SW1A 1AA"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Megjegyzés</label>
            <textarea
              {...register("notes")}
              rows={3}
              className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600 resize-none"
              placeholder="Belépőjegy előre megvéve, stb."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-3 font-semibold dark:border-gray-600">
              Mégse
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-theme_primary text-white rounded-lg py-3 font-semibold disabled:opacity-50">
              {isSubmitting ? "Mentés..." : "Mentés"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
