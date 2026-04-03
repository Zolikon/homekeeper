# Period Calendar — Design Spec

**Date:** 2026-03-15
**Status:** Approved
**Route:** `/period`

---

## Overview

A mobile-first menstrual cycle tracker integrated into HomeKeeper. Tracks past periods, predicts future cycles and ovulation, and sends browser push notifications for key cycle events. Single-user (one woman), no multi-tenancy required.

---

## Data Models

Two new DynamoDB models added to `amplify/data/resource.ts`, both using `allow.authenticated()` auth.

### `PeriodSettings` (singleton, id = `"main"`)

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | ✓ | always `"main"` |
| cycleLength | integer | ✓ | default 28 |
| periodDuration | integer | ✓ | default 5 — number of days the period lasts, starting from startDate (inclusive) |
| pushSubscription | string | — | JSON-serialized Web Push subscription (~300–500 bytes, well within DynamoDB limits) |

### `PeriodCycle`

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | ✓ | randomUUID |
| startDate | string | ✓ | `"YYYY-MM-DD"` |
| endDate | string | — | `"YYYY-MM-DD"`, null until confirmed |
| notes | string | — | free text, one note per cycle |

---

## Cycle Logic

### "Active period" definition

A period is considered **active** when all of the following hold:
- A `PeriodCycle` record exists where `startDate <= today`
- Its `endDate` is null
- `today <= startDate + periodDuration − 1` (i.e. within the predicted window)

If `endDate` is null but `today > startDate + periodDuration − 1`, the period is **stale** — treated as ended on the predicted end date (`startDate + periodDuration − 1`) for all display and logic purposes. The "Ciklus vége" FAB is hidden; "Ciklus kezdete" is shown again. The Lambda auto-writes `endDate` to the predicted end date when it fires the end-of-cycle confirmation notification (so the record is cleaned up in the DB at that point).

### Predictions

All predictions are computed from settings + last cycle start date. Adaptive mode (averaging history) is out of scope for v1 but the data model supports it.

`periodDuration = 5` means the period lasts days 1–5 inclusive (e.g. Mar 1–5). The last period day is `startDate + periodDuration − 1`.

| Event | Formula | Example (startDate=Mar 1, cycleLength=28, periodDuration=5) |
|---|---|---|
| Period days | startDate to startDate + periodDuration − 1 (inclusive) | Mar 1 – Mar 5 |
| Auto period end (default) | startDate + periodDuration − 1 | Mar 5 |
| Ovulation day | startDate + (cycleLength − 14) | Mar 15 |
| Fertile window | ovulation − 5 days to ovulation + 1 day | Mar 10 – Mar 16 |
| Next period start (predicted) | startDate + cycleLength | Mar 29 |

### Settings changes

Changing `cycleLength` or `periodDuration` affects only future predictions. Past recorded `PeriodCycle` records are not modified.

### Deleting / correcting entries

A **"Utolsó ciklus törlése"** button is available in the settings dialog. It deletes the most recent `PeriodCycle` record entirely. This is the only correction mechanism — there is no partial editing of individual days via the calendar.

---

## UI / UX

### Route: `/period`

**Dependency:** Add `react-day-picker@9` to `package.json` (`npm install react-day-picker@9`). React 19 compatibility is satisfied by v9.

**Calendar area — `react-day-picker` v9:**
- Classic 7-column monthly grid
- Month navigation: prev/next arrows, current month label
- Opens to the **current month** on every visit (not last period month)
- Color coding (first match wins):
  - 🔴 Red fill — confirmed period days
  - 🩷 Pink dashed border — predicted future period days (including the predicted start day)
  - 🟢 Green dot — ovulation day (confirmed or predicted)
  - Subtle ring on today

**Info strip** (below calendar, always reflects today regardless of which month is displayed):
- When period is active: "Ciklus X. napja"
- When no active period (or stale): "Következő ciklus: N nap múlva"
- Next upcoming event ("Ovuláció: 3 nap múlva")
- Notes for the active cycle — tappable to edit inline

**FAB actions** (bottom-right, consistent with other pages):
- "Ciklus kezdete" — marks today as period start; shows confirmation dialog. Shown when no period is currently active (including stale state).
- "Ciklus vége" — visible only while a period is active (`endDate` is null AND today is within predicted window); marks today as end.

**Settings dialog** (gear icon top-right):
- Set cycle length and period duration
- "Értesítések engedélyezése" button (see Notifications section)
- "Utolsó ciklus törlése" danger button

### Home page

New 7th panel button. The existing `grid-cols-2 grid-rows-3` layout (6 buttons) gains a new full-width row: `grid-rows-4`, last row `col-span-2`. Icon: `PiFemale` (react-icons v5). Label: `"Ciklus"`. No badge or cycle status is shown on the home panel in v1 — the panel is a plain navigation button.

---

## Service Layer

`app/__backend/PeriodService.ts` — `"use server"` module following the existing pattern. Calls `revalidatePath('/period')` after all mutations.

- `getPeriodSettings(): Promise<PeriodSettings | null>`
- `upsertPeriodSettings(data): Promise<void>`
- `listPeriodCycles(): Promise<PeriodCycle[]>` — sorted by startDate desc; returns up to the Amplify default of 100 records (acceptable for years of use)
- `createPeriodCycle(startDate: string): Promise<void>`
- `updatePeriodCycle(id: string, data: Partial<PeriodCycle>): Promise<void>`
- `deletePeriodCycle(id: string): Promise<void>`

`app/period/page.tsx` sets `export const dynamic = 'force-dynamic'`.

---

## Push Notifications

### PWA / Service Worker setup

**Dependency:** No additional library needed — use a manual `public/sw.js`.

Add to `app/layout.tsx`:
```html
<link rel="manifest" href="/manifest.json" />
```

Create `public/manifest.json` with minimal PWA metadata (name, icons, `display: "standalone"`).

Create `public/sw.js` with a `push` event handler:
```js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'HomeKeeper', {
      body: data.body,
      icon: '/icon-192.png',
      data: { url: '/period' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
```

Register the Service Worker client-side in `PeriodCalendar.tsx` on mount (once).

### VAPID keys

Generate once with `npx web-push generate-vapid-keys`. Store as:
- `VAPID_PRIVATE_KEY` — Amplify secret (Lambda env var only, never exposed to client)
- `VAPID_SUBJECT` — Amplify secret (e.g. `mailto:admin@example.com`)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — set in `.env.local` for local dev (git-ignored, do not commit) and in Amplify Hosting environment variables for production; required by the browser subscription API

### Lambda: `amplify/functions/period-notifier/handler.ts`

**DynamoDB client pattern:** The Lambda uses IAM auth, not Cognito cookies. It must configure Amplify with IAM credentials:

```ts
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';

Amplify.configure({ ... }); // outputs from amplify_outputs
const client = generateClient<Schema>({ authMode: 'iam' });
```

This is different from the server-side cookie-based client used in other services.

**IAM permissions:** In `amplify/backend.ts`:
```ts
backend.data.grantReadWrite(backend.periodNotifier.resources.lambda); // write needed for auto-closing stale cycles
```

**Lambda logic:**
1. Read `PeriodSettings` (singleton)
2. Read latest `PeriodCycle`
3. Compute today's events using the same formulas as `cycleLogic.ts`
4. If today matches a notification trigger → send Web Push to `pushSubscription` using the `web-push` npm package
5. If today is the last period day and `endDate` is null → also write `endDate` to auto-close the cycle

### EventBridge Scheduler

Defined via CDK L1 construct in `amplify/backend.ts`:

```ts
import { CfnSchedule } from 'aws-cdk-lib/aws-scheduler';
import { aws_iam as iam } from 'aws-cdk-lib';

const schedulerRole = new iam.Role(stack, 'SchedulerRole', {
  assumedBy: new iam.ServicePrincipal('scheduler.amazonaws.com'),
});
backend.periodNotifier.resources.lambda.grantInvoke(schedulerRole);

new CfnSchedule(stack, 'PeriodNotifierSchedule', {
  scheduleExpression: 'cron(0 8 * * ? *)',
  scheduleExpressionTimezone: 'Europe/Budapest',
  flexibleTimeWindow: { mode: 'OFF' },
  target: {
    arn: backend.periodNotifier.resources.lambda.functionArn,
    roleArn: schedulerRole.roleArn,
  },
});
```

### Notification events

| Trigger | Message |
|---|---|
| 2 days before predicted period start | "Holnapután várható a menstruáció kezdete" |
| Last period day (`startDate + periodDuration − 1`) | "Ma ért véget a ciklus?" |
| Ovulation day | "Ma van az ovuláció napja" |

### Subscription flow

1. In the settings dialog, a visible **"Értesítések engedélyezése"** button triggers the subscription request inside a click handler (browsers require a user gesture — auto-prompts on page load are blocked)
2. If permission is granted, subscribes via the Web Push API using `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
3. Serialized subscription saved to `PeriodSettings.pushSubscription`
4. Button changes to "Értesítések bekapcsolva" once subscribed

### iOS setup guide (one-time, for the end user)

Push notifications on iOS only work when the app is installed as a PWA. Here's how to set it up:

**Step 1 — Open the app in Safari**
Open the HomeKeeper URL in **Safari** (not Chrome, not Firefox — it must be Safari). Make sure you're logged in.

**Step 2 — Add to Home Screen**
Tap the **Share** button at the bottom of the screen (the box with an arrow pointing up).
Scroll down in the share sheet and tap **"Add to Home Screen"**.
Tap **"Add"** in the top-right corner. A HomeKeeper icon will appear on your home screen.

**Step 3 — Open from the Home Screen icon**
Close Safari. Find the HomeKeeper icon on your home screen and tap it.
The app will open in full-screen mode (no Safari address bar) — this means it's running as a PWA.

**Step 4 — Enable notifications**
Go to the **Ciklus** page and tap the gear icon ⚙️ in the top-right corner.
Tap **"Értesítések engedélyezése"**.
When iOS asks "Allow HomeKeeper to send notifications?" — tap **Allow**.

That's it. You'll now receive notifications even when the app is closed.

> **Important:** Always open the app from the Home Screen icon, not from Safari. Notifications only work in the PWA version.
>
> **Requirement:** iOS 16.4 or later.

---

## File Structure

```
app/
  period/
    page.tsx                  # Server component, fetches settings + cycles; force-dynamic
    PeriodCalendar.tsx        # "use client" — calendar + FAB + info strip + SW registration
    PeriodSettingsDialog.tsx  # "use client" — cycle length, duration, notifications, delete
    cycleLogic.ts             # Pure cycle calculation functions (not a hook)
  __backend/
    PeriodService.ts          # "use server" — CRUD for PeriodCycle + PeriodSettings
    period.types.ts           # TypeScript types

amplify/
  functions/
    period-notifier/
      handler.ts              # Daily Lambda: reads DB, computes events, sends Web Push
  data/
    resource.ts               # + PeriodSettings, PeriodCycle models
  backend.ts                  # + Lambda IAM grant + CfnSchedule

public/
  sw.js                       # Service Worker: push handler + notification click handler
  manifest.json               # PWA manifest
  icon-192.png                # PWA icon (required for notifications)
```

---

## Out of Scope (v1)

- Adaptive prediction based on cycle history (data is stored, logic not yet implemented)
- Multiple users / profiles
- Temperature or symptom tracking beyond the single notes field
- Fertile window notifications (only ovulation day and period start/end events)
- Home panel badge showing cycle status
