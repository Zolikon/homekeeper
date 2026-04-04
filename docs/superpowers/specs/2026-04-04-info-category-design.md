# Info Store Category Feature — Design Spec

**Date:** 2026-04-04  
**Status:** Approved

## Overview

Add a `category` field to InfoStore items. Categories affect validation on add, visual indicator in the list, and available actions in the item dialog.

## Categories

| Value | Label (HU) | List border | Validation | Dialog action |
|---|---|---|---|---|
| `none` | Egyéb | none | required + maxLength only | none |
| `phone` | Telefon | green (`border-green-400`) | phone number regex | "Hívás" (`tel:` link) |
| `address` | Cím | amber (`border-amber-400`) | none (required only) | "Térkép" (Google Maps link) |
| `link` | Link | blue (`border-blue-400`) | must start with `http://` or `https://` | "Megnyitás" (external link) |

Default is `none`. Existing items without a category stored are treated as `none`.

## Data Layer

### `amplify/data/resource.ts`

Add optional `category` field to `InfoStore` model:

```ts
category: a.string()  // optional — "none" | "phone" | "address" | "link"
```

Optional (not `.required()`) so existing records without the field remain valid.

### `app/__backend/InfoService.ts`

Add `InfoCategory` type inline alongside the existing `InfoItem` type:

```ts
export type InfoCategory = "none" | "phone" | "address" | "link";
```

- Add `category: InfoCategory` to `InfoItem` type (defaulting to `"none"` when absent from DB)
- Thread `category` through `getInfoList` (map it, default to `"none"` if null)
- Add `category` parameter to `addInfoItem`

## Add Form (`AddInfoItem.tsx`)

A "Kategória" selector row is added between the name and content fields.

- **UI:** 4 icon+label buttons in a horizontal row (Option A from design)
- **Icons** (react-icons/md): `MdInfo` (none), `MdPhone` (phone), `MdLocationOn` (address), `MdLink` (link)
- **Selected state:** theme_primary background (`rgb(29,181,147)`) with white text/icon; unselected gray
- **Default:** `none` pre-selected
- **Placeholder:** content textarea placeholder changes dynamically per category:
  - `none` → empty string (no placeholder)
  - `phone` → `+36 30 123 4567`
  - `address` → `Utca, Város`
  - `link` → `https://...`

### Validation (react-hook-form, reValidateMode: onBlur)

- `phone`: regex `/^[+\d][\d\s\-().]{5,20}$/` — allows digits, spaces, `+`, `-`, `()`, `.`; 6–21 chars total. Intentionally permissive to cover common Hungarian formats.
- `link`: regex `/^https?:\/\/.+/`
- `none` / `address`: no extra content validation

New error translation key: `"pattern"` → `"Érvénytelen formátum"`

### react-hook-form integration for category

Use `useForm({ defaultValues: { category: "none", ... } })` so the `category` field exists in form state and appears in the `data` object passed to `onSubmit`. Category is not registered via a hidden input — the icon buttons call `setValue("category", value, { shouldDirty: true })` directly. A parallel `useState<InfoCategory>` tracks the selected value for rendering the highlighted button UI.

On category change, call `clearErrors("content")` to dismiss any validation error from a previously-selected category's rule (e.g., switching away from `phone` after entering invalid text).

The `isDirty` guard on the submit button is kept as-is (consistent with existing behavior). Enabling submit when `isDirty` but `!isValid` is an accepted tradeoff — the form will show validation errors on submit attempt.

Use `useForm<{ name: string; content: string; category: InfoCategory }>()` with an explicit type (strict TypeScript project).

After a failed submit, if the user switches category and then blurs the content field without editing it, RHF will re-validate against the new category's rule — this is intentional, not a bug.

## List View (`InfoItemComponent.tsx`)

Each item card gains a conditional left border class based on category:

```
none     → no border (unchanged)
phone    → border-l-4 border-green-400
address  → border-l-4 border-amber-400
link     → border-l-4 border-blue-400
```

No other list changes — title text unchanged, no icons in the list.

## Item Dialog (`InfoItemComponent.tsx`)

For non-`none` categories, a full-width action button is inserted above the delete/copy/close row.

| Category | Button color | Icon | Label | Href |
|---|---|---|---|---|
| `phone` | green (`bg-green-500`) | `MdPhone` | Hívás | `tel:{content}` verbatim — browsers handle formatted numbers correctly on iOS/Android |
| `address` | amber (`bg-amber-500`) | `MdMap` | Térkép | `https://maps.google.com/?q={encodeURIComponent(content)}` |
| `link` | blue (`bg-blue-500`) | `MdOpenInNew` | Megnyitás | `{content}` with `target="_blank" rel="noopener noreferrer"` |

Implemented as `<a>` tags styled as buttons (not `window.open`) for correct mobile behavior.

The dialog uses `min-h-[40vh]` (instead of the current fixed `h-[40vh]`) to accommodate the extra button without compressing the content area. The inner `div` currently uses `h-full` — this must also change to `min-h-[40vh]` so it expands correctly with the dialog rather than collapsing to content height.

`none` items: dialog unchanged.

## Out of Scope

- Editing category of an existing item (delete + re-add is the current pattern)
- Filtering/grouping the list by category
- Fixing the pre-existing `revalidatePath("/")` call in `addInfoItem` (should arguably be `/info`, but that is a separate concern)
