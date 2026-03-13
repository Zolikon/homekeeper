import { getFlight } from "@/app/__backend/VacationService";
import { VACATION_FLIGHT_BACK_ID } from "@/app/__backend/vacation.types";
import FlightView from "./FlightView";
import Link from "next/link";
import { PiArrowLeft } from "react-icons/pi";

export const dynamic = "force-dynamic";

export default async function FlightBackPage() {
  const flight = await getFlight(VACATION_FLIGHT_BACK_ID);
  return (
    <div>
      <div className="flex items-center gap-2 p-4">
        <Link href="/vacation" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <PiArrowLeft className="text-xl" />
        </Link>
        <h1 className="font-bold text-lg">Vissza repülés</h1>
      </div>
      <FlightView flight={flight} />
    </div>
  );
}
