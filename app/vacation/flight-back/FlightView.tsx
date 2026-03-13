"use client";

import FlightEditor from "@/app/vacation/FlightEditor";
import type { VacationFlight } from "@/app/__backend/vacation.types";
import { VACATION_FLIGHT_BACK_ID } from "@/app/__backend/vacation.types";

export default function FlightView({ flight }: { flight: VacationFlight | null }) {
  return <FlightEditor flight={flight} flightId={VACATION_FLIGHT_BACK_ID} directionLabel="Vissza repülés" />;
}
