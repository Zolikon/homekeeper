# Vacation Feature Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a vacation planning section to HomeKeeper that lets the household plan a single trip with hotel info, live weather, flight details, and a day-by-day program timeline.

**Architecture:** All vacation data lives in DynamoDB via four new Amplify models (VacationInfo, VacationFlight, VacationDay, VacationProgram). The `/vacation` route family follows the same server-component-with-client-islands pattern used by `/shopping` and `/recipes`. Weather is fetched server-side from the free Open-Meteo API (no API key required).

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS 3.4, AWS Amplify Gen 2 + DynamoDB, react-hook-form v7, react-icons v5, Open-Meteo REST API.

---

## Additional Feature Suggestions

The following enhancements are recommended beyond the base requirements — implement if time and scope allow, or plan as follow-up tasks:

1. **Csomagolólista** (Packing checklist) — A simple checklist attached to the vacation where each person can tick off items they have packed. Very useful before departure and orthogonal to the rest of the feature.
2. **Dokumentumok** (Documents / Booking references) — A freeform section to store confirmation codes, PNR numbers, hotel booking ID, etc. Structured like the existing InfoStore but scoped to a single vacation.
3. **Helyi info** (Local info card) — Currency, emergency phone numbers (local ambulance, embassy), a few useful local phrases. Low-effort, high-value for first-time visitors to a city.
4. **Napi összefoglaló nyomtatható nézetben** (Printable daily itinerary) — A clean print-friendly view of each day's programs, useful to hand to someone who doesn't have a phone.

---

## File Map

### New files to create

| Path | Responsibility |
|------|---------------|
| `app/__backend/vacation.types.ts` | TypeScript types for all vacation entities |
| `app/__backend/VacationService.ts` | Server actions: vacation CRUD (info, flights, days, programs) |
| `app/__backend/WeatherService.ts` | Server function: fetch current weather from Open-Meteo |
| `app/vacation/page.tsx` | Route entry: async server component, fetches vacation data + weather |
| `app/vacation/VacationMain.tsx` | `"use client"` — main vacation view (hotel, weather, nav to sub-pages) |
| `app/vacation/CreateVacationForm.tsx` | `"use client"` — inline form to create the vacation |
| `app/vacation/DeleteVacationButton.tsx` | `"use client"` — big red delete button with confirmation dialog |
| `app/vacation/WeatherWidget.tsx` | `"use client"` — displays weather icon + temperature |
| `app/vacation/HotelEditModal.tsx` | `"use client"` — modal to edit hotel details |
| `app/vacation/flight-out/page.tsx` | Route: server component for outbound flight |
| `app/vacation/flight-out/FlightView.tsx` | `"use client"` — display + edit outbound flight |
| `app/vacation/flight-back/page.tsx` | Route: server component for return flight |
| `app/vacation/flight-back/FlightView.tsx` | `"use client"` — display + edit return flight |
| `app/vacation/FlightEditor.tsx` | `"use client"` — shared editable flight form (used by both flight pages) |
| `app/vacation/programs/page.tsx` | Route: server component for programs/days |
| `app/vacation/programs/ProgramsView.tsx` | `"use client"` — day selector + day timeline |
| `app/vacation/programs/DayTimeline.tsx` | `"use client"` — timeline of programs for one day with current-time indicator |
| `app/vacation/programs/ProgramModal.tsx` | `"use client"` — add/edit a program item |
| `app/vacation/programs/DayModal.tsx` | `"use client"` — add a day |
| ~~`app/__components/VacationButton.tsx`~~ | Not needed — use `PanelButton` directly in `app/page.tsx` |

### Files to modify

| Path | Change |
|------|--------|
| `amplify/data/resource.ts` | Add VacationInfo, VacationFlight, VacationDay, VacationProgram models |
| `app/page.tsx` | Add VacationButton to the home dashboard grid |

---

## Chunk 1: Data Layer

### Task 1: Add vacation models to Amplify schema

**Files:**
- Modify: `amplify/data/resource.ts`

The existing schema uses `a.model()` with `.authorization(allow => [allow.authenticated()])`. Add four new models using the same pattern. Fields use `a.string()` and `a.integer()`.

**IMPORTANT**: Use `a.string().required()` (NOT `a.id()`) for all `id` fields — this matches the existing pattern and allows us to supply deterministic IDs (`"main"`, `"outbound"`, `"return"`) at create time. Using `a.id()` would let Amplify auto-generate IDs, breaking the singleton pattern.

**Design notes:**
- `VacationInfo`: singleton — always stored with ID `"main"`. Holds city, hotel details, and geocoded coordinates for weather.
- `VacationFlight`: two records — IDs `"outbound"` and `"return"`. Holds flight info.
- `VacationDay`: one record per day, UUID ID, holds date string (`YYYY-MM-DD`) and sort order.
- `VacationProgram`: one record per program event, UUID ID, references day via `dayId` string. Sorted by `startTime`, no separate `order` field needed.

- [ ] **Step 1: Open the schema file and read it**

Read `amplify/data/resource.ts` to understand the full current schema before editing.

- [ ] **Step 2: Add the four vacation models**

```typescript
// Inside the a.schema({}) call, after the existing models:

VacationInfo: a.model({
  id: a.string().required(),       // always "main" — singleton
  city: a.string().required(),
  hotelName: a.string().required(),
  hotelAddress: a.string(),
  hotelCheckIn: a.string(),        // "YYYY-MM-DD"
  hotelCheckOut: a.string(),       // "YYYY-MM-DD"
  hotelNotes: a.string(),
  weatherLat: a.float(),           // geocoded latitude — cached to avoid re-geocoding on force-dynamic pages
  weatherLon: a.float(),           // geocoded longitude
}).authorization(allow => [allow.authenticated()]),

VacationFlight: a.model({
  id: a.string().required(),       // "outbound" or "return" — deterministic
  flightNumber: a.string(),
  airline: a.string(),
  departureTime: a.string().required(),    // "YYYY-MM-DD HH:mm"
  departureTerminal: a.string(),           // optional — budget airlines assign terminals late
  arrivalTime: a.string().required(),      // "YYYY-MM-DD HH:mm"
  arrivalTerminal: a.string(),             // optional
  baggageInfo: a.string(),
}).authorization(allow => [allow.authenticated()]),

VacationDay: a.model({
  id: a.string().required(),
  date: a.string().required(),    // "YYYY-MM-DD"
  order: a.integer().required(),
}).authorization(allow => [allow.authenticated()]),

VacationProgram: a.model({
  id: a.string().required(),
  dayId: a.string().required(),
  name: a.string().required(),
  startTime: a.string().required(),  // "HH:mm" — programs sorted by this field
  endTime: a.string(),               // "HH:mm" — optional
  address: a.string(),
  notes: a.string(),
}).authorization(allow => [allow.authenticated()]),
```

- [ ] **Step 3: Verify the sandbox generates without errors**

```bash
npx ampx sandbox
```

Expected: Sandbox starts, deploys new tables, generates updated `amplify_outputs.json` and `amplify/data/resource.ts`-derived types without TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add amplify/data/resource.ts amplify_outputs.json
git commit -m "feat: add vacation DynamoDB models to Amplify schema"
```

---

### Task 2: Create vacation TypeScript types

**Files:**
- Create: `app/__backend/vacation.types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// app/__backend/vacation.types.ts

export type VacationInfo = {
  id: string;
  city: string;
  hotelName: string;
  hotelAddress?: string;
  hotelCheckIn?: string;   // "YYYY-MM-DD"
  hotelCheckOut?: string;  // "YYYY-MM-DD"
  hotelNotes?: string;
  weatherLat?: number;     // cached geocoded coordinates
  weatherLon?: number;
};

export type VacationFlight = {
  id: string;  // "outbound" | "return"
  flightNumber?: string;
  airline?: string;
  departureTime: string;      // "YYYY-MM-DD HH:mm"
  departureTerminal?: string; // optional — budget airlines assign terminals late
  arrivalTime: string;        // "YYYY-MM-DD HH:mm"
  arrivalTerminal?: string;   // optional
  baggageInfo?: string;
};

export type VacationDay = {
  id: string;
  date: string;   // "YYYY-MM-DD"
  order: number;
};

export type VacationProgram = {
  id: string;
  dayId: string;
  name: string;
  startTime: string;  // "HH:mm" — programs sorted by this field; no separate order needed
  endTime?: string;   // "HH:mm"
  address?: string;
  notes?: string;
};

export type WeatherData = {
  temperatureCelsius: number;
  weatherCode: number;       // WMO weather code
  weatherDescription: string;
  windSpeedKmh: number;
};

// Singleton IDs
export const VACATION_INFO_ID = "main";
export const VACATION_FLIGHT_OUT_ID = "outbound";
export const VACATION_FLIGHT_BACK_ID = "return";
```

- [ ] **Step 2: Commit**

```bash
git add app/__backend/vacation.types.ts
git commit -m "feat: add vacation TypeScript types"
```

---

### Task 3: Create VacationService

**Files:**
- Create: `app/__backend/VacationService.ts`

Follow the pattern in `ShoppingService.ts` and `RecipeService.ts`: `"use server"`, `generateServerClientUsingCookies<Schema>()`, call DynamoDB, `revalidatePath()` after mutations.

**Note:** Existing services instantiate the client at module scope (one model each). VacationService needs access to four models, so a `getClient()` factory is used intentionally — this is not a mistake.

- [ ] **Step 1: Read an existing service for reference**

Read `app/__backend/RecipeService.ts` to understand the exact import pattern and client setup.

- [ ] **Step 2: Create VacationService.ts**

```typescript
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
    hotelCheckIn: data.hotelCheckIn ?? undefined,
    hotelCheckOut: data.hotelCheckOut ?? undefined,
    hotelNotes: data.hotelNotes ?? undefined,
    weatherLat: data.weatherLat ?? undefined,
    weatherLon: data.weatherLon ?? undefined,
  };
}

export async function createVacation(city: string, hotelName: string): Promise<void> {
  const client = getClient();
  await client.models.VacationInfo.create({
    id: VACATION_INFO_ID,
    city,
    hotelName,
  });
  revalidatePath("/vacation");
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

export async function addProgram(program: Omit<VacationProgram, "id">): Promise<void> {
  const client = getClient();
  const { randomUUID } = await import("crypto");
  await client.models.VacationProgram.create({ id: randomUUID(), ...program });
  revalidatePath("/vacation/programs");
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
```

- [ ] **Step 3: Run the dev build to catch type errors**

```bash
npm run build
```

Expected: Build completes without TypeScript errors in `VacationService.ts`. Fix any type mismatches from Amplify's generated schema types.

- [ ] **Step 4: Commit**

```bash
git add app/__backend/VacationService.ts
git commit -m "feat: add VacationService with full CRUD for vacation data"
```

---

### Task 4: Create WeatherService

**Files:**
- Create: `app/__backend/WeatherService.ts`

Uses Open-Meteo's free geocoding + weather APIs — no API key required.

**Geocoding strategy:** The vacation page uses `force-dynamic` which bypasses Next.js fetch cache. To avoid a geocoding API call on every page load, coordinates are stored in `VacationInfo` after first geocode. `geocodeAndStore()` is called once during `createVacation()` and whenever the city changes.

WMO weather code → human-readable Hungarian description mapping (partial, covering the most common codes).

- [ ] **Step 1: Create WeatherService.ts**

```typescript
"use server";

import type { WeatherData } from "./vacation.types";
import { updateVacationInfo } from "./VacationService";

// https://open-meteo.com/en/docs/geocoding-api
async function geocode(city: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  const result = json?.results?.[0];
  if (!result) return null;
  return { lat: result.latitude, lon: result.longitude };
}

/** Call after createVacation or when city changes to persist coordinates. */
export async function geocodeAndStore(city: string): Promise<void> {
  const coords = await geocode(city);
  if (!coords) return;
  await updateVacationInfo({ weatherLat: coords.lat, weatherLon: coords.lon });
}

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Tiszta ég",
  1: "Főleg napos",
  2: "Részben felhős",
  3: "Borult",
  45: "Köd",
  48: "Zúzmarás köd",
  51: "Enyhe szitálás",
  53: "Mérsékelt szitálás",
  55: "Erős szitálás",
  61: "Enyhe eső",
  63: "Mérsékelt eső",
  65: "Erős eső",
  71: "Enyhe havazás",
  73: "Mérsékelt havazás",
  75: "Erős havazás",
  80: "Enyhe zápor",
  81: "Mérsékelt zápor",
  82: "Erős zápor",
  85: "Gyenge hózápor",
  86: "Erős hózápor",
  95: "Zivatar",
  96: "Zivatar jégesővel",
  99: "Erős zivatar jégesővel",
};

/**
 * Fetch current weather using pre-stored coordinates.
 * Pass lat/lon from VacationInfo to avoid re-geocoding on every page load.
 */
export async function getWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`;
    const res = await fetch(url, { next: { revalidate: 900 } }); // cache 15 min
    if (!res.ok) return null;

    const json = await res.json();
    const current = json?.current;
    if (!current) return null;

    const weatherCode: number = current.weather_code ?? 0;
    return {
      temperatureCelsius: Math.round(current.temperature_2m),
      weatherCode,
      weatherDescription: WMO_DESCRIPTIONS[weatherCode] ?? "Ismeretlen",
      windSpeedKmh: Math.round(current.wind_speed_10m),
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Run build to check types**

```bash
npm run build
```

Expected: No errors in WeatherService.ts.

- [ ] **Step 3: Commit**

```bash
git add app/__backend/WeatherService.ts
git commit -m "feat: add WeatherService using Open-Meteo free API"
```

---

## Chunk 2: Home Page + Vacation Main Page

### Task 5: Add Vacation button to home page

**Files:**
- Modify: `app/page.tsx`

**No new component file needed.** The home page uses `<PanelButton>` from `app/__components/PanelButton.tsx` for all its grid cells — do not create a custom styled button. Read the file first to see the exact `PanelButton` props.

- [ ] **Step 1: Read the home page and PanelButton to understand the exact API**

Read `app/page.tsx` and `app/__components/PanelButton.tsx`.

- [ ] **Step 2: Add vacation entry directly to app/page.tsx**

Add a new `<PanelButton>` cell to the existing grid (2-column layout), using `PiAirplaneTakeoff` from `react-icons/pi` and label "Nyaralás", linking to `/vacation`. Follow the exact pattern of the existing grid entries.

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Navigate to `http://localhost:3000`. Confirm "Nyaralás" button appears in the grid with consistent styling, and clicking it navigates to `/vacation` (even if it 404s for now).

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add Vacation button to home dashboard"
```

---

### Task 6: Vacation main page — server component

**Files:**
- Create: `app/vacation/page.tsx`

- [ ] **Step 1: Create the server component**

```tsx
// app/vacation/page.tsx
import { getVacationInfo } from "@/app/__backend/VacationService";
import { getWeather } from "@/app/__backend/WeatherService";
import VacationMain from "./VacationMain";
import CreateVacationForm from "./CreateVacationForm";

export const dynamic = "force-dynamic";

export default async function VacationPage() {
  const info = await getVacationInfo();

  if (!info) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Még nincs nyaralás rögzítve.
        </p>
        <CreateVacationForm />
      </div>
    );
  }

  // Use stored coordinates to avoid geocoding on every page load (force-dynamic bypasses fetch cache)
  const weather =
    info.weatherLat != null && info.weatherLon != null
      ? await getWeather(info.weatherLat, info.weatherLon)
      : null;

  return <VacationMain info={info} weather={weather} />;
}
```

- [ ] **Step 2: Commit placeholder**

```bash
git add app/vacation/page.tsx
git commit -m "feat: add vacation server page shell"
```

---

### Task 7: CreateVacationForm client component

**Files:**
- Create: `app/vacation/CreateVacationForm.tsx`

Uses react-hook-form. On submit calls `createVacation()` server action then navigates to `/vacation`.

- [ ] **Step 1: Create CreateVacationForm.tsx**

```tsx
// app/vacation/CreateVacationForm.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/vacation/CreateVacationForm.tsx
git commit -m "feat: add CreateVacationForm client component"
```

---

### Task 8: VacationMain client component

**Files:**
- Create: `app/vacation/VacationMain.tsx`

The main vacation view. Shows city name, weather widget, hotel card, and navigation cards to sub-pages. Includes an edit button for hotel details.

- [ ] **Step 1: Create VacationMain.tsx**

```tsx
// app/vacation/VacationMain.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { PiAirplaneTakeoff, PiAirplaneLanding, PiCalendar, PiBuildings } from "react-icons/pi";
import type { VacationInfo, WeatherData } from "@/app/__backend/vacation.types";
import WeatherWidget from "./WeatherWidget";
import HotelEditModal from "./HotelEditModal";
import DeleteVacationButton from "./DeleteVacationButton";

type Props = {
  info: VacationInfo;
  weather: WeatherData | null;
};

export default function VacationMain({ info, weather }: Props) {
  const [hotelModalOpen, setHotelModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{info.city}</h1>
        {weather && <WeatherWidget weather={weather} />}
      </div>

      {/* Hotel card */}
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer active:opacity-80"
        onClick={() => setHotelModalOpen(true)}
      >
        <div className="flex items-center gap-3">
          <PiBuildings className="text-2xl text-theme_primary shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold truncate">{info.hotelName}</p>
            {info.hotelAddress && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(info.hotelAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-theme_primary underline truncate block"
              >
                {info.hotelAddress}
              </a>
            )}
            {(info.hotelCheckIn || info.hotelCheckOut) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {info.hotelCheckIn && `Be: ${info.hotelCheckIn}`}
                {info.hotelCheckIn && info.hotelCheckOut && " · "}
                {info.hotelCheckOut && `Ki: ${info.hotelCheckOut}`}
              </p>
            )}
          </div>
        </div>
        {info.hotelNotes && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 border-t dark:border-gray-700 pt-2">
            {info.hotelNotes}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2 text-right">Koppints a szerkesztéshez</p>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 gap-3">
        <NavCard href="/vacation/flight-out" icon={<PiAirplaneTakeoff />} label="Oda repülés" />
        <NavCard href="/vacation/programs" icon={<PiCalendar />} label="Napi programok" />
        <NavCard href="/vacation/flight-back" icon={<PiAirplaneLanding />} label="Vissza repülés" />
      </div>

      {/* Delete section */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <DeleteVacationButton />
      </div>

      {hotelModalOpen && (
        <HotelEditModal info={info} onClose={() => setHotelModalOpen(false)} />
      )}
    </div>
  );
}

function NavCard({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:opacity-80"
    >
      <span className="text-2xl text-theme_primary">{icon}</span>
      <span className="font-semibold">{label}</span>
      <span className="ml-auto text-gray-400">›</span>
    </Link>
  );
}
```

- [ ] **Step 2: Commit placeholder (component will compile after WeatherWidget + HotelEditModal + DeleteVacationButton are created)**

---

### Task 9: WeatherWidget component

**Files:**
- Create: `app/vacation/WeatherWidget.tsx`

- [ ] **Step 1: Create WeatherWidget.tsx**

WMO codes 0–3 → sun icon, 45–48 → cloud, 51–67 → rain, 71–77 → snow, 80–86 → rain, 95–99 → thunderstorm.

```tsx
// app/vacation/WeatherWidget.tsx
"use client";

import {
  PiSun,
  PiCloud,
  PiCloudRain,
  PiCloudSnow,
  PiCloudLightning,
} from "react-icons/pi";
import type { WeatherData } from "@/app/__backend/vacation.types";

function WeatherIcon({ code }: { code: number }) {
  const cls = "text-2xl";
  if (code <= 3) return <PiSun className={cls} />;
  if (code <= 48) return <PiCloud className={cls} />;
  if (code <= 67) return <PiCloudRain className={cls} />;
  if (code <= 77) return <PiCloudSnow className={cls} />;
  if (code <= 82) return <PiCloudRain className={cls} />;
  if (code <= 86) return <PiCloudSnow className={cls} />;  // 85-86: snow showers
  return <PiCloudLightning className={cls} />;
}

export default function WeatherWidget({ weather }: { weather: WeatherData }) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
      <WeatherIcon code={weather.weatherCode} />
      <div className="text-right">
        <p className="font-bold text-lg leading-none">{weather.temperatureCelsius}°C</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{weather.weatherDescription}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/vacation/WeatherWidget.tsx
git commit -m "feat: add WeatherWidget component"
```

---

### Task 10: HotelEditModal component

**Files:**
- Create: `app/vacation/HotelEditModal.tsx`

Full-screen modal (like `RecipeModal.tsx` pattern) with react-hook-form. On submit calls `updateVacationInfo()`.

- [ ] **Step 1: Read RecipeModal.tsx for the modal pattern**

Read `app/__components/RecipeModal.tsx` to understand the overlay/layout pattern used in this codebase.

- [ ] **Step 2: Create HotelEditModal.tsx**

```tsx
// app/vacation/HotelEditModal.tsx
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
  hotelCheckIn: string;
  hotelCheckOut: string;
  hotelNotes: string;
};

export default function HotelEditModal({ info, onClose }: Props) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      city: info.city,
      hotelName: info.hotelName,
      hotelAddress: info.hotelAddress ?? "",
      hotelCheckIn: info.hotelCheckIn ?? "",
      hotelCheckOut: info.hotelCheckOut ?? "",
      hotelNotes: info.hotelNotes ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await updateVacationInfo({
      city: values.city,
      hotelName: values.hotelName,
      hotelAddress: values.hotelAddress || undefined,
      hotelCheckIn: values.hotelCheckIn || undefined,
      hotelCheckOut: values.hotelCheckOut || undefined,
      hotelNotes: values.hotelNotes || undefined,
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
          <Field label="Check-in dátum" type="date" {...register("hotelCheckIn")} />
          <Field label="Check-out dátum" type="date" {...register("hotelCheckOut")} />
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
```

- [ ] **Step 3: Create DeleteVacationButton.tsx**

```tsx
// app/vacation/DeleteVacationButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteVacation } from "@/app/__backend/VacationService";
import { PiTrash } from "react-icons/pi";

export default function DeleteVacationButton() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    setError(false);
    try {
      await deleteVacation();
      router.refresh();
    } catch {
      setDeleting(false);
      setError(true);
    }
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-2 text-red-500 text-sm font-medium py-2"
      >
        <PiTrash /> Nyaralás törlése
      </button>
    );
  }

  return (
    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex flex-col gap-3">
      <p className="font-bold text-red-700 dark:text-red-400">⚠️ Figyelem!</p>
      <p className="text-sm text-red-700 dark:text-red-300">
        Ez a művelet <strong>véglegesen törli</strong> a teljes nyaralást, beleértve az összes
        programot, napi tervet és repülési adatot. Ez a művelet nem visszafordítható!
      </p>
      {error && <p className="text-xs text-red-600 font-medium">Törlés sikertelen. Kérjük, próbáld újra.</p>}
      <div className="flex gap-3">
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 font-semibold"
        >
          Mégse
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 bg-red-600 text-white rounded-lg py-2 font-semibold disabled:opacity-50"
        >
          {deleting ? "Törlés..." : "Igen, töröld!"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit all vacation main components**

```bash
git add app/vacation/VacationMain.tsx app/vacation/HotelEditModal.tsx app/vacation/DeleteVacationButton.tsx
git commit -m "feat: add VacationMain, HotelEditModal, DeleteVacationButton components"
```

- [ ] **Step 5: Verify vacation main page in browser**

```bash
npm run dev
```

Navigate to `/vacation`. Confirm:
- Empty state shows the create form
- After creating, the main page shows city, weather widget, hotel card, and nav cards
- Hotel card edit modal opens and saves correctly
- Delete flow shows warning and works

---

## Chunk 3: Flight Pages

### Task 11: Shared FlightEditor component

**Files:**
- Create: `app/vacation/FlightEditor.tsx`

Reusable editable form for flight information (used by both outbound and return pages).

- [ ] **Step 1: Create FlightEditor.tsx**

```tsx
// app/vacation/FlightEditor.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { upsertFlight } from "@/app/__backend/VacationService";
import type { VacationFlight } from "@/app/__backend/vacation.types";
import { PiPencil, PiCheck, PiX, PiSuitcase } from "react-icons/pi";

type Props = {
  flight: VacationFlight | null;
  flightId: string;
  directionLabel: string; // e.g., "Oda repülés"
};

type FormValues = Omit<VacationFlight, "id">;

export default function FlightEditor({ flight, flightId, directionLabel }: Props) {
  const [editing, setEditing] = useState(!flight); // auto-open if no flight yet
  const router = useRouter();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      flightNumber: flight?.flightNumber ?? "",
      airline: flight?.airline ?? "",
      departureTime: flight?.departureTime ?? "",
      departureTerminal: flight?.departureTerminal ?? "",
      arrivalTime: flight?.arrivalTime ?? "",
      arrivalTerminal: flight?.arrivalTerminal ?? "",
      baggageInfo: flight?.baggageInfo ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await upsertFlight({ id: flightId, ...values });
    router.refresh();
    setEditing(false);
  };

  if (editing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        <h2 className="text-lg font-bold">{directionLabel} – Adatok</h2>

        <FlightField label="Járatszám" {...register("flightNumber")} placeholder="pl. BA2759" />
        <FlightField label="Légitársaság" {...register("airline")} placeholder="pl. British Airways" />

        <div className="border-t dark:border-gray-700 pt-3">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Indulás</p>
          <FlightField label="Időpont (ÉÉÉÉ-HH-NN ÓÓ:PP)" {...register("departureTime", { required: true })} placeholder="2026-08-01 07:30" />
          {/* Terminal is optional — budget airlines assign terminals close to departure */}
          <FlightField label="Terminál (opcionális)" {...register("departureTerminal")} placeholder="pl. T2" className="mt-3" />
        </div>

        <div className="border-t dark:border-gray-700 pt-3">
          <p className="text-sm font-semibold text-gray-500 uppercase mb-2">Érkezés</p>
          <FlightField label="Időpont (ÉÉÉÉ-HH-NN ÓÓ:PP)" {...register("arrivalTime", { required: true })} placeholder="2026-08-01 10:00" />
          <FlightField label="Terminál (opcionális)" {...register("arrivalTerminal")} placeholder="pl. T5" className="mt-3" />
        </div>

        <div className="border-t dark:border-gray-700 pt-3">
          <FlightField label="Poggyászinformáció (opcionális)" {...register("baggageInfo")} placeholder="pl. 1 kabincsomag + 1 feladott 23kg" />
        </div>

        <div className="flex gap-3 pt-2">
          {flight && (
            <button type="button" onClick={() => setEditing(false)} className="flex-1 border rounded-lg py-3 font-semibold dark:border-gray-600">
              Mégse
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-theme_primary text-white rounded-lg py-3 font-semibold disabled:opacity-50">
            {isSubmitting ? "Mentés..." : "Mentés"}
          </button>
        </div>
      </form>
    );
  }

  // Read-only display
  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{directionLabel}</h2>
        <button onClick={() => setEditing(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <PiPencil className="text-xl text-theme_primary" />
        </button>
      </div>

      {(flight!.flightNumber || flight!.airline) && (
        <InfoRow label="Járat" value={[flight!.airline, flight!.flightNumber].filter(Boolean).join(" · ")} />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Indulás</p>
        <p className="font-semibold text-lg">{formatDateTime(flight!.departureTime)}</p>
        {flight!.departureTerminal && (
          <p className="text-sm text-gray-500">Terminál: <span className="font-medium text-gray-900 dark:text-white">{flight!.departureTerminal}</span></p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Érkezés</p>
        <p className="font-semibold text-lg">{formatDateTime(flight!.arrivalTime)}</p>
        {flight!.arrivalTerminal && (
          <p className="text-sm text-gray-500">Terminál: <span className="font-medium text-gray-900 dark:text-white">{flight!.arrivalTerminal}</span></p>
        )}
      </div>

      {flight!.baggageInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-3">
          <PiSuitcase className="text-xl text-theme_primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Poggyász</p>
            <p className="text-sm">{flight!.baggageInfo}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-gray-500">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// Spread props before className so react-hook-form ref is not shadowed
function FlightField({ label, className, ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label className="text-sm font-medium">{label}</label>
      <input {...props} className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
    </div>
  );
}

function formatDateTime(dt: string): string {
  // "2026-08-01 07:30" → "2026. aug. 1., 07:30"
  try {
    const [datePart, timePart] = dt.split(" ");
    const date = new Date(datePart + "T" + timePart);
    return date.toLocaleString("hu-HU", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return dt;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/vacation/FlightEditor.tsx
git commit -m "feat: add shared FlightEditor component"
```

---

### Task 12: Outbound and return flight pages

**Files:**
- Create: `app/vacation/flight-out/page.tsx`
- Create: `app/vacation/flight-out/FlightView.tsx`
- Create: `app/vacation/flight-back/page.tsx`
- Create: `app/vacation/flight-back/FlightView.tsx`

- [ ] **Step 1: Create outbound flight page**

```tsx
// app/vacation/flight-out/page.tsx
import { getFlight } from "@/app/__backend/VacationService";
import { VACATION_FLIGHT_OUT_ID } from "@/app/__backend/vacation.types";
import FlightView from "./FlightView";
import Link from "next/link";
import { PiArrowLeft } from "react-icons/pi";

export const dynamic = "force-dynamic";

export default async function FlightOutPage() {
  const flight = await getFlight(VACATION_FLIGHT_OUT_ID);
  return (
    <div>
      <div className="flex items-center gap-2 p-4">
        <Link href="/vacation" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <PiArrowLeft className="text-xl" />
        </Link>
        <h1 className="font-bold text-lg">Oda repülés</h1>
      </div>
      <FlightView flight={flight} />
    </div>
  );
}
```

```tsx
// app/vacation/flight-out/FlightView.tsx
"use client";

import FlightEditor from "@/app/vacation/FlightEditor";
import type { VacationFlight } from "@/app/__backend/vacation.types";
import { VACATION_FLIGHT_OUT_ID } from "@/app/__backend/vacation.types";

export default function FlightView({ flight }: { flight: VacationFlight | null }) {
  return <FlightEditor flight={flight} flightId={VACATION_FLIGHT_OUT_ID} directionLabel="Oda repülés" />;
}
```

- [ ] **Step 2: Create return flight page (same structure, different ID/label)**

```tsx
// app/vacation/flight-back/page.tsx
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
```

```tsx
// app/vacation/flight-back/FlightView.tsx
"use client";

import FlightEditor from "@/app/vacation/FlightEditor";
import type { VacationFlight } from "@/app/__backend/vacation.types";
import { VACATION_FLIGHT_BACK_ID } from "@/app/__backend/vacation.types";

export default function FlightView({ flight }: { flight: VacationFlight | null }) {
  return <FlightEditor flight={flight} flightId={VACATION_FLIGHT_BACK_ID} directionLabel="Vissza repülés" />;
}
```

- [ ] **Step 3: Verify flight pages in browser**

Navigate to `/vacation/flight-out`. Confirm:
- Empty state shows the edit form automatically
- After saving, the read-only view displays correctly with all fields
- Pencil icon opens edit mode again
- Date/time formatting looks correct

- [ ] **Step 4: Commit**

```bash
git add app/vacation/flight-out/ app/vacation/flight-back/
git commit -m "feat: add outbound and return flight pages"
```

---

## Chunk 4: Programs Page

### Task 13: Programs server page

**Files:**
- Create: `app/vacation/programs/page.tsx`

- [ ] **Step 1: Create programs server page**

```tsx
// app/vacation/programs/page.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/vacation/programs/page.tsx
git commit -m "feat: add programs server page shell"
```

---

### Task 14: ProgramsView client component

**Files:**
- Create: `app/vacation/programs/ProgramsView.tsx`

Top-level client component that manages which day is selected, shows day selector tabs, and renders the DayTimeline for the selected day. Loads programs for the selected day on client side.

- [ ] **Step 1: Create ProgramsView.tsx**

```tsx
// app/vacation/programs/ProgramsView.tsx
"use client";

import { useState, useEffect } from "react";
import { getProgramsForDay, addDay, deleteDay } from "@/app/__backend/VacationService";
import type { VacationDay, VacationProgram } from "@/app/__backend/vacation.types";
import DayTimeline from "./DayTimeline";
import DayModal from "./DayModal";
import { PiPlus, PiTrash } from "react-icons/pi";

type Props = {
  initialDays: VacationDay[];
};

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDayLabel(date: string): string {
  try {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("hu-HU", { month: "short", day: "numeric", weekday: "short" });
  } catch {
    return date;
  }
}

export default function ProgramsView({ initialDays }: Props) {
  const [days, setDays] = useState<VacationDay[]>(initialDays);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(() => {
    const today = getTodayDate();
    const todayDay = initialDays.find((d) => d.date === today);
    return todayDay?.id ?? initialDays[0]?.id ?? null;
  });
  const [programs, setPrograms] = useState<VacationProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [addDayOpen, setAddDayOpen] = useState(false);

  useEffect(() => {
    if (!selectedDayId) return;
    setLoadingPrograms(true);
    getProgramsForDay(selectedDayId).then((progs) => {
      setPrograms(progs);
      setLoadingPrograms(false);
    });
  }, [selectedDayId]);

  const today = getTodayDate();
  const selectedDay = days.find((d) => d.id === selectedDayId);

  const handleAddDay = async (date: string) => {
    // addDay returns the real server-assigned UUID so the optimistic state uses the correct ID
    const realId = await addDay(date);
    const maxOrder = days.length === 0 ? -1 : Math.max(...days.map((d) => d.order));
    const newDay: VacationDay = { id: realId, date, order: maxOrder + 1 };
    setDays([...days, newDay].sort((a, b) => a.order - b.order));
    setSelectedDayId(realId);
    setAddDayOpen(false);
  };

  const handleDeleteDay = async () => {
    if (!selectedDayId) return;
    if (!confirm("Biztosan törlöd ezt a napot az összes programjával együtt?")) return;
    await deleteDay(selectedDayId);
    const remaining = days.filter((d) => d.id !== selectedDayId);
    setDays(remaining);
    setSelectedDayId(remaining[0]?.id ?? null);
    setPrograms([]);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day selector tabs */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto shrink-0 scrollbar-hide">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => setSelectedDayId(day.id)}
            className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedDayId === day.id
                ? "bg-theme_primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            } ${day.date === today ? "ring-2 ring-theme_primary ring-offset-1" : ""}`}
          >
            {formatDayLabel(day.date)}
          </button>
        ))}
        <button
          onClick={() => setAddDayOpen(true)}
          className="shrink-0 px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-theme_primary flex items-center gap-1"
        >
          <PiPlus /> Nap
        </button>
      </div>

      {/* Day controls */}
      {selectedDay && (
        <div className="flex items-center justify-between px-4 pb-2 shrink-0">
          <p className="text-sm text-gray-500">
            {selectedDay.date === today && (
              <span className="text-theme_primary font-semibold">● Ma · </span>
            )}
            {selectedDay.date}
          </p>
          <button
            onClick={handleDeleteDay}
            className="text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950"
          >
            <PiTrash />
          </button>
        </div>
      )}

      {/* Timeline */}
      {selectedDayId && !loadingPrograms ? (
        <DayTimeline
          dayId={selectedDayId}
          programs={programs}
          isToday={selectedDay?.date === today}
          onProgramsChange={setPrograms}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          {days.length === 0 ? "Még nincs nap hozzáadva." : "Betöltés..."}
        </div>
      )}

      {addDayOpen && (
        <DayModal
          existingDates={days.map((d) => d.date)}
          onAdd={handleAddDay}
          onClose={() => setAddDayOpen(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/vacation/programs/ProgramsView.tsx
git commit -m "feat: add ProgramsView with day selector"
```

---

### Task 15: DayTimeline component

**Files:**
- Create: `app/vacation/programs/DayTimeline.tsx`

Renders the vertical timeline of programs. On the current day, calculates the current time position and renders a "most itt vagy" (you are here) line. Each program can be tapped to edit/delete. A FAB adds new programs.

- [ ] **Step 1: Create DayTimeline.tsx**

```tsx
// app/vacation/programs/DayTimeline.tsx
"use client";

import { useState, useEffect } from "react";
import { deleteProgram } from "@/app/__backend/VacationService";
import type { VacationProgram } from "@/app/__backend/vacation.types";
import ProgramModal from "./ProgramModal";
import { PiMapPin, PiPlus, PiPencil, PiTrash } from "react-icons/pi";

type Props = {
  dayId: string;
  programs: VacationProgram[];
  isToday: boolean;
  onProgramsChange: (programs: VacationProgram[]) => void;
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export default function DayTimeline({ dayId, programs, isToday, onProgramsChange }: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<VacationProgram | null>(null);
  const [currentMinutes, setCurrentMinutes] = useState(nowMinutes());

  useEffect(() => {
    if (!isToday) return;
    const interval = setInterval(() => setCurrentMinutes(nowMinutes()), 60_000);
    return () => clearInterval(interval);
  }, [isToday]);

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törlöd ezt a programot?")) return;
    await deleteProgram(id);
    onProgramsChange(programs.filter((p) => p.id !== id));
  };

  const handleSaved = (updated: VacationProgram) => {
    const exists = programs.find((p) => p.id === updated.id);
    if (exists) {
      onProgramsChange(programs.map((p) => (p.id === updated.id ? updated : p)).sort((a, b) => a.startTime.localeCompare(b.startTime)));
    } else {
      onProgramsChange([...programs, updated].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 relative">
      {programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
          Még nincs program ezen a napon.
        </div>
      ) : (
        <div className="relative ml-4">
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {programs.map((program, idx) => {
            const startMin = timeToMinutes(program.startTime);
            const endMin = program.endTime ? timeToMinutes(program.endTime) : null;
            const isActive = isToday && currentMinutes >= startMin && (endMin === null || currentMinutes < endMin);
            const isPast = isToday && (endMin !== null ? currentMinutes >= endMin : currentMinutes >= startMin + 60);

            return (
              <div key={program.id} className="relative pl-6 pb-6">
                {/* Timeline dot */}
                <div className={`absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full border-2 ${
                  isActive ? "bg-theme_primary border-theme_primary scale-125" : isPast ? "bg-gray-300 dark:bg-gray-600 border-gray-300" : "bg-white dark:bg-gray-900 border-theme_primary"
                }`} />

                {/* Program card */}
                <div className={`rounded-2xl p-3 border transition-all ${
                  isActive
                    ? "bg-theme_primary/10 border-theme_primary dark:bg-theme_primary/20"
                    : isPast
                    ? "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-60"
                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{program.name}</p>
                        {isActive && (
                          <span className="text-xs bg-theme_primary text-white rounded-full px-2 py-0.5 font-semibold shrink-0">
                            Most
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {program.startTime}{program.endTime ? ` – ${program.endTime}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setEditingProgram(program)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <PiPencil className="text-sm text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete(program.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950">
                        <PiTrash className="text-sm text-red-500" />
                      </button>
                    </div>
                  </div>

                  {program.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(program.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-theme_primary mt-2"
                    >
                      <PiMapPin className="shrink-0" />
                      <span className="underline truncate">{program.address}</span>
                    </a>
                  )}

                  {program.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 border-t dark:border-gray-700 pt-1.5">
                      {program.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Current-time "Most" badge is shown INSIDE the active card (see isActive styling above),
              not as a floating positioned indicator, because card heights vary and percentage-of-height
              positioning does not correspond to percentage-of-time on a variable-height list. */}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-14 right-4 size-14 rounded-full bg-theme_primary text-white shadow-lg flex items-center justify-center"
      >
        <PiPlus className="text-2xl" />
      </button>

      {addModalOpen && (
        <ProgramModal dayId={dayId} program={null} onSaved={handleSaved} onClose={() => setAddModalOpen(false)} />
      )}
      {editingProgram && (
        <ProgramModal dayId={dayId} program={editingProgram} onSaved={handleSaved} onClose={() => setEditingProgram(null)} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/vacation/programs/DayTimeline.tsx
git commit -m "feat: add DayTimeline with current-time indicator and program cards"
```

---

### Task 16: ProgramModal and DayModal components

**Files:**
- Create: `app/vacation/programs/ProgramModal.tsx`
- Create: `app/vacation/programs/DayModal.tsx`

- [ ] **Step 1: Create ProgramModal.tsx**

```tsx
// app/vacation/programs/ProgramModal.tsx
"use client";

import { useForm } from "react-hook-form";
import { addProgram, updateProgram } from "@/app/__backend/VacationService";
import type { VacationProgram } from "@/app/__backend/vacation.types";
import { PiX } from "react-icons/pi";

type Props = {
  dayId: string;
  program: VacationProgram | null; // null = add new
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
      await addProgram(newProg);
      // Optimistic: create local id for immediate display
      onSaved({ id: crypto.randomUUID(), ...newProg });
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
```

- [ ] **Step 2: Create DayModal.tsx**

```tsx
// app/vacation/programs/DayModal.tsx
"use client";

import { useForm } from "react-hook-form";
import { PiX } from "react-icons/pi";

type Props = {
  existingDates: string[];
  onAdd: (date: string) => Promise<void>;
  onClose: () => void;
};

export default function DayModal({ existingDates, onAdd, onClose }: Props) {
  const { register, handleSubmit, setError, formState: { isSubmitting, errors } } = useForm<{ date: string }>();

  const onSubmit = async ({ date }: { date: string }) => {
    if (existingDates.includes(date)) {
      setError("date", { message: "Ez a dátum már hozzá van adva" });
      return;
    }
    await onAdd(date);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white dark:bg-gray-900 w-full md:max-w-sm rounded-t-2xl md:rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Nap hozzáadása</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <PiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Dátum</label>
            <input
              type="date"
              {...register("date", { required: "Kötelező" })}
              className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
            />
            {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-3 font-semibold dark:border-gray-600">
              Mégse
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-theme_primary text-white rounded-lg py-3 font-semibold disabled:opacity-50">
              {isSubmitting ? "Hozzáadás..." : "Hozzáadás"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/vacation/programs/ProgramModal.tsx app/vacation/programs/DayModal.tsx
git commit -m "feat: add ProgramModal and DayModal components"
```

- [ ] **Step 4: Verify programs page end-to-end in browser**

Navigate to `/vacation/programs`. Confirm:
- Days can be added with the date picker
- Programs can be added with the + FAB, edited with pencil, deleted with trash
- Timeline shows programs in time order
- On today's date, active program card is highlighted and "Most" indicator appears
- Addresses show as Google Maps links that open in browser/maps app

---

## Chunk 5: Integration & Polish

### Task 17: Final build verification and responsive check

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: Zero TypeScript errors, zero build errors.

- [ ] **Step 2: Run linter**

```bash
npm run lint
```

Expected: No ESLint errors. Fix any reported issues (unused imports, missing keys, etc.).

- [ ] **Step 3: Mobile responsiveness check**

Start `npm run dev`, open Chrome DevTools, toggle device emulation to iPhone 14 Pro (390×844). Walk through the following checklist:

- [ ] Home page: "Nyaralás" button is visible and tappable
- [ ] Vacation main: city + weather in header, hotel card, nav cards all fit without overflow
- [ ] Hotel edit modal: opens from bottom on mobile, scrollable
- [ ] Delete warning: text is fully visible, buttons are full-width
- [ ] Flight pages: form and read view fit on a single screen
- [ ] Programs: day selector tabs scroll horizontally without breaking layout
- [ ] Timeline: program cards readable, edit/delete buttons are tappable (min 44px)
- [ ] Program modal: opens from bottom, keyboard doesn't obscure time fields
- [ ] Google Maps links: open the maps app on mobile simulation

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete vacation feature — main page, flights, day programs with timeline"
```

---

## Summary of Additional Feature Suggestions (for follow-up)

| Feature | Effort | Value |
|---------|--------|-------|
| Csomagolólista (Packing checklist) | Low | High — useful before every trip |
| Dokumentumok (Booking references) | Low | High — confirmation codes always needed |
| Helyi info (Currency, emergency numbers) | Low | Medium — nice to have offline |
| Napi összefoglaló nyomtatható nézetben | Medium | Medium — useful to share with others |
