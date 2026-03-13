import { getDays } from "@/app/__backend/VacationService";
import ProgramsView from "./ProgramsView";
import Link from "next/link";
import { PiArrowLeft } from "react-icons/pi";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const days = await getDays();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-4 shrink-0">
        <Link href="/vacation" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <PiArrowLeft className="text-xl" />
        </Link>
        <h1 className="font-bold text-lg">Napi programok</h1>
      </div>
      <ProgramsView initialDays={days} />
    </div>
  );
}
