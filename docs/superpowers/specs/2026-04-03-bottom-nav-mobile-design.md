# Bottom Navigation Bar — Mobile Layout Redesign

**Date:** 2026-04-03
**Status:** Approved

## Problem

Two mobile UX issues on the shopping list page (and globally):

1. **Footer not visible** — root layout uses percentage-based heights (`h-[10%]`, `h-[85%]`, `h-[5%]`). On mobile browsers, the dynamic viewport (address bar appearing/disappearing) causes the footer to be hidden below the fold.
2. **FABs overlap list content** — the `MenuHolder` uses `fixed bottom-14 right-4`, overlapping the bottom of the scrollable shopping list when it's long enough to scroll.

## Solution

Replace the floating FAB cluster (`MenuHolder`) and the footer with a **fixed-height bottom navigation bar** rendered as part of the root layout's flex column. Switch root layout to `100dvh` (dynamic viewport height) so it adapts correctly to mobile browser chrome.

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
    [page content — full available space, no FABs]
  BottomNav: h-14 shrink-0  bg-theme_primary  ← always visible
```

Key points:
- `100dvh` adapts to mobile browser chrome (dynamic viewport height)
- `main` uses `flex-1 min-h-0` — takes all remaining space between header and nav bar
- Content never underlaps the nav bar (no fixed positioning, no padding hacks needed)
- Footer removed; version info dropped

## BottomNav Component

New component: `app/__components/BottomNav.tsx`

- Renders `w-full h-14 bg-theme_primary flex items-center justify-around`
- Accepts `children` (nav items)
- Each child: icon + label stacked (`flex flex-col items-center gap-0.5 text-white text-xs`)
- Primary "Add" action: raised white circle button (`bg-white rounded-full text-theme_primary -mt-4 shadow-lg`) for visual prominence

`MenuHolder` is deleted (no longer used anywhere).

## Per-Page Nav Bar Contents

| Page | Nav items (left → right) |
|---|---|
| `/shopping` | Home · Refresh · Show Hidden · **Add** · Cards |
| `/recipes` | Home · **Add Recipe** |
| `/recipe/[id]` | Home · Shopping · Edit · Delete |
| `/zooplus` | Home · **Add Item** · Finalize Order |
| `/info` | Home (Add is inline in the list) |
| `/cards` | Home |

Pages that currently have no `MenuHolder` (`/cards`, `/info`) get a minimal `BottomNav` with just the Home button so navigation is consistent.

Vacation sub-pages (`/vacation`, `/vacation/programs`, `/vacation/flight-*`) use inline back-arrow navigation and are self-contained — they get no bottom nav, or a minimal Home-only bar if needed.

## Files Changed

- `app/layout.tsx` — `h-[100dvh]`, remove `%` heights, remove `<footer>`, render `<BottomNav>` slot (or each page provides its own)
- `app/__components/BottomNav.tsx` — new component (replaces MenuHolder)
- `app/__components/MenuHolder.tsx` — deleted
- `app/shopping/page.tsx` — use `BottomNav` instead of `MenuHolder`
- `app/shopping/layout.tsx` — verify scroll area fills correctly
- `app/recipes/page.tsx` — use `BottomNav`
- `app/recipe/[id]/page.tsx` — use `BottomNav`
- `app/zooplus/page.tsx` — use `BottomNav`
- `app/cards/page.tsx` — add `BottomNav` with Home
- `app/info/page.tsx` — add `BottomNav` with Home

## What Stays the Same

- Header appearance and content
- All button functionality (only the visual container changes)
- Shopping item design (checkbox, hide, delete flow)
- Category selector (type tabs) at the top of the shopping list
- Vacation sub-page layout (uses inline navigation)
- `InfoList` scroll area (uses `h-[50vh]` — this may need to be updated to use `flex-1` approach)
