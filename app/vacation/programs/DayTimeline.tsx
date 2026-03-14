"use client";

import { useState, useEffect, useRef } from "react";
import { deleteProgram } from "@/app/__backend/VacationService";
import type { VacationProgram } from "@/app/__backend/vacation.types";
import ProgramModal from "./ProgramModal";
import MenuHolder from "@/app/__components/MenuHolder";
import { PiMapPin, PiPlus, PiPencil, PiTrash, PiAirplaneTakeoff } from "react-icons/pi";
import Link from "next/link";

type FlightCard = {
  label: string;
  startTime: string;
  endTime?: string;
  flightNumber?: string;
  airline?: string;
  href: string;
};

type Props = {
  dayId: string;
  programs: VacationProgram[];
  isToday: boolean;
  onProgramsChange: (programs: VacationProgram[]) => void;
  flightCard?: FlightCard | null;
};

type TimelineItem =
  | { type: "program"; id: string; startTime: string; endTime?: string; data: VacationProgram }
  | { type: "flight";  id: string; startTime: string; endTime?: string; data: FlightCard };

type LaidOutItem = TimelineItem & { col: number; totalCols: number; endMin: number };

// Layout constants
const PX_PER_HOUR  = 72;
const PX_PER_MIN   = PX_PER_HOUR / 60;
const DEFAULT_START = 8 * 60;   // 8:00
const DEFAULT_END   = 22 * 60;  // 22:00
const MIN_DURATION  = 30;       // minutes for events with no endTime
const MIN_HEIGHT_PX = 28;
const LABEL_COL_W   = 44;       // px
const EVENT_GAP     = 6;        // px between side-by-side columns

function toMin(time: string): number {
  // Accept "HH:mm" or legacy "YYYY-MM-DD HH:mm"
  const t = time.length > 5 ? time.slice(-5) : time;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function assignColumns(items: TimelineItem[]): LaidOutItem[] {
  const withEnd: LaidOutItem[] = items.map(item => ({
    ...item,
    endMin: item.endTime ? toMin(item.endTime) : toMin(item.startTime) + MIN_DURATION,
    col: 0,
    totalCols: 1,
  }));

  withEnd.sort((a, b) => toMin(a.startTime) - toMin(b.startTime));

  // Greedy column assignment
  const colEnds: number[] = [];
  withEnd.forEach(item => {
    const startMin = toMin(item.startTime);
    let col = colEnds.findIndex(e => e <= startMin);
    if (col === -1) col = colEnds.length;
    colEnds[col] = item.endMin;
    item.col = col;
  });

  // totalCols = max col among all concurrent events + 1
  withEnd.forEach(item => {
    const startMin = toMin(item.startTime);
    const maxCol = withEnd
      .filter(o => toMin(o.startTime) < item.endMin && o.endMin > startMin)
      .reduce((mx, o) => Math.max(mx, o.col), 0);
    item.totalCols = maxCol + 1;
  });

  return withEnd;
}

export default function DayTimeline({ dayId, programs, isToday, onProgramsChange, flightCard }: Props) {
  const [addModalOpen, setAddModalOpen]     = useState(false);
  const [editingProgram, setEditingProgram] = useState<VacationProgram | null>(null);
  const [currentMinutes, setCurrentMinutes] = useState(nowMinutes());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isToday) return;
    const interval = setInterval(() => setCurrentMinutes(nowMinutes()), 60_000);
    return () => clearInterval(interval);
  }, [isToday]);

  const items: TimelineItem[] = [
    ...programs.map(p => ({
      type: "program" as const,
      id: p.id,
      startTime: p.startTime,
      endTime: p.endTime,
      data: p,
    })),
    ...(flightCard
      ? [{ type: "flight" as const, id: "__flight__", startTime: flightCard.startTime, endTime: flightCard.endTime, data: flightCard }]
      : []),
  ];

  // Extend beyond 8–22 only when an event falls outside that range
  const allMins = items.flatMap(item => {
    const s = toMin(item.startTime);
    const e = item.endTime ? toMin(item.endTime) : s + MIN_DURATION;
    return [s, e];
  });
  const rangeStart  = allMins.length > 0 ? Math.min(DEFAULT_START, ...allMins) : DEFAULT_START;
  const rangeEnd    = allMins.length > 0 ? Math.max(DEFAULT_END,   ...allMins) : DEFAULT_END;
  const startHour   = Math.floor(rangeStart / 60);
  const endHour     = Math.ceil(rangeEnd / 60);
  const totalHeight = (endHour - startHour) * PX_PER_HOUR;
  const hours       = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  const laidOut = assignColumns(items);

  // Scroll to current time once on mount for today
  useEffect(() => {
    if (!isToday || !scrollRef.current) return;
    const nowTop = (currentMinutes - startHour * 60) * PX_PER_MIN;
    const h = scrollRef.current.clientHeight;
    scrollRef.current.scrollTo({ top: Math.max(0, nowTop - h / 2), behavior: "smooth" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törlöd ezt a programot?")) return;
    await deleteProgram(id);
    onProgramsChange(programs.filter(p => p.id !== id));
  };

  const handleSaved = (updated: VacationProgram) => {
    const exists = programs.find(p => p.id === updated.id);
    if (exists) {
      onProgramsChange(programs.map(p => (p.id === updated.id ? updated : p)));
    } else {
      onProgramsChange([...programs, updated]);
    }
  };

  return (
    // min-h-0 is required so the flex-1 item can shrink below its content height,
    // allowing overflow-y-auto to create a scrollable region instead of expanding forever.
    <div className="flex-1 min-h-0 overflow-y-auto relative" ref={scrollRef}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
          Még nincs program ezen a napon.
        </div>
      ) : (
        // Flex row: [time labels | events]
        // Both columns share the same totalHeight so grid lines and labels align.
        <div className="flex pt-4 pb-20" style={{ minHeight: totalHeight }}>

          {/* Left column: hour labels */}
          <div className="relative shrink-0" style={{ width: LABEL_COL_W, height: totalHeight }}>
            {hours.map(h => (
              <div
                key={h}
                className="absolute right-0 text-right text-xs text-gray-400 font-medium select-none pr-2"
                style={{ top: (h - startHour) * PX_PER_HOUR, transform: "translateY(-50%)", lineHeight: 1 }}
              >
                {h}:00
              </div>
            ))}
          </div>

          {/* Right column: grid + events */}
          <div className="relative flex-1" style={{ height: totalHeight }}>
            {/* Grid lines */}
            {hours.map(h => (
              <div key={h}>
                <div
                  className="absolute left-0 right-2 border-t border-gray-200 dark:border-gray-700"
                  style={{ top: (h - startHour) * PX_PER_HOUR }}
                />
                {h < endHour && (
                  <div
                    className="absolute left-0 right-2 border-t border-dashed border-gray-100 dark:border-gray-800"
                    style={{ top: (h - startHour) * PX_PER_HOUR + PX_PER_HOUR / 2 }}
                  />
                )}
              </div>
            ))}

            {/* Current-time indicator */}
            {isToday && currentMinutes >= startHour * 60 && currentMinutes <= endHour * 60 && (
              <div
                className="absolute left-0 right-2 pointer-events-none z-10"
                style={{ top: (currentMinutes - startHour * 60) * PX_PER_MIN }}
              >
                <div className="h-0.5 bg-red-500 w-full" />
                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
              </div>
            )}

            {/* Event cards */}
            {laidOut.map(item => {
              const startMin  = toMin(item.startTime);
              const isActive  = isToday && currentMinutes >= startMin && currentMinutes < item.endMin;
              const isPast    = isToday && currentMinutes >= item.endMin;
              const openEnded = !item.endTime;
              const top       = (startMin - startHour * 60) * PX_PER_MIN;
              const height    = Math.max((item.endMin - startMin) * PX_PER_MIN, MIN_HEIGHT_PX);
              const colW      = 100 / item.totalCols;
              const left      = `calc(${item.col * colW}% + ${EVENT_GAP}px)`;
              const width     = `calc(${colW}% - ${EVENT_GAP + 8}px)`; // 8px right margin
              const tall      = height > 52;

              if (item.type === "program") {
                const program = item.data;
                return (
                  <div
                    key={item.id}
                    className={`absolute rounded-xl border overflow-hidden ${
                      isActive
                        ? "bg-theme_primary/10 border-theme_primary dark:bg-theme_primary/20"
                        : isPast
                        ? "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-50"
                        : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                    }`}
                    style={{
                      top, height, left, width,
                      borderBottomStyle: openEnded ? "dashed" : "solid",
                    }}
                  >
                    <div className="flex items-start h-full p-1.5 gap-1">
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-1 flex-wrap">
                          <p className="text-xs font-semibold leading-tight truncate">{program.name}</p>
                          {isActive && (
                            <span className="text-[10px] bg-theme_primary text-white rounded-full px-1.5 py-0.5 font-semibold shrink-0">
                              Most
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                          {program.startTime}{program.endTime ? ` – ${program.endTime}` : ""}
                        </p>
                        {tall && program.address && (
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(program.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-0.5 text-[10px] text-theme_primary mt-0.5"
                            onClick={e => e.stopPropagation()}
                          >
                            <PiMapPin className="shrink-0" />
                            <span className="underline truncate">{program.address}</span>
                          </a>
                        )}
                        {tall && program.notes && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight line-clamp-2">
                            {program.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          onClick={() => setEditingProgram(program)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <PiPencil className="text-xs text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(program.id)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <PiTrash className="text-xs text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const fc = item.data;
                return (
                  <Link
                    key="__flight__"
                    href={fc.href}
                    className={`absolute rounded-xl border overflow-hidden ${
                      isActive
                        ? "bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700"
                        : isPast
                        ? "bg-blue-50/50 border-blue-100 dark:border-blue-900 opacity-50"
                        : "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                    }`}
                    style={{ top, height, left, width }}
                  >
                    <div className="flex items-start h-full p-1.5 gap-1">
                      <PiAirplaneTakeoff className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 text-xs" />
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-semibold leading-tight truncate text-blue-700 dark:text-blue-300">
                            {fc.label}
                          </p>
                          {isActive && (
                            <span className="text-[10px] bg-blue-600 text-white rounded-full px-1.5 py-0.5 font-semibold shrink-0">
                              Most
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 leading-tight">
                          {fc.startTime}{fc.endTime ? ` – ${fc.endTime}` : ""}
                        </p>
                        {tall && (fc.airline || fc.flightNumber) && (
                          <p className="text-[10px] text-blue-500/60 leading-tight">
                            {[fc.airline, fc.flightNumber].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              }
            })}
          </div>
        </div>
      )}

      {/* FAB */}
      <MenuHolder>
        <button
          onClick={() => setAddModalOpen(true)}
          className="size-14 rounded-full bg-theme_primary text-white shadow-lg flex items-center justify-center"
        >
          <PiPlus className="text-2xl" />
        </button>
      </MenuHolder>

      {addModalOpen && (
        <ProgramModal dayId={dayId} program={null} onSaved={handleSaved} onClose={() => setAddModalOpen(false)} />
      )}
      {editingProgram && (
        <ProgramModal dayId={dayId} program={editingProgram} onSaved={handleSaved} onClose={() => setEditingProgram(null)} />
      )}
    </div>
  );
}
