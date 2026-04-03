# Bottom Navigation Bar — Mobile Layout Redesign

**Date:** 2026-04-03
**Status:** Approved

## Problem

Two mobile UX issues on the shopping list page (and globally):

1. **Footer not visible** — root layout uses percentage-based heights (`h-[10%]`, `h-[85%]`, `h-[5%]`). On mobile browsers, the dynamic viewport (address bar appearing/disappearing) causes the footer to be hidden below the fold.
2. **FABs overlap list content** — the `MenuHolder` uses `fixed bottom-14 right-4`, overlapping the bottom of the scrollable shopping list when it's long enough to scroll.

## Solution

Replace the floating FAB cluster (`MenuHolder`) and the footer with a **fixed-height bottom navigation bar** rendered inline in each page/layout's flex column. Switch root layout to `100dvh` (dynamic viewport height) so it adapts correctly to mobile browser chrome.

## Layout Structure

**Before:**
```
body: h-screen flex-col overflow-hidden
  header:  h-[10%]  bg-theme_primary
  main:    h-[85%]  overflow-hidden
    [page content]
    MenuHolder: fixed bottom-14 right-4 (FAB cluster)
  footer:  h-[5%]   bg-theme_primary  ← hidden on mobile
```

**After:**
```
body: h-[100dvh] flex-col overflow-hidden
  header:    h-14 shrink-0  bg-theme_primary
  main:      flex-1 min-h-0 overflow-hidden
    [page content — structured as:]
    flex flex-col h-full
      [scrollable content area: flex-1 min-h-0 overflow-y-auto]
      BottomNav: h-14 shrink-0 bg-theme_primary  ← always visible
```

Key points:
- `100dvh` adapts to mobile browser chrome (dynamic viewport height)
- `main` uses `flex-1 min-h-0` — takes all remaining space between header and the page's bottom nav
- `BottomNav` is rendered **per page/layout** (not in root layout) — pages have different action sets
- Content never underlaps the nav bar — no fixed positioning, no padding hacks needed
- Footer removed; version info dropped
- Home page (`/`) and vacation sub-pages have no bottom nav — they already use inline navigation and have no `MenuHolder`

## BottomNav Component

New component: `app/__components/BottomNav.tsx`

- Renders `w-full h-14 bg-theme_primary flex items-center justify-around shrink-0`
- Accepts `children` (nav items)
- Each child: icon + label stacked (`flex flex-col items-center gap-0.5 text-white text-xs px-3`)
- Primary "Add" action gets a raised white circle: `bg-white rounded-full size-10 text-theme_primary -mt-4 shadow-lg flex items-center justify-center`

`MenuHolder` component is deleted — all usages are replaced.

## Per-Page Nav Bar Contents

| Page / Layout | Nav items (left → right) | File changed |
|---|---|---|
| `/shopping` | Home · Refresh · Show Hidden · **Add (+)** · Cards | `app/shopping/page.tsx` |
| `/recipes` | Home · **Add Recipe (+)** | `app/recipes/page.tsx` |
| `/recipe/[id]` | Home · Shopping · Edit · Delete | `app/recipe/[id]/page.tsx` |
| `/zooplus` | Home · **Add Item (+)** · Finalize Order | `app/zooplus/page.tsx` |
| `/info` | Home · **Add Info (+)** | `app/info/layout.tsx` |
| `/cards` | Home | `app/cards/layout.tsx` |

Note: `/info` currently has `AddInfoItem` in `app/info/layout.tsx` via `MenuHolder` — it moves into `BottomNav` there. `/cards` currently has `HomeButton` in `app/cards/layout.tsx` via `MenuHolder` — it moves into `BottomNav` there.

`app/shopping/page.tsx` currently returns a bare fragment (`<>`). It must become a `flex flex-col h-full` div wrapper so `BottomNav` pins to the bottom correctly (with `ShoppingList` as `flex-1 min-h-0`).

## DayTimeline FAB (Vacation Programs)

`app/vacation/programs/DayTimeline.tsx` uses `MenuHolder` for a floating Add Program button. Since vacation sub-pages do **not** get a global bottom nav, this FAB is replaced with an inline `fixed` button (no `MenuHolder` wrapper needed — the positioning is applied directly):

```tsx
<button
  onClick={...}
  className="fixed bottom-4 right-4 size-14 rounded-full bg-theme_primary text-white shadow-lg flex items-center justify-center z-50"
>
  <PiPlus className="text-2xl" />
</button>
```

This preserves the existing behavior while removing the `MenuHolder` dependency.

## Layout Files That Need Structural Updates

Pages/layouts that currently wrap content without height constraints need to become proper flex columns so `BottomNav` sits at the bottom. Specifically:

- `app/info/layout.tsx` — change outer `div` to `flex flex-col h-full`; remove `MenuHolder`, add `BottomNav`
- `app/cards/layout.tsx` — change outer `div` to `flex flex-col h-full`; remove `MenuHolder`, add `BottomNav`
- `app/shopping/layout.tsx` — already uses flex-col h-full pattern; verify scroll area still works
- `app/info/InfoList.tsx` — change `h-[50vh]` scroll div to `flex-1 min-h-0 overflow-y-auto` so it fills available space correctly

## Files Changed

| File | Change |
|---|---|
| `app/layout.tsx` | `h-[100dvh]`, `h-14 shrink-0` header, `flex-1 min-h-0` main, remove `<footer>` |
| `app/__components/BottomNav.tsx` | **New** — replaces MenuHolder |
| `app/__components/MenuHolder.tsx` | **Deleted** |
| `app/shopping/page.tsx` | `MenuHolder` → `BottomNav` |
| `app/recipes/page.tsx` | `MenuHolder` → `BottomNav` |
| `app/recipe/[id]/page.tsx` | `MenuHolder` → `BottomNav` |
| `app/zooplus/page.tsx` | `MenuHolder` → `BottomNav` |
| `app/info/layout.tsx` | `MenuHolder` → `BottomNav`; outer div → `flex flex-col h-full` |
| `app/cards/layout.tsx` | `MenuHolder` → `BottomNav`; outer div → `flex flex-col h-full` |
| `app/info/InfoList.tsx` | `h-[50vh]` → `flex-1 min-h-0 overflow-y-auto` |
| `app/vacation/programs/DayTimeline.tsx` | `MenuHolder` → inline `fixed` button |
| `app/zooplus/ZooplusList.tsx` | `h-2/3` → `flex-1 min-h-0 overflow-y-auto` |

## What Stays the Same

- Header appearance and content
- All button functionality (only the visual container changes)
- Shopping item design (checkbox, hide, delete flow)
- Category selector (type tabs) at the top of the shopping list
- Home page layout — no bottom nav added
- Vacation sub-pages (`/vacation`, `/vacation/programs`, `/vacation/flight-*`) — inline navigation unchanged
