# Period Calendar Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-first menstrual cycle tracker at `/period` with a classic calendar view, cycle predictions, and daily AWS Lambda push notifications.

**Architecture:** DynamoDB models for settings (singleton) and cycle records, pure TypeScript cycle logic, React `react-day-picker` v9 calendar UI, and a daily EventBridge-triggered Lambda sending Web Push notifications via VAPID.

**Tech Stack:** Next.js 15 App Router, AWS Amplify Gen 2 + DynamoDB, `react-day-picker` v9, Web Push API (VAPID), AWS Lambda + EventBridge Scheduler, Vitest (new dependency for unit tests), `web-push` npm package (Lambda only).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `amplify/data/resource.ts` | Modify | Add `PeriodSettings` and `PeriodCycle` models |
| `amplify/functions/period-notifier/resource.ts` | Create | Define Lambda function with VAPID secrets |
| `amplify/functions/period-notifier/handler.ts` | Create | Daily push notification logic |
| `amplify/functions/period-notifier/package.json` | Create | `web-push` dependency for Lambda bundle |
| `amplify/backend.ts` | Modify | Register Lambda, grant IAM, wire EventBridge |
| `app/__backend/period.types.ts` | Create | TypeScript types for PeriodSettings, PeriodCycle |
| `app/__backend/PeriodService.ts` | Create | `"use server"` CRUD functions |
| `app/period/cycleLogic.ts` | Create | Pure date calculation functions |
| `app/period/cycleLogic.test.ts` | Create | Vitest unit tests |
| `app/period/page.tsx` | Create | Server component — fetches + passes data |
| `app/period/PeriodCalendar.tsx` | Create | `"use client"` — calendar, FABs, info strip, SW registration |
| `app/period/PeriodSettingsDialog.tsx` | Create | `"use client"` — settings form, notifications button, delete |
| `app/period/period-calendar.css` | Create | Calendar day color overrides |
| `app/page.tsx` | Modify | Add 7th panel button, update grid to `grid-rows-4` |
| `app/layout.tsx` | Modify | Add `<link rel="manifest">` tag |
| `public/manifest.json` | Create | PWA manifest (name, icons, `display: "standalone"`) |
| `public/sw.js` | Create | Service Worker — push handler + notification click |
| `public/icon-192.png` | Create | 192×192 PWA icon (copy/export from `HomeKeeper.svg`) |
| `vitest.config.ts` | Create | Vitest config for TypeScript |
| `package.json` | Modify | Add `vitest` dev dep + `"test"` script |

---

## Chunk 1: Data Foundation

### Task 1: Add Amplify schema models

**Files:**
- Modify: `amplify/data/resource.ts`

- [ ] **Step 1: Add `PeriodSettings` and `PeriodCycle` models** to `amplify/data/resource.ts` — insert after the last existing model (before the closing `}`):

```ts
  PeriodSettings: a
    .model({
      id: a.string().required(),         // always "main"
      cycleLength: a.integer().required(),
      periodDuration: a.integer().required(),
      pushSubscription: a.string(),      // JSON-serialized Web Push subscription
    })
    .authorization((allow) => [allow.authenticated()]),

  PeriodCycle: a
    .model({
      id: a.string().required(),
      startDate: a.string().required(),  // "YYYY-MM-DD"
      endDate: a.string(),               // "YYYY-MM-DD", null until confirmed
      notes: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),
```

- [ ] **Step 2: Verify the sandbox picks up the new models**

```bash
npx ampx sandbox
```

Expected: sandbox re-deploys and regenerates `amplify_outputs.json` without errors.

- [ ] **Step 3: Commit**

```bash
git add amplify/data/resource.ts
git commit -m "feat: add PeriodSettings and PeriodCycle schema models"
```

---

### Task 2: Create TypeScript types

**Files:**
- Create: `app/__backend/period.types.ts`

- [ ] **Step 1: Create `app/__backend/period.types.ts`**

```ts
// app/__backend/period.types.ts

export const PERIOD_SETTINGS_ID = "main";

export type PeriodSettings = {
  id: string;           // always PERIOD_SETTINGS_ID
  cycleLength: number;  // default 28
  periodDuration: number; // default 5
  pushSubscription?: string; // JSON-serialized Web Push subscription
};

export type PeriodCycle = {
  id: string;
  startDate: string;   // "YYYY-MM-DD"
  endDate?: string;    // "YYYY-MM-DD", undefined until confirmed
  notes?: string;
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -20
```

Expected: no type errors related to new files.

- [ ] **Step 3: Commit**

```bash
git add app/__backend/period.types.ts
git commit -m "feat: add period TypeScript types"
```

---

### Task 3: Create PeriodService

**Files:**
- Create: `app/__backend/PeriodService.ts`

- [ ] **Step 1: Create `app/__backend/PeriodService.ts`**

```ts
"use server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import type { Schema } from "../../amplify/data/resource";
import outputs from "../../amplify_outputs.json";
import { PeriodSettings, PeriodCycle, PERIOD_SETTINGS_ID } from "./period.types";

// Factory function rather than module-level singleton: this service accesses
// multiple models (PeriodSettings + PeriodCycle), so calling getModels() once
// per function is cleaner than binding separate module-level model constants.
function getModels() {
  return generateServerClientUsingCookies<Schema>({ cookies, config: outputs }).models;
}

export async function getPeriodSettings(): Promise<PeriodSettings | null> {
  const { data } = await getModels().PeriodSettings.get({ id: PERIOD_SETTINGS_ID });
  if (!data) return null;
  return {
    id: data.id,
    cycleLength: data.cycleLength,
    periodDuration: data.periodDuration,
    pushSubscription: data.pushSubscription ?? undefined,
  };
}

export async function upsertPeriodSettings(
  updates: Partial<Omit<PeriodSettings, "id">>
): Promise<void> {
  const models = getModels();
  const { data: existing } = await models.PeriodSettings.get({ id: PERIOD_SETTINGS_ID });
  if (existing) {
    await models.PeriodSettings.update({ id: PERIOD_SETTINGS_ID, ...updates });
  } else {
    await models.PeriodSettings.create({
      id: PERIOD_SETTINGS_ID,
      cycleLength: updates.cycleLength ?? 28,
      periodDuration: updates.periodDuration ?? 5,
      ...updates,
    });
  }
  revalidatePath("/period");
}

export async function listPeriodCycles(): Promise<PeriodCycle[]> {
  const { data } = await getModels().PeriodCycle.list({ limit: 100 });
  return data
    .map((item) => ({
      id: item.id,
      startDate: item.startDate,
      endDate: item.endDate ?? undefined,
      notes: item.notes ?? undefined,
    }))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function createPeriodCycle(startDate: string): Promise<void> {
  await getModels().PeriodCycle.create({ id: randomUUID(), startDate });
  revalidatePath("/period");
}

export async function updatePeriodCycle(
  id: string,
  updates: Partial<Pick<PeriodCycle, "endDate" | "notes">>
): Promise<void> {
  await getModels().PeriodCycle.update({ id, ...updates });
  revalidatePath("/period");
}

export async function deletePeriodCycle(id: string): Promise<void> {
  await getModels().PeriodCycle.delete({ id });
  revalidatePath("/period");
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/__backend/PeriodService.ts
git commit -m "feat: add PeriodService CRUD functions"
```

---

## Chunk 2: Cycle Logic + Tests

### Task 4: Set up Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Add `vitest.config.ts` to project root**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['app/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add test script to `package.json`** — find the `"scripts"` section and add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify Vitest runs**

```bash
npm test
```

Expected: `No test files found` (or similar — no failures).

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add Vitest for unit testing"
```

---

### Task 5: Create cycle logic with tests (TDD)

**Files:**
- Create: `app/period/cycleLogic.test.ts`
- Create: `app/period/cycleLogic.ts`

Note: `app/period/` doesn't exist yet — create it as a directory. The `.ts` files here are not Next.js route files so no special treatment needed.

- [ ] **Step 1: Create `app/period/cycleLogic.test.ts`** (write the tests first)

```ts
import { describe, it, expect } from 'vitest';
import { addDays, diffDays, computeCycleInfo } from './cycleLogic';

describe('addDays', () => {
  it('adds days correctly within a month', () => {
    expect(addDays('2026-03-01', 4)).toBe('2026-03-05');
  });
  it('wraps across a month boundary', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02');
  });
  it('wraps across a year boundary', () => {
    expect(addDays('2025-12-30', 5)).toBe('2026-01-04');
  });
  it('handles zero days', () => {
    expect(addDays('2026-03-15', 0)).toBe('2026-03-15');
  });
});

describe('diffDays', () => {
  it('returns positive when b is after a', () => {
    expect(diffDays('2026-03-01', '2026-03-05')).toBe(4);
  });
  it('returns 0 for the same date', () => {
    expect(diffDays('2026-03-01', '2026-03-01')).toBe(0);
  });
  it('returns negative when b is before a', () => {
    expect(diffDays('2026-03-05', '2026-03-01')).toBe(-4);
  });
});

describe('computeCycleInfo — no cycles', () => {
  const settings = { cycleLength: 28, periodDuration: 5 };

  it('returns empty/null state with no cycle history', () => {
    const result = computeCycleInfo([], settings, '2026-03-15');
    expect(result.isActive).toBe(false);
    expect(result.isStale).toBe(false);
    expect(result.nextPeriodStart).toBeNull();
    expect(result.ovulationDay).toBeNull();
    expect(result.confirmedPeriodDays).toHaveLength(0);
    expect(result.predictedPeriodDays).toHaveLength(0);
    expect(result.currentDayNumber).toBeNull();
    expect(result.daysUntilNextPeriod).toBeNull();
  });
});

describe('computeCycleInfo — active period', () => {
  const settings = { cycleLength: 28, periodDuration: 5 };
  // Period started Mar 11, lasts until Mar 15 (days 1-5)

  it('is active on the first day', () => {
    const result = computeCycleInfo([{ startDate: '2026-03-11' }], settings, '2026-03-11');
    expect(result.isActive).toBe(true);
    expect(result.currentDayNumber).toBe(1);
  });

  it('is active on the last day (day 5)', () => {
    const result = computeCycleInfo([{ startDate: '2026-03-11' }], settings, '2026-03-15');
    expect(result.isActive).toBe(true);
    expect(result.currentDayNumber).toBe(5);
  });

  it('is not active the day after predicted end', () => {
    const result = computeCycleInfo([{ startDate: '2026-03-11' }], settings, '2026-03-16');
    expect(result.isActive).toBe(false);
  });
});

describe('computeCycleInfo — stale period', () => {
  const settings = { cycleLength: 28, periodDuration: 5 };

  it('is stale when today is past predicted end and endDate is null', () => {
    const result = computeCycleInfo([{ startDate: '2026-03-01' }], settings, '2026-03-10');
    expect(result.isActive).toBe(false);
    expect(result.isStale).toBe(true);
  });

  it('is not stale when endDate is set', () => {
    const result = computeCycleInfo(
      [{ startDate: '2026-03-01', endDate: '2026-03-05' }],
      settings,
      '2026-03-10',
    );
    expect(result.isStale).toBe(false);
  });
});

describe('computeCycleInfo — predictions', () => {
  const settings = { cycleLength: 28, periodDuration: 5 };
  // startDate: Mar 1. Ovulation: Mar 1 + 14 = Mar 15. Next period: Mar 1 + 28 = Mar 29.

  it('computes ovulation as startDate + (cycleLength - 14)', () => {
    const result = computeCycleInfo([{ startDate: '2026-03-01' }], settings, '2026-03-15');
    expect(result.ovulationDay).toBe('2026-03-15');
  });

  it('computes next period start as startDate + cycleLength', () => {
    const result = computeCycleInfo([{ startDate: '2026-03-01' }], settings, '2026-03-15');
    expect(result.nextPeriodStart).toBe('2026-03-29');
  });

  it('computes predicted period days for next cycle (5 days from next start)', () => {
    const result = computeCycleInfo([{ startDate: '2026-03-01' }], settings, '2026-03-15');
    expect(result.predictedPeriodDays).toHaveLength(5);
    expect(result.predictedPeriodDays[0]).toBe('2026-03-29');
    expect(result.predictedPeriodDays[4]).toBe('2026-04-02');
  });

  it('computes daysUntilNextPeriod when not active', () => {
    const result = computeCycleInfo([{ startDate: '2026-03-01' }], settings, '2026-03-15');
    expect(result.daysUntilNextPeriod).toBe(14);
  });
});

describe('computeCycleInfo — confirmed period days', () => {
  const settings = { cycleLength: 28, periodDuration: 5 };

  it('includes all days of a cycle with a set endDate', () => {
    const result = computeCycleInfo(
      [{ startDate: '2026-03-01', endDate: '2026-03-04' }],
      settings,
      '2026-03-15',
    );
    expect(result.confirmedPeriodDays).toHaveLength(4);
    expect(result.confirmedPeriodDays).toContain('2026-03-01');
    expect(result.confirmedPeriodDays).toContain('2026-03-04');
    expect(result.confirmedPeriodDays).not.toContain('2026-03-05');
  });

  it('falls back to periodDuration when endDate is null (stale period)', () => {
    const result = computeCycleInfo(
      [{ startDate: '2026-03-01' }],
      settings,
      '2026-03-15', // today is past predicted end → stale
    );
    expect(result.confirmedPeriodDays).toHaveLength(5);
    expect(result.confirmedPeriodDays[0]).toBe('2026-03-01');
    expect(result.confirmedPeriodDays[4]).toBe('2026-03-05');
  });

  it('falls back to periodDuration when endDate is null (active period, today within window)', () => {
    const result = computeCycleInfo(
      [{ startDate: '2026-03-11' }],
      settings,
      '2026-03-13', // day 3 of 5 — still active
    );
    expect(result.isActive).toBe(true);
    expect(result.confirmedPeriodDays).toHaveLength(5); // full predicted period shown
    expect(result.confirmedPeriodDays).toContain('2026-03-11');
    expect(result.confirmedPeriodDays).toContain('2026-03-15');
  });
});
```

- [ ] **Step 2: Run the tests — verify they all FAIL**

```bash
npm test
```

Expected: all tests fail with `Cannot find module './cycleLogic'`.

- [ ] **Step 3: Create `app/period/cycleLogic.ts`** (minimal implementation to pass the tests)

```ts
// app/period/cycleLogic.ts
// Pure date calculation functions — no side effects, no imports from Next.js or AWS.

/** Add `days` to a YYYY-MM-DD string, returning a new YYYY-MM-DD string. */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Difference in whole days: b - a. Positive when b is after a. */
export function diffDays(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

/** Today as YYYY-MM-DD (injectable for testing). */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export type CycleSettings = {
  cycleLength: number;
  periodDuration: number;
};

export type CycleInfo = {
  /** Confirmed period days across all stored cycles (YYYY-MM-DD[]). */
  confirmedPeriodDays: string[];
  /** Predicted future period days for the next upcoming cycle. */
  predictedPeriodDays: string[];
  /** Predicted ovulation day for the current/last cycle. Null if no history. */
  ovulationDay: string | null;
  /** Predicted start of the next period. Null if no history. */
  nextPeriodStart: string | null;
  /** True when a period is started, endDate is null, and today is within the window. */
  isActive: boolean;
  /** True when a period is started, endDate is null, and today is past the window. */
  isStale: boolean;
  /** 1-based day number within the active period. Null when not active. */
  currentDayNumber: number | null;
  /** Days until the next predicted period. Null when active. */
  daysUntilNextPeriod: number | null;
};

/**
 * Compute all cycle display data from stored cycles + settings.
 * Cycles must be sorted descending by startDate (most recent first).
 * `today` is injectable for testing; defaults to actual today.
 */
export function computeCycleInfo(
  cycles: Array<{ startDate: string; endDate?: string | null }>,
  settings: CycleSettings,
  today?: string,
): CycleInfo {
  const t = today ?? todayStr();
  const { cycleLength, periodDuration } = settings;

  // Collect confirmed days from all cycles (use endDate if set, else fall back to periodDuration)
  const confirmedPeriodDays: string[] = [];
  for (const cycle of cycles) {
    const lastDay = cycle.endDate ?? addDays(cycle.startDate, periodDuration - 1);
    let d = cycle.startDate;
    while (d <= lastDay) {
      confirmedPeriodDays.push(d);
      d = addDays(d, 1);
    }
  }

  const lastCycle = cycles[0] ?? null;
  if (!lastCycle) {
    return {
      confirmedPeriodDays,
      predictedPeriodDays: [],
      ovulationDay: null,
      nextPeriodStart: null,
      isActive: false,
      isStale: false,
      currentDayNumber: null,
      daysUntilNextPeriod: null,
    };
  }

  const predictedEnd = addDays(lastCycle.startDate, periodDuration - 1);
  const isActive =
    lastCycle.endDate == null &&
    t >= lastCycle.startDate &&
    t <= predictedEnd;
  const isStale =
    lastCycle.endDate == null &&
    t > predictedEnd;

  const nextPeriodStart = addDays(lastCycle.startDate, cycleLength);
  const ovulationDay = addDays(lastCycle.startDate, cycleLength - 14);

  // Predicted days for the next period
  const predictedPeriodDays: string[] = [];
  let d = nextPeriodStart;
  const predictedPeriodEnd = addDays(nextPeriodStart, periodDuration - 1);
  while (d <= predictedPeriodEnd) {
    predictedPeriodDays.push(d);
    d = addDays(d, 1);
  }

  const currentDayNumber = isActive ? diffDays(lastCycle.startDate, t) + 1 : null;
  const daysUntilNextPeriod = !isActive ? diffDays(t, nextPeriodStart) : null;

  return {
    confirmedPeriodDays,
    predictedPeriodDays,
    ovulationDay,
    nextPeriodStart,
    isActive,
    isStale,
    currentDayNumber,
    daysUntilNextPeriod,
  };
}
```

- [ ] **Step 4: Run the tests — verify they all PASS**

```bash
npm test
```

Expected: all tests pass, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add app/period/cycleLogic.ts app/period/cycleLogic.test.ts
git commit -m "feat: add cycle logic with Vitest tests"
```

---

## Chunk 3: PWA Setup

### Task 6: Create PWA manifest and icon

**Files:**
- Create: `public/manifest.json`
- Create: `public/icon-192.png` (manual step)

- [ ] **Step 1: Export a 192×192 PNG icon**

Open `public/HomeKeeper.svg` in any image editor or use an online converter (e.g. cloudconvert.com) to export it as `public/icon-192.png` at 192×192 pixels. The icon should have a solid background color matching the app theme (`#1db594`).

- [ ] **Step 2: Create `public/manifest.json`**

```json
{
  "name": "HomeKeeper",
  "short_name": "HomeKeeper",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1db594",
  "theme_color": "#1db594",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add public/manifest.json public/icon-192.png
git commit -m "feat: add PWA manifest and icon"
```

---

### Task 7: Create Service Worker

**Files:**
- Create: `public/sw.js`

- [ ] **Step 1: Create `public/sw.js`**

```js
// public/sw.js
// Service Worker for HomeKeeper push notifications.

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const { title = 'HomeKeeper', body = '' } = event.data.json();
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: '/period' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/period') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/period');
    })
  );
});
```

- [ ] **Step 2: Commit**

```bash
git add public/sw.js
git commit -m "feat: add Service Worker for push notifications"
```

---

### Task 8: Link manifest in layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add manifest link to `app/layout.tsx`** — update the `metadata` export:

```ts
export const metadata: Metadata = {
  title: "HomeKeeper",
  manifest: "/manifest.json",
};
```

- [ ] **Step 2: Verify the manifest link appears in HTML**

Run `npm run dev`, open the app in a browser, and check the `<head>` for `<link rel="manifest" href="/manifest.json">`.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: link PWA manifest in app layout"
```

---

## Chunk 4: Period Calendar UI

### Task 9: Install react-day-picker and create page.tsx

**Files:**
- Create: `app/period/page.tsx`

- [ ] **Step 1: Install react-day-picker v9**

```bash
npm install react-day-picker@9
```

- [ ] **Step 2: Create `app/period/page.tsx`**

```tsx
// app/period/page.tsx
import { getPeriodSettings, listPeriodCycles } from "../__backend/PeriodService";
import PeriodCalendar from "./PeriodCalendar";

export const dynamic = "force-dynamic";

export default async function PeriodPage() {
  const [settings, cycles] = await Promise.all([
    getPeriodSettings(),
    listPeriodCycles(),
  ]);

  const resolvedSettings = settings ?? {
    id: "main",
    cycleLength: 28,
    periodDuration: 5,
  };

  return (
    <div className="h-full overflow-auto">
      <PeriodCalendar settings={resolvedSettings} cycles={cycles} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/period/page.tsx package.json package-lock.json
git commit -m "feat: add period page server component and install react-day-picker"
```

---

### Task 10: Create PeriodCalendar component

**Files:**
- Create: `app/period/PeriodCalendar.tsx`
- Create: `app/period/period-calendar.css`

- [ ] **Step 1: Create `app/period/period-calendar.css`** (calendar day color overrides)

```css
/* app/period/period-calendar.css */

/* Confirmed period days — red fill */
.rdp-day.day-period .rdp-day_button {
  background-color: #e11d48;
  color: white;
  border-radius: 4px;
}

/* Predicted future period days — pink dashed border */
.rdp-day.day-predicted .rdp-day_button {
  border: 2px dashed #fca5a5;
  border-radius: 4px;
  color: inherit;
}

/* Ovulation day — green dot below the number */
.rdp-day.day-ovulation .rdp-day_button::after {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  background-color: #4ade80;
  border-radius: 50%;
  margin: 1px auto 0;
}
```

- [ ] **Step 2: Create `app/period/PeriodCalendar.tsx`**

```tsx
"use client";
import { useEffect, useState, useTransition } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import "./period-calendar.css";
import { MdSettings } from "react-icons/md";
import { PiFlowerLotus } from "react-icons/pi";
import { PeriodSettings, PeriodCycle } from "../__backend/period.types";
import { computeCycleInfo } from "./cycleLogic";
import {
  createPeriodCycle,
  updatePeriodCycle,
} from "../__backend/PeriodService";
import PeriodSettingsDialog from "./PeriodSettingsDialog";

type Props = {
  settings: PeriodSettings;
  cycles: PeriodCycle[];
};

export default function PeriodCalendar({ settings, cycles }: Props) {
  const [month, setMonth] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Register Service Worker once on mount
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  const cycleInfo = computeCycleInfo(cycles, settings);

  const toDate = (s: string) => new Date(s + "T00:00:00");

  const modifiers = {
    period: cycleInfo.confirmedPeriodDays.map(toDate),
    predicted: cycleInfo.predictedPeriodDays.map(toDate),
    ovulation: cycleInfo.ovulationDay ? [toDate(cycleInfo.ovulationDay)] : [],
  };

  function handleStartPeriod() {
    const today = new Date().toISOString().slice(0, 10);
    startTransition(async () => {
      await createPeriodCycle(today);
      setShowStartConfirm(false);
    });
  }

  function handleEndPeriod() {
    const latestCycle = cycles[0];
    if (!latestCycle) return;
    const today = new Date().toISOString().slice(0, 10);
    startTransition(async () => {
      await updatePeriodCycle(latestCycle.id, { endDate: today });
    });
  }

  const infoText = cycleInfo.isActive
    ? `Ciklus ${cycleInfo.currentDayNumber}. napja`
    : cycleInfo.daysUntilNextPeriod != null && cycleInfo.daysUntilNextPeriod > 0
      ? `Következő ciklus: ${cycleInfo.daysUntilNextPeriod} nap múlva`
      : cycleInfo.daysUntilNextPeriod === 0
        ? "Ma várható a következő ciklus"
        : "Nincs adat";

  const nextEvent = (() => {
    if (!cycleInfo.ovulationDay) return null;
    const today = new Date().toISOString().slice(0, 10);
    const days = Math.round(
      (new Date(cycleInfo.ovulationDay + "T00:00:00").getTime() -
        new Date(today + "T00:00:00").getTime()) /
        86_400_000
    );
    if (days === 0) return "Ovuláció: ma";
    if (days > 0) return `Ovuláció: ${days} nap múlva`;
    return null;
  })();

  return (
    <div className="flex flex-col items-center p-4 relative h-full">
      {/* Settings button */}
      <button
        className="absolute top-4 right-4 text-gray-500 dark:text-gray-400"
        onClick={() => setShowSettings(true)}
        aria-label="Beállítások"
      >
        <MdSettings size={24} />
      </button>

      {/* Calendar */}
      <DayPicker
        month={month}
        onMonthChange={setMonth}
        modifiers={modifiers}
        modifiersClassNames={{
          period: "day-period",
          predicted: "day-predicted",
          ovulation: "day-ovulation",
        }}
        showOutsideDays={false}
        className="w-full max-w-sm"
      />

      {/* Info strip */}
      <div className="w-full max-w-sm mt-2 space-y-1">
        <p className="text-sm font-semibold text-center text-theme_primary">
          {infoText}
        </p>
        {nextEvent && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {nextEvent}
          </p>
        )}
        {/* Notes for active cycle */}
        {cycleInfo.isActive && cycles[0] && (
          <NoteEditor cycle={cycles[0]} />
        )}
      </div>

      {/* Color legend */}
      <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap justify-center">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-600 inline-block" /> Ciklus
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm border-2 border-dashed border-pink-300 inline-block" /> Várható
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Ovuláció
        </span>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        {cycleInfo.isActive ? (
          <button
            onClick={handleEndPeriod}
            disabled={isPending}
            className="rounded-full size-14 bg-gray-500 text-white shadow-lg flex items-center justify-center text-xs font-bold text-center leading-tight px-1"
          >
            Vége
          </button>
        ) : (
          <button
            onClick={() => setShowStartConfirm(true)}
            disabled={isPending}
            className="rounded-full size-14 bg-red-500 text-white shadow-lg flex items-center justify-center"
            aria-label="Ciklus kezdete"
          >
            <PiFlowerLotus size={24} />
          </button>
        )}
      </div>

      {/* Start period confirmation dialog */}
      {showStartConfirm && (
        <dialog
          open
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 w-full h-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-xs w-full mx-4 shadow-xl">
            <p className="text-center font-semibold mb-4">
              Ma kezdődött a ciklus?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStartConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
              >
                Mégsem
              </button>
              <button
                onClick={handleStartPeriod}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold"
              >
                Igen
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Settings dialog */}
      {showSettings && (
        <PeriodSettingsDialog
          settings={settings}
          latestCycleId={cycles[0]?.id}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// Inline note editor for the active cycle
function NoteEditor({ cycle }: { cycle: PeriodCycle }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(cycle.notes ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await updatePeriodCycle(cycle.id, { notes: value });
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="flex gap-2 mt-1">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="flex-1 text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Megjegyzés ehhez a ciklushoz..."
          disabled={isPending}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="w-full text-left text-sm text-gray-500 dark:text-gray-400 mt-1 italic truncate"
    >
      {value || "+ Megjegyzés hozzáadása..."}
    </button>
  );
}
```

- [ ] **Step 3: Verify the page renders**

```bash
npm run dev
```

Open `http://localhost:3000/period`. Expected: calendar renders with month navigation, no console errors.

- [ ] **Step 4: Commit**

```bash
git add app/period/PeriodCalendar.tsx app/period/period-calendar.css
git commit -m "feat: add PeriodCalendar client component with react-day-picker"
```

---

### Task 11: Create PeriodSettingsDialog

**Files:**
- Create: `app/period/PeriodSettingsDialog.tsx`

**Dependency note:** The "Értesítések engedélyezése" button uses `process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY`. This env var is configured in Task 13 (Chunk 6). If you test the notification button before completing Chunk 6, the subscribe call will fail silently with no visible error. The rest of the dialog (settings save, delete cycle) works independently.

- [ ] **Step 1: Create `app/period/PeriodSettingsDialog.tsx`**

```tsx
"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { PeriodSettings } from "../__backend/period.types";
import {
  upsertPeriodSettings,
  deletePeriodCycle,
} from "../__backend/PeriodService";

type Props = {
  settings: PeriodSettings;
  latestCycleId?: string;
  onClose: () => void;
};

type FormValues = {
  cycleLength: number;
  periodDuration: number;
};

export default function PeriodSettingsDialog({
  settings,
  latestCycleId,
  onClose,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [notifStatus, setNotifStatus] = useState<
    "idle" | "loading" | "done" | "denied"
  >("idle");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      cycleLength: settings.cycleLength,
      periodDuration: settings.periodDuration,
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      await upsertPeriodSettings({
        cycleLength: Number(values.cycleLength),
        periodDuration: Number(values.periodDuration),
      });
      onClose();
    });
  }

  async function handleEnableNotifications() {
    setNotifStatus("loading");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setNotifStatus("denied");
      return;
    }
    try {
      const sw = await navigator.serviceWorker.ready;
      const sub = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      await upsertPeriodSettings({ pushSubscription: JSON.stringify(sub) });
      setNotifStatus("done");
    } catch (e) {
      console.error("Push subscription failed:", e);
      setNotifStatus("idle");
    }
  }

  function handleDeleteLatestCycle() {
    if (!latestCycleId) return;
    startTransition(async () => {
      await deletePeriodCycle(latestCycleId);
      setShowDeleteConfirm(false);
      onClose();
    });
  }

  const isSubscribed = Boolean(settings.pushSubscription);

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 w-full h-full"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h2 className="text-lg font-bold mb-4">Ciklus beállítások</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Ciklus hossza (nap)
            </label>
            <input
              type="number"
              min={20}
              max={45}
              {...register("cycleLength", { valueAsNumber: true })}
              className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Menstruáció hossza (nap)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              {...register("periodDuration", { valueAsNumber: true })}
              className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Notification button */}
          <div>
            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={isSubscribed || notifStatus === "loading" || notifStatus === "done"}
              className="w-full py-2 rounded-lg text-sm font-medium bg-theme_primary text-white disabled:opacity-60"
            >
              {isSubscribed || notifStatus === "done"
                ? "✓ Értesítések bekapcsolva"
                : notifStatus === "loading"
                  ? "Folyamatban..."
                  : notifStatus === "denied"
                    ? "Értesítések letiltva a böngészőben"
                    : "Értesítések engedélyezése"}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
            >
              Mégsem
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 rounded-lg bg-theme_primary text-white text-sm font-semibold"
            >
              Mentés
            </button>
          </div>
        </form>

        {/* Delete last cycle */}
        {latestCycleId && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {showDeleteConfirm ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600 text-center">
                  Biztosan törlöd az utolsó ciklust?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm"
                  >
                    Mégsem
                  </button>
                  <button
                    onClick={handleDeleteLatestCycle}
                    disabled={isPending}
                    className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold"
                  >
                    Törlés
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 rounded-lg text-sm text-red-600 border border-red-300 dark:border-red-800"
              >
                Utolsó ciklus törlése
              </button>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
```

- [ ] **Step 2: Verify the settings dialog opens**

Run `npm run dev`, navigate to `/period`, tap the gear icon. Expected: dialog opens with fields pre-filled.

- [ ] **Step 3: Commit**

```bash
git add app/period/PeriodSettingsDialog.tsx
git commit -m "feat: add PeriodSettingsDialog with settings, notifications, and delete"
```

---

## Chunk 5: Home Page Update

### Task 12: Add Ciklus panel button to home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update `app/page.tsx`**

Add the import at the top (with the other react-icons imports):
```ts
import { PiFemale } from "react-icons/pi";
```

Change the grid `className` from `grid-cols-2 grid-rows-3` to `grid-cols-2 grid-rows-4`:
```tsx
<div className="font-extrabold text-center w-full gap-3 grid grid-cols-2 grid-rows-4 overflow-auto px-4 pt-4 pb-2">
```

Add the new panel button as the 7th item (after the vacation button, as a full-width last row):
```tsx
<PanelButton link="/period" className="col-span-2">
  <PiFemale size={ICON_SIZE} />
  <p>Ciklus</p>
</PanelButton>
```

**Note:** `PanelButton` currently doesn't accept a `className` prop. Replace the entire contents of `app/__components/PanelButton.tsx` with the following (the file is 12 lines — the only change is adding the optional `className` prop):

```tsx
import Link from "next/link";

export const PanelButton = ({
  children,
  link,
  className,
}: {
  children: React.ReactNode;
  link: string;
  className?: string;
}) => {
  return (
    <Link
      href={link}
      className={`bg-theme_primary p-2 rounded-lg w-full h-16 text-center flex gap-2 items-center justify-between ${className ?? ""}`}
    >
      {children}
    </Link>
  );
};
```

- [ ] **Step 2: Verify home page renders correctly**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: 7 panel buttons, "Ciklus" button is full-width in the last row.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/__components/PanelButton.tsx
git commit -m "feat: add Ciklus panel button to home page"
```

---

## Chunk 6: Push Notification Infrastructure

### Task 13: Generate VAPID keys and create Lambda function

**Files:**
- Create: `amplify/functions/period-notifier/resource.ts`
- Create: `amplify/functions/period-notifier/handler.ts`
- Create: `amplify/functions/period-notifier/package.json`

- [ ] **Step 1: Generate VAPID keys** (one-time, developer machine)

```bash
npx web-push generate-vapid-keys
```

Save the output. You will get a public key and a private key. These are permanent — generate once and store safely.

- [ ] **Step 2: Store secrets — only the private key and subject are secrets**

The VAPID **public** key is safe to embed in client-side code; it does not need to be secret. Only the private key and subject must be protected.

```bash
npx ampx secret set VAPID_PRIVATE_KEY
# paste the private key when prompted

npx ampx secret set VAPID_SUBJECT
# enter: mailto:your@email.com
```

- [ ] **Step 3: Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — REQUIRED in two places**

**3a. Local dev** — create or update `.env.local` in the project root (this file is git-ignored):
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<paste the public key here>
```

Also export it in your shell **before** running `npx ampx sandbox`, because `.env.local` is loaded by Next.js at runtime but NOT by the Amplify CLI process at CDK synth time. Without this, the Lambda's `VAPID_PUBLIC_KEY` env var will be an empty string in sandbox:
```bash
export NEXT_PUBLIC_VAPID_PUBLIC_KEY=<paste the public key here>
```

**3b. Production (REQUIRED)** — in the AWS Console:
1. Go to AWS Amplify → your HomeKeeper app → App settings → Environment variables
2. Add variable: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = `<public key>`
3. Save and redeploy

Without step 3b, the browser push subscription will silently fail in production because `process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY` will be `undefined` in the Next.js build.

The Lambda also needs the public key for the `web-push` library. Add it as a plain Lambda env var in `resource.ts` (next step — not a secret, no SSM cost).

- [ ] **Step 4: Create `amplify/functions/period-notifier/resource.ts`**

```ts
import { defineFunction, secret } from "@aws-amplify/backend";

export const periodNotifier = defineFunction({
  name: "period-notifier",
  environment: {
    // VAPID_PUBLIC_KEY is not a secret (it's safe to expose), but we set it
    // here as a plain env var so the Lambda can pass it to web-push.
    // Its value is the same as NEXT_PUBLIC_VAPID_PUBLIC_KEY.
    VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
    VAPID_PRIVATE_KEY: secret("VAPID_PRIVATE_KEY"),
    VAPID_SUBJECT: secret("VAPID_SUBJECT"),
  },
});
```

- [ ] **Step 5: Create `amplify/functions/period-notifier/package.json`**

```json
{
  "name": "period-notifier",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "web-push": "^3.6.7"
  },
  "devDependencies": {
    "@types/web-push": "^3.6.3"
  }
}
```

- [ ] **Step 6: Create `amplify/functions/period-notifier/handler.ts`**

```ts
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import webpush from "web-push";
import type { Schema } from "../../data/resource";
import { addDays, computeCycleInfo } from "../../../app/period/cycleLogic";

// Amplify injects AMPLIFY_DATA_GRAPHQL_ENDPOINT when grantReadWrite is called in backend.ts
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: process.env.AMPLIFY_DATA_GRAPHQL_ENDPOINT!,
      region: process.env.AWS_REGION!,
      defaultAuthMode: "iam",
    },
  },
});

const client = generateClient<Schema>({ authMode: "iam" });

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const PERIOD_SETTINGS_ID = "main";

export const handler = async () => {
  const today = new Date().toISOString().slice(0, 10);

  // 1. Fetch settings
  const { data: settings } = await client.models.PeriodSettings.get({
    id: PERIOD_SETTINGS_ID,
  });
  if (!settings || !settings.pushSubscription) return;

  const cycleSettings = {
    cycleLength: settings.cycleLength,
    periodDuration: settings.periodDuration,
  };

  // 2. Fetch latest cycle (sorted desc, limit 1)
  const { data: allCycles } = await client.models.PeriodCycle.list({
    limit: 100,
  });
  const cycles = allCycles
    .map((c) => ({ id: c.id, startDate: c.startDate, endDate: c.endDate ?? undefined }))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  // 3. Compute cycle state
  const info = computeCycleInfo(cycles, cycleSettings, today);
  const sub = JSON.parse(settings.pushSubscription);

  async function sendPush(body: string) {
    try {
      await webpush.sendNotification(sub, JSON.stringify({ title: "HomeKeeper", body }));
    } catch (e) {
      console.error("Push failed:", e);
    }
  }

  // 4. Check notification triggers
  // Trigger 1: 2 days before predicted next period
  if (info.nextPeriodStart) {
    const daysUntil = Math.round(
      (new Date(info.nextPeriodStart + "T00:00:00").getTime() -
        new Date(today + "T00:00:00").getTime()) / 86_400_000
    );
    if (daysUntil === 2) {
      await sendPush("Holnapután várható a menstruáció kezdete");
    }
  }

  // Trigger 2: Last period day — send confirmation + auto-close if still open
  if (cycles[0]) {
    const lastDay = addDays(cycles[0].startDate, cycleSettings.periodDuration - 1);
    if (today === lastDay) {
      await sendPush("Ma ért véget a ciklus?");
      // Auto-close if endDate still null
      if (!cycles[0].endDate) {
        await client.models.PeriodCycle.update({ id: cycles[0].id, endDate: lastDay });
      }
    }
  }

  // Trigger 3: Ovulation day
  if (info.ovulationDay === today) {
    await sendPush("Ma van az ovuláció napja");
  }
};
```

- [ ] **Step 7: Verify Lambda bundles correctly**

The handler imports `cycleLogic.ts` from `app/period/` across the directory boundary. Deploy the sandbox and verify the Lambda can be invoked without module resolution errors:

```bash
npx ampx sandbox
```

Then in the AWS Console → Lambda → `period-notifier` → Test, create a test event `{}` and invoke it. Expected: the function executes (may return early if no push subscription is set) without `Cannot find module` errors.

- [ ] **Step 8: Commit**

```bash
git add amplify/functions/
git commit -m "feat: add period-notifier Lambda function"
```

---

### Task 14: Wire Lambda into Amplify backend

**Files:**
- Modify: `amplify/backend.ts`

- [ ] **Step 1: Add new imports to the top of `amplify/backend.ts`**

Do NOT replace the file. Make three targeted edits — modify existing imports, update defineBackend, and append at the bottom.

**Edit 1 — modify existing imports at the top of the file:**

Merge `Role` and `ServicePrincipal` into the existing `aws-cdk-lib/aws-iam` import (line 4) to avoid a duplicate-import lint error:

```ts
// Change this existing line:
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
// To:
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
```

Then add two new import lines directly after the existing imports:

```ts
import { periodNotifier } from "./functions/period-notifier/resource";
import { CfnSchedule } from "aws-cdk-lib/aws-scheduler";
```

**Edit 2 — add `periodNotifier` to `defineBackend`** — change:

```ts
const backend = defineBackend({
  auth,
  data,
});
```

to:

```ts
const backend = defineBackend({
  auth,
  data,
  periodNotifier,
});
```

**Edit 3 — append these lines at the very end of the file** (after all existing sandbox code — do not touch anything above):

```ts
// --- Period notifier: IAM data access ---
backend.data.grantReadWrite(backend.periodNotifier.resources.lambda);

// --- Period notifier: EventBridge daily schedule (08:00 Europe/Budapest) ---
const notifierStack = backend.periodNotifier.resources.lambda.stack;

const schedulerRole = new Role(notifierStack, "PeriodNotifierSchedulerRole", {
  assumedBy: new ServicePrincipal("scheduler.amazonaws.com"),
});
backend.periodNotifier.resources.lambda.grantInvoke(schedulerRole);

new CfnSchedule(notifierStack, "PeriodNotifierSchedule", {
  scheduleExpression: "cron(0 8 * * ? *)",
  scheduleExpressionTimezone: "Europe/Budapest",
  flexibleTimeWindow: { mode: "OFF" },
  target: {
    arn: backend.periodNotifier.resources.lambda.functionArn,
    roleArn: schedulerRole.roleArn,
  },
});
```

- [ ] **Step 2: Verify sandbox deploys**

```bash
npx ampx sandbox
```

Expected: sandbox deploys successfully, Lambda and EventBridge schedule appear in the AWS Console.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Final commit**

```bash
git add amplify/backend.ts
git commit -m "feat: wire period-notifier Lambda with IAM access and EventBridge daily schedule"
```

---

## Testing the Full Flow (Manual)

After all tasks are complete:

1. Open the app at `http://localhost:3000` — verify "Ciklus" panel button appears
2. Navigate to `/period` — verify calendar renders
3. Tap the FAB (red flower button) — confirm start dialog appears, confirm
4. Verify today appears as a red day on the calendar
5. Open settings (gear icon) — verify fields are pre-filled, save works
6. Test on iOS (Safari → Add to Home Screen) — tap "Értesítések engedélyezése" in settings — confirm system prompt appears
