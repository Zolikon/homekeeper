"use client";

import { useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { addProgram, updateProgram } from "@/app/__backend/VacationService";
import type { VacationProgram } from "@/app/__backend/vacation.types";
import { PiX } from "react-icons/pi";

type Props = {
  dayId: string;
  program: VacationProgram | null;
  onSaved: (program: VacationProgram) => void;
  onClose: () => void;
  initialStartTime?: string;
};

type FormValues = {
  name: string;
  startTime: string;
  endTime: string;
  address: string;
  notes: string;
};

const PRESET_MINS = [0, 15, 30, 45];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function TimeInput({
  value,
  onChange,
  defaultHour = 8,
}: {
  value: string;
  onChange: (v: string) => void;
  defaultHour?: number;
}) {
  const parsedMin = value ? parseInt(value.split(":")[1] ?? "0", 10) : 0;
  const isNonStandard = value !== "" && !PRESET_MINS.includes(parsedMin);
  const [showCustom, setShowCustom] = useState(() => isNonStandard);

  const currentHour = value ? value.split(":")[0] : String(defaultHour).padStart(2, "0");
  const currentMinStr = value ? value.split(":")[1] : "00";

  const minuteOptions = [...MINUTES];
  if (isNonStandard && currentMinStr && !minuteOptions.includes(currentMinStr)) {
    minuteOptions.push(currentMinStr);
    minuteOptions.sort();
  }

  function handleHourChange(h: string) {
    const m = currentMinStr ?? "00";
    onChange(`${h}:${m}`);
    setShowCustom(false);
  }

  function handleMinuteChange(m: string) {
    onChange(`${currentHour}:${m}`);
    setShowCustom(false);
  }

  function handleNativeChange(v: string) {
    onChange(v);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <select
          value={currentHour}
          onChange={e => handleHourChange(e.target.value)}
          className="border rounded-lg px-2 py-2 dark:bg-gray-800 dark:border-gray-600 flex-1 text-center"
        >
          {HOURS.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span className="font-bold text-lg">:</span>
        <select
          value={currentMinStr ?? "00"}
          onChange={e => handleMinuteChange(e.target.value)}
          className="border rounded-lg px-2 py-2 dark:bg-gray-800 dark:border-gray-600 flex-1 text-center"
        >
          {minuteOptions.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => setShowCustom(prev => !prev)}
        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-left"
      >
        Egyéni időpont {showCustom ? "▾" : "▸"}
      </button>
      {showCustom && (
        <input
          type="time"
          value={value}
          onChange={e => handleNativeChange(e.target.value)}
          className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
        />
      )}
    </div>
  );
}

function addMinutes(base: string, mins: number): string {
  const [h, m] = base.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const DURATIONS = [
  { label: "+30p", mins: 30 },
  { label: "+1ó", mins: 60 },
  { label: "+1ó 30p", mins: 90 },
  { label: "+2ó", mins: 120 },
];

export default function ProgramModal({ dayId, program, onSaved, onClose, initialStartTime }: Props) {
  const [sameAsName, setSameAsName] = useState(false);
  const [showCustomEnd, setShowCustomEnd] = useState(() => !!program?.endTime);

  const { register, handleSubmit, control, setValue, formState: { isSubmitting, errors } } = useForm<FormValues>({
    defaultValues: {
      name: program?.name ?? "",
      startTime: program?.startTime ?? initialStartTime ?? "08:00",
      endTime: program?.endTime ?? "",
      address: program?.address ?? "",
      notes: program?.notes ?? "",
    },
  });

  const watchedName = useWatch({ control, name: "name" });
  const watchedStartTime = useWatch({ control, name: "startTime" });
  const watchedEndTime = useWatch({ control, name: "endTime" });

  const onSubmit = async (values: FormValues) => {
    const address = sameAsName ? values.name : (values.address || undefined);
    if (program) {
      const updated: VacationProgram = {
        ...program,
        name: values.name,
        startTime: values.startTime,
        endTime: values.endTime || undefined,
        address,
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
        address,
        notes: values.notes || undefined,
      };
      const realId = await addProgram(newProg);
      onSaved({ id: realId, ...newProg });
    }
    onClose();
  };

  const activeDurationMins =
    watchedStartTime && watchedEndTime
      ? DURATIONS.find(d => addMinutes(watchedStartTime, d.mins) === watchedEndTime)?.mins ?? null
      : null;

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

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Kezdés *</label>
            <Controller
              control={control}
              name="startTime"
              rules={{ required: "Kötelező" }}
              render={({ field }) => <TimeInput value={field.value} onChange={field.onChange} />}
            />
            {errors.startTime && <span className="text-red-500 text-xs">{errors.startTime.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Vége</label>
            {!watchedStartTime ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                Adj meg kezdési időt a befejezés beállításához
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {DURATIONS.map(d => {
                    const isActive = activeDurationMins === d.mins;
                    return (
                      <button
                        key={d.mins}
                        type="button"
                        onClick={() => {
                          setValue("endTime", addMinutes(watchedStartTime, d.mins));
                          setShowCustomEnd(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          isActive
                            ? "bg-theme_primary text-white border-theme_primary"
                            : "border-gray-300 dark:border-gray-600 hover:border-theme_primary hover:text-theme_primary"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setShowCustomEnd(prev => !prev)}
                    className={`px-2.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      showCustomEnd
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-400"
                        : "border-gray-300 dark:border-gray-600 hover:border-theme_primary hover:text-theme_primary"
                    }`}
                  >
                    Pontos idő {showCustomEnd ? "▾" : "→"}
                  </button>
                  {watchedEndTime && (
                    <button
                      type="button"
                      onClick={() => {
                        setValue("endTime", "");
                        setShowCustomEnd(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-400 hover:text-red-500 hover:border-red-400 transition-colors"
                      title="Törlés"
                    >
                      ×
                    </button>
                  )}
                </div>
                {showCustomEnd && (
                  <Controller
                    control={control}
                    name="endTime"
                    render={({ field }) => <TimeInput value={field.value} onChange={field.onChange} />}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Cím</label>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsName}
                  onChange={e => setSameAsName(e.target.checked)}
                  className="rounded"
                />
                Ugyanaz, mint a neve
              </label>
            </div>
            {sameAsName ? (
              <input
                key="address-same"
                value={watchedName ?? ""}
                disabled
                onChange={() => {}}
                className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600 opacity-60 bg-gray-50"
              />
            ) : (
              <input
                key="address-manual"
                {...register("address")}
                className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                placeholder="pl. Buckingham Palace, London SW1A 1AA"
              />
            )}
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
