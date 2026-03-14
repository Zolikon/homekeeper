import { getDays, getVacationInfo, getFlight } from "@/app/__backend/VacationService";
import { VACATION_FLIGHT_OUT_ID, VACATION_FLIGHT_BACK_ID } from "@/app/__backend/vacation.types";
import ProgramsView from "./ProgramsView";
import Link from "next/link";
import { PiArrowLeft } from "react-icons/pi";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const [days, info, outboundFlight, returnFlight] = await Promise.all([
    getDays(),
    getVacationInfo(),
    getFlight(VACATION_FLIGHT_OUT_ID),
    getFlight(VACATION_FLIGHT_BACK_ID),
  ]);

  if (!info) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-4 shrink-0">
        <Link href="/vacation" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <PiArrowLeft className="text-xl" />
        </Link>
        <h1 className="font-bold text-lg">Napi programok</h1>
      </div>
      <ProgramsView
        initialDays={days}
        startDate={info.startDate}
        endDate={info.endDate}
        outboundFlight={outboundFlight}
        returnFlight={returnFlight}
      />
    </div>
  );
}
