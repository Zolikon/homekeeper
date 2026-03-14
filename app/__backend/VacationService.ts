"use server";

import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import config from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";
import {
  VacationInfo,
  VacationFlight,
  VacationDay,
  VacationProgram,
  VACATION_INFO_ID,
  VACATION_FLIGHT_OUT_ID,
  VACATION_FLIGHT_BACK_ID,
} from "./vacation.types";

// Intentional factory (not module-scope): VacationService needs four models,
// whereas other services bind to a single model at module scope.
function getClient() {
  return generateServerClientUsingCookies<Schema>({
    config,
    cookies,
  });
}

// ── VacationInfo ────────────────────────────────────────────────────

export async function getVacationInfo(): Promise<VacationInfo | null> {
  const client = getClient();
  const { data } = await client.models.VacationInfo.get({ id: VACATION_INFO_ID });
  if (!data) return null;
  return {
    id: data.id,
    city: data.city,
    hotelName: data.hotelName,
    hotelAddress: data.hotelAddress ?? undefined,
    hotelNotes: data.hotelNotes ?? undefined,
    startDate: data.startDate,
    endDate: data.endDate,
    weatherLat: data.weatherLat ?? undefined,
    weatherLon: data.weatherLon ?? undefined,
  };
}

function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export async function createVacation(city: string, hotelName: string, startDate: string, endDate: string): Promise<void> {
  const client = getClient();
  await client.models.VacationInfo.create({
    id: VACATION_INFO_ID,
    city,
    hotelName,
    startDate,
    endDate,
  });
  const { randomUUID } = await import("crypto");
  const dates = generateDateRange(startDate, endDate);
  for (let i = 0; i < dates.length; i++) {
    await client.models.VacationDay.create({ id: randomUUID(), date: dates[i], order: i });
  }
  revalidatePath("/vacation");
  revalidatePath("/vacation/programs");
}

export async function updateVacationInfo(info: Partial<VacationInfo>): Promise<void> {
  const client = getClient();
  await client.models.VacationInfo.update({
    id: VACATION_INFO_ID,
    ...info,
  });
  revalidatePath("/vacation");
}

export async function deleteVacation(): Promise<void> {
  const client = getClient();

  // Delete all programs
  const { data: programs } = await client.models.VacationProgram.list();
  for (const p of programs) {
    await client.models.VacationProgram.delete({ id: p.id });
  }

  // Delete all days
  const { data: days } = await client.models.VacationDay.list();
  for (const d of days) {
    await client.models.VacationDay.delete({ id: d.id });
  }

  // Delete both flights only if they exist (avoids swallowing real errors)
  const outbound = await client.models.VacationFlight.get({ id: VACATION_FLIGHT_OUT_ID });
  if (outbound.data) {
    await client.models.VacationFlight.delete({ id: VACATION_FLIGHT_OUT_ID });
  }
  const returnFlight = await client.models.VacationFlight.get({ id: VACATION_FLIGHT_BACK_ID });
  if (returnFlight.data) {
    await client.models.VacationFlight.delete({ id: VACATION_FLIGHT_BACK_ID });
  }

  // Delete vacation info
  await client.models.VacationInfo.delete({ id: VACATION_INFO_ID });

  revalidatePath("/vacation");
}

// ── VacationFlight ───────────────────────────────────────────────────

export async function getFlight(id: string): Promise<VacationFlight | null> {
  const client = getClient();
  const { data } = await client.models.VacationFlight.get({ id });
  if (!data) return null;
  return {
    id: data.id,
    flightNumber: data.flightNumber ?? undefined,
    airline: data.airline ?? undefined,
    departureTime: data.departureTime,
    departureTerminal: data.departureTerminal ?? undefined,
    arrivalTime: data.arrivalTime,
    arrivalTerminal: data.arrivalTerminal ?? undefined,
    baggageInfo: data.baggageInfo ?? undefined,
  };
}

export async function upsertFlight(flight: VacationFlight): Promise<void> {
  const client = getClient();
  const existing = await client.models.VacationFlight.get({ id: flight.id });
  if (existing.data) {
    await client.models.VacationFlight.update(flight);
  } else {
    await client.models.VacationFlight.create(flight);
  }
  // Revalidate both the flight sub-page and the parent vacation page
  const path = flight.id === VACATION_FLIGHT_OUT_ID ? "/vacation/flight-out" : "/vacation/flight-back";
  revalidatePath(path);
  revalidatePath("/vacation");
}

// ── VacationDay ──────────────────────────────────────────────────────

export async function getDays(): Promise<VacationDay[]> {
  const client = getClient();
  const { data } = await client.models.VacationDay.list();
  return data
    .map((d) => ({ id: d.id, date: d.date, order: d.order }))
    .sort((a, b) => a.order - b.order);
}

export async function addDay(date: string): Promise<string> {
  const client = getClient();
  const { data: existing } = await client.models.VacationDay.list();
  // Use max(existing orders) + 1 to avoid duplicates after deletions
  const order = existing.length === 0 ? 0 : Math.max(...existing.map((d) => d.order)) + 1;
  const { randomUUID } = await import("crypto");
  const id = randomUUID();
  await client.models.VacationDay.create({ id, date, order });
  revalidatePath("/vacation/programs");
  return id; // Return the real ID so callers can use it for optimistic updates
}

export async function deleteDay(id: string): Promise<void> {
  const client = getClient();
  // Delete all programs belonging to this day first
  const { data: programs } = await client.models.VacationProgram.list();
  for (const p of programs.filter((p) => p.dayId === id)) {
    await client.models.VacationProgram.delete({ id: p.id });
  }
  await client.models.VacationDay.delete({ id });
  revalidatePath("/vacation/programs");
}

// ── VacationProgram ──────────────────────────────────────────────────

export async function getProgramsForDay(dayId: string): Promise<VacationProgram[]> {
  const client = getClient();
  const { data } = await client.models.VacationProgram.list();
  return data
    .filter((p) => p.dayId === dayId)
    .map((p) => ({
      id: p.id,
      dayId: p.dayId,
      name: p.name,
      startTime: p.startTime,
      endTime: p.endTime ?? undefined,
      address: p.address ?? undefined,
      notes: p.notes ?? undefined,
    }))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function addProgram(program: Omit<VacationProgram, "id">): Promise<string> {
  const client = getClient();
  const { randomUUID } = await import("crypto");
  const id = randomUUID();
  await client.models.VacationProgram.create({ id, ...program });
  revalidatePath("/vacation/programs");
  return id;
}

export async function updateProgram(program: VacationProgram): Promise<void> {
  const client = getClient();
  await client.models.VacationProgram.update(program);
  revalidatePath("/vacation/programs");
}

export async function deleteProgram(id: string): Promise<void> {
  const client = getClient();
  await client.models.VacationProgram.delete({ id });
  revalidatePath("/vacation/programs");
}
