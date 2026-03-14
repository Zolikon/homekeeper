# Timeline Proportional Layout Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the simple sorted-list timeline in `DayTimeline.tsx` with a proportional time-based layout where events are positioned and sized according to their actual times, overlapping events are placed side by side, and the view auto-scrolls to the current time for today's day.

**Architecture:** A single absolute-positioned container holds all events. The left column shows hour labels; the right column shows grid lines and event cards. Events are positioned with `top` (from start time) and `height` (from duration). Overlap detection assigns `col` and `totalCols` per event to split the horizontal space.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3.4, react-icons v5

---

## Chunk 1: Rewrite DayTimeline.tsx

### Task 1: Implement the proportional timeline layout

**Files:**
- Modify: `app/vacation/programs/DayTimeline.tsx`

**Design constants:**
- `PX_PER_HOUR = 72` — vertical pixels per hour
- `PX_PER_MIN = PX_PER_HOUR / 60` — derived
- `DEFAULT_START = 8 * 60` — default visible range start (8:00) in minutes
- `DEFAULT_END = 22 * 60` — default visible range end (22:00) in minutes
- `MIN_DURATION = 30` — minutes assigned to events with no `endTime`
- `MIN_HEIGHT_PX = 28` — minimum card height in pixels
- `LABEL_COL_WIDTH = 44` — width of the left time-label column in pixels
- `EVENT_GAP = 6` — horizontal gap between adjacent event columns in pixels

**Key logic:**

_Range calculation_ — compute the actual rendered range from items, extending beyond the 8–22 default only if an event falls outside it:
```typescript
const allMins = items.flatMap(item => {
  const start = toMin(item.startTime);
  const end = item.endTime ? toMin(item.endTime) : start + MIN_DURATION;
  return [start, end];
});
const rangeStart = allMins.length > 0 ? Math.min(DEFAULT_START, ...allMins) : DEFAULT_START;
const rangeEnd   = allMins.length > 0 ? Math.max(DEFAULT_END,   ...allMins) : DEFAULT_END;
const startHour  = Math.floor(rangeStart / 60);
const endHour    = Math.ceil(rangeEnd / 60);
const totalHeight = (endHour - startHour) * PX_PER_HOUR;
```

_Position helpers:_
```typescript
function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
// top offset in px from the top of the timeline container
const topPx = (timeStr: string) => (toMin(timeStr) - startHour * 60) * PX_PER_MIN;
// height in px (min MIN_HEIGHT_PX)
const heightPx = (startStr: string, endStr?: string) =>
  Math.max(((endStr ? toMin(endStr) : toMin(startStr) + MIN_DURATION) - toMin(startStr)) * PX_PER_MIN, MIN_HEIGHT_PX);
```

_Overlap column assignment_ — greedy algorithm; each item gets `col` (0-based) and `totalCols` (how wide the column group is):
```typescript
type LaidOutItem = TimelineItem & { col: number; totalCols: number; endMin: number };

function assignColumns(items: TimelineItem[]): LaidOutItem[] {
  const withEnd = items.map(item => ({
    ...item,
    endMin: item.endTime ? toMin(item.endTime) : toMin(item.startTime) + MIN_DURATION,
    col: 0,
    totalCols: 1,
  }));
  withEnd.sort((a, b) => toMin(a.startTime) - toMin(b.startTime));

  const colEnds: number[] = [];
  withEnd.forEach(item => {
    const startMin = toMin(item.startTime);
    let col = colEnds.findIndex(e => e <= startMin);
    if (col === -1) col = colEnds.length;
    colEnds[col] = item.endMin;
    item.col = col;
  });

  // totalCols = highest col number among all concurrent items + 1
  withEnd.forEach(item => {
    const startMin = toMin(item.startTime);
    const maxConcurrent = withEnd
      .filter(o => toMin(o.startTime) < item.endMin && o.endMin > startMin)
      .reduce((max, o) => Math.max(max, o.col), 0);
    item.totalCols = maxConcurrent + 1;
  });

  return withEnd;
}
```

_TimelineItem type_ — add `endTime` field so helpers can read it without casting:
```typescript
type TimelineItem =
  | { type: "program"; id: string; startTime: string; endTime?: string; data: VacationProgram }
  | { type: "flight";  id: string; startTime: string; endTime?: string; data: FlightCard };
```

_Scroll to current time on today_ — ref on the scroll container, fired once on mount:
```typescript
const scrollRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (!isToday || !scrollRef.current) return;
  const nowTop = (currentMinutes - startHour * 60) * PX_PER_MIN;
  const h = scrollRef.current.clientHeight;
  scrollRef.current.scrollTo({ top: Math.max(0, nowTop - h / 2), behavior: "smooth" });
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // intentionally runs once on mount only
```

_Open-ended events_ — dashed bottom border signals the end time is unknown:
```tsx
style={{ borderBottomStyle: openEnded ? "dashed" : "solid" }}
```

**JSX structure:**

```tsx
<div className="flex-1 overflow-y-auto relative pb-20" ref={scrollRef}>
  {items.length === 0 ? (
    <EmptyState />
  ) : (
    <div className="relative" style={{ height: totalHeight }}>
      {/* Hour labels */}
      {hours.map(h => (
        <div key={h} className="absolute text-right text-xs text-gray-400 font-medium select-none"
          style={{ top: (h - startHour) * PX_PER_HOUR, left: 0, width: LABEL_COL_WIDTH,
                   transform: "translateY(-50%)", paddingRight: 8, lineHeight: 1 }}>
          {h}:00
        </div>
      ))}

      {/* Events + grid */}
      <div className="absolute" style={{ left: LABEL_COL_WIDTH, right: 0, top: 0, height: totalHeight }}>
        {/* Grid: solid line every hour, dashed every half-hour */}
        {hours.map(h => ( ... ))}

        {/* Current time indicator */}
        {isToday && nowMin >= startHour * 60 && nowMin <= endHour * 60 && (
          <div className="absolute left-0 right-0 z-10 pointer-events-none"
               style={{ top: (currentMinutes - startHour * 60) * PX_PER_MIN }}>
            <div className="absolute inset-0 h-0.5 bg-red-500" />
            <div className="absolute -left-1 -top-1.5 w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
        )}

        {/* Event cards */}
        {laidOut.map(item => {
          const colW = 100 / item.totalCols;
          const left = `calc(${item.col * colW}% + ${EVENT_GAP}px)`;
          const width = `calc(${colW}% - ${EVENT_GAP * 2}px)`;
          const top = topPx(item.startTime);
          const height = heightPx(item.startTime, item.endTime);
          // ... program card or flight card JSX
        })}
      </div>
    </div>
  )}

  {/* FAB via MenuHolder (unchanged) */}
</div>
```

**Program card styling** (active / past / future — same as before but more compact text for small heights):
- `isActive`: `bg-theme_primary/10 border-theme_primary dark:bg-theme_primary/20`
- `isPast`: `bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-50`
- default: `bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700`

**Flight card styling**: `bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800` (blue tint, links to flight page via `<Link>`)

Show `program.address` and `program.notes` only when `height > 50` (card is tall enough to display them).

Show `fc.airline` / `fc.flightNumber` only when `height > 50`.

**Steps:**

- [ ] **Step 1: Update `TimelineItem` type** — add `endTime?: string` to both union members

- [ ] **Step 2: Add layout constants** — `PX_PER_HOUR`, `PX_PER_MIN`, `DEFAULT_START`, `DEFAULT_END`, `MIN_DURATION`, `MIN_HEIGHT_PX`, `LABEL_COL_WIDTH`, `EVENT_GAP`

- [ ] **Step 3: Add `assignColumns` function** — as described above (pure function, no side-effects)

- [ ] **Step 4: Add `scrollRef` and scroll-to-current-time `useEffect`**

- [ ] **Step 5: Compute derived values** — `items`, `allMins`, `rangeStart/End`, `startHour/endHour`, `totalHeight`, `hours`, `laidOut`

- [ ] **Step 6: Rewrite JSX** — outer scroll div with ref, relative inner container, hour labels, grid lines, current-time indicator, event cards mapped from `laidOut`

- [ ] **Step 7: Program card** — absolute positioned div; show edit/delete buttons; conditionally show address and notes based on card height; dashed bottom border for open-ended events

- [ ] **Step 8: Flight card** — absolute positioned `<Link>`; blue tint; airplane icon; conditionally show airline/flightNumber

- [ ] **Step 9: Remove old timeline dot markup** — delete the old `<div className="relative ml-4">` list and dot divs

- [ ] **Step 10: Verify build compiles** — run `npm run build` (or check for TypeScript errors)

- [ ] **Step 11: Commit**
```bash
git add app/vacation/programs/DayTimeline.tsx
git commit -m "feat: proportional time-based timeline layout with overlap detection"
```
