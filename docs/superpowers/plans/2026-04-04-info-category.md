# Info Category Feature — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `category` field (`none` | `phone` | `address` | `link`) to InfoStore items, with category-specific validation on add, a colored left border in the list, and a context-sensitive action button (call / maps / open link) in the item dialog.

**Architecture:** The category is stored as an optional string in DynamoDB (existing items default to `"none"`). The type is defined inline in `InfoService.ts`. Three UI files are touched: `AddInfoItem.tsx` (selector + validation), `InfoItemComponent.tsx` (list border + dialog action button).

**Tech Stack:** Next.js 15, TypeScript 5.7 strict, React 19, Tailwind CSS 3.4, AWS Amplify Gen 2 + DynamoDB, react-hook-form v7, react-icons v5.

**Spec:** `docs/superpowers/specs/2026-04-04-info-category-design.md`

---

## Chunk 1: Data layer — schema and service

**Files:**
- Modify: `amplify/data/resource.ts`
- Modify: `app/__backend/InfoService.ts`

---

### Task 1: Add `category` to the DynamoDB schema

**File:** `amplify/data/resource.ts`

- [ ] **Step 1: Add the `category` field to `InfoStore`**

  Open `amplify/data/resource.ts`. Find the `InfoStore` model (currently lines 19–24) and add `category: a.string()` as an optional field:

  ```ts
  InfoStore: a
    .model({
      id: a.string().required(),
      title: a.string().required(),
      content: a.string().required(),
      category: a.string(),   // "none" | "phone" | "address" | "link" — optional for back-compat
    })
    .authorization((allow) => [allow.authenticated()]),
  ```

- [ ] **Step 2: Verify lint passes**

  ```bash
  npm run lint
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add amplify/data/resource.ts
  git commit -m "feat: add category field to InfoStore schema"
  ```

---

### Task 2: Update `InfoService.ts` — type, getInfoList, addInfoItem

**File:** `app/__backend/InfoService.ts`

- [ ] **Step 1: Add `InfoCategory` type and update `InfoItem`**

  Add `InfoCategory` immediately before the existing `InfoItem` type definition (currently line 14):

  ```ts
  export type InfoCategory = "none" | "phone" | "address" | "link";

  export type InfoItem = {
    id: string;
    title: string;
    content: string;
    category: InfoCategory;
    normalizedTitle?: string;
  };
  ```

- [ ] **Step 2: Update `getInfoList` to map `category`**

  In the `.map()` call inside `getInfoList`, add `category` with a fallback to `"none"` for existing records that have no category stored:

  ```ts
  return data
    .map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: (item.category as InfoCategory) ?? "none",
      normalizedTitle: normalized(item.title),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
  ```

- [ ] **Step 3: Update `addInfoItem` to accept and store `category`**

  Change the function signature and body:

  ```ts
  export async function addInfoItem(title: string, content: string, category: InfoCategory): Promise<void> {
    await client.create({
      id: title,
      title,
      content,
      category,
    });
    revalidatePath("/");
  }
  ```

- [ ] **Step 4: Verify lint passes**

  ```bash
  npm run lint
  ```

  Expected: no errors.

  > Note: Do NOT run `npm run build` here — it will produce one expected type error in `AddInfoItem.tsx` because `addInfoItem` now requires a third `category` argument that the form hasn't been updated to pass yet. This is fixed in Task 3.

- [ ] **Step 5: Commit**

  ```bash
  git add app/__backend/InfoService.ts
  git commit -m "feat: add InfoCategory type and thread category through InfoService"
  ```

---

## Chunk 2: Add form — category selector and validation

**Files:**
- Modify: `app/info/AddInfoItem.tsx`

---

### Task 3: Add category selector to `AddInfoItem.tsx`

**File:** `app/info/AddInfoItem.tsx`

- [ ] **Step 1: Update imports**

  Update the React import to include `useState` (currently only `useRef` is imported):

  ```ts
  import { useRef, useState } from "react";
  ```

  Update the react-hook-form import — `FieldValues` is no longer needed with the explicit form type; `SubmitHandler` is still used in `onSubmit`:

  ```ts
  import { useForm, useWatch, SubmitHandler } from "react-hook-form";
  ```

  Replace the existing single `MdAdd` import with all needed icons, and import `InfoCategory` and the updated `addInfoItem`:

  ```ts
  import { MdAdd, MdInfo, MdPhone, MdLocationOn, MdLink } from "react-icons/md";
  import { addInfoItem, isNameAvailable, InfoCategory } from "../__backend/InfoService";
  ```

- [ ] **Step 2: Add the typed form interface and update `useForm`**

  Add this type alias at the top of the file, outside the component function (e.g. after the imports):

  ```ts
  type InfoFormValues = { name: string; content: string; category: InfoCategory };
  ```

  Replace the existing `useForm` call. The form now has an explicit type and a `category` default value:

  ```ts
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<InfoFormValues>({
    defaultValues: { category: "none" },
    reValidateMode: "onBlur",
  });
  ```

- [ ] **Step 3: Add `useState` for category UI tracking**

  Add this line after the `useForm` call:

  ```ts
  const [selectedCategory, setSelectedCategory] = useState<InfoCategory>("none");
  ```

  Also update the `useWatch` import — it is already imported. No change needed there.

- [ ] **Step 4: Add category change handler**

  Add this function inside the component, after `closeDialog`:

  ```ts
  function handleCategoryChange(cat: InfoCategory) {
    setSelectedCategory(cat);
    setValue("category", cat, { shouldDirty: true });
    clearErrors("content");
  }
  ```

- [ ] **Step 5: Update `reset` calls to restore category state**

  Both `closeDialog` and `onSubmit` call `reset()`. After reset, also restore the `selectedCategory` state:

  ```ts
  function closeDialog() {
    reset();
    setSelectedCategory("none");
    dialogRef.current?.close();
  }

  const onSubmit: SubmitHandler<InfoFormValues> = (data) => {
    addInfoItem(data.name, data.content, data.category);
    closeDialog();
  };
  ```

  `closeDialog` already calls `reset()` and `setSelectedCategory("none")`, so `onSubmit` just delegates to it after submitting — no double reset.

- [ ] **Step 6: Update content `register` call to include category-specific validation**

  Replace the existing `register("content", ...)` call:

  ```ts
  {...register("content", {
    required: true,
    maxLength: CONTENT_MAX,
    validate: (value) => {
      if (selectedCategory === "phone") {
        return /^[+\d][\d\s\-().]{5,20}$/.test(value) || "pattern";
      }
      if (selectedCategory === "link") {
        return /^https?:\/\/.+/.test(value) || "pattern";
      }
      return true;
    },
  })}
  ```

  Note: returning the string `"pattern"` as the error causes RHF to set `errors.content.type` to `"pattern"`, which the existing `translateValidationErrors` will handle once we add the new case.

- [ ] **Step 7: Add `"pattern"` to `translateValidationErrors`**

  In the `translateValidationErrors` function, add a case before `default`:

  ```ts
  case "pattern":
    return "Érvénytelen formátum";
  ```

- [ ] **Step 8: Update content textarea placeholder to be dynamic**

  Define a placeholder lookup above the JSX return:

  ```ts
  const contentPlaceholders: Record<InfoCategory, string> = {
    none: "",
    phone: "+36 30 123 4567",
    address: "Utca, Város",
    link: "https://...",
  };
  ```

  Then add `placeholder={contentPlaceholders[selectedCategory]}` to the `<textarea>` element.

- [ ] **Step 9: Add the category selector row to the JSX**

  Insert the following block between the name `<label>` and the content `<label>` in the form:

  ```tsx
  <div className="flex flex-col gap-1 items-center w-full">
    <span>Kategória</span>
    <div className="flex gap-2 justify-center">
      {(
        [
          { value: "none", label: "Egyéb", Icon: MdInfo },
          { value: "phone", label: "Telefon", Icon: MdPhone },
          { value: "address", label: "Cím", Icon: MdLocationOn },
          { value: "link", label: "Link", Icon: MdLink },
        ] as { value: InfoCategory; label: string; Icon: React.ComponentType<{ size?: number }> }[]
      ).map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => handleCategoryChange(value)}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            selectedCategory === value
              ? "bg-[rgb(29,181,147)] text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  </div>
  ```

- [ ] **Step 10: Verify lint and build pass**

  ```bash
  npm run lint
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 11: Manual verification**

  Start the dev server (sandbox must be running):
  ```bash
  npm run dev
  ```
  Navigate to `/info`. Open the add dialog and verify:
  - 4 category buttons render; "Egyéb" is highlighted by default
  - Clicking "Telefon" highlights it and shows `+36 30 123 4567` placeholder in content
  - Clicking "Link" highlights it and shows `https://...` placeholder
  - Clicking "Cím" highlights it and shows `Utca, Város` placeholder
  - Submitting with "Telefon" selected and invalid content (e.g. `abc`) shows "Érvénytelen formátum"
  - Submitting with a valid phone number and name succeeds and the item appears in the list

- [ ] **Step 12: Commit**

  ```bash
  git add app/info/AddInfoItem.tsx
  git commit -m "feat: add category selector and validation to AddInfoItem"
  ```

---

## Chunk 3: List border and dialog action button

**Files:**
- Modify: `app/info/InfoItemComponent.tsx`

---

### Task 4: Add colored left border to list items

**File:** `app/info/InfoItemComponent.tsx`

- [ ] **Step 1: Import `InfoCategory` from `InfoService`**

  The component already imports `InfoItem` from `InfoService`. Add `InfoCategory` to that import:

  ```ts
  import { deleteInfoItem, InfoItem, InfoCategory } from "../__backend/InfoService";
  ```

- [ ] **Step 2: Add a border class lookup**

  Add this constant inside the component, before the `return`:

  ```ts
  const categoryBorder: Record<InfoCategory, string> = {
    none: "",
    phone: "border-l-4 border-green-400",
    address: "border-l-4 border-amber-400",
    link: "border-l-4 border-blue-400",
  };
  ```

- [ ] **Step 3: Apply the border to the item card**

  The outer list card `div` currently has this className:

  ```
  "flex items-center justify-center gap-2 w-[90%] bg-gray-500 p-2 rounded-lg cursor-pointer"
  ```

  Update it to include the category border:

  ```tsx
  className={`flex items-center justify-center gap-2 w-[90%] bg-gray-500 p-2 rounded-lg cursor-pointer ${categoryBorder[infoItem.category]}`}
  ```

- [ ] **Step 4: Verify lint passes**

  ```bash
  npm run lint
  ```

  Expected: no errors.

---

### Task 5: Add action button to item dialog

**File:** `app/info/InfoItemComponent.tsx`

- [ ] **Step 1: Import action icons**

  Add `MdPhone`, `MdMap`, `MdOpenInNew` to the existing react-icons import:

  ```ts
  import { MdTouchApp, MdDelete, MdPhone, MdMap, MdOpenInNew } from "react-icons/md";
  ```

- [ ] **Step 2: Define the action button config**

  Add this constant inside the component, alongside `categoryBorder`:

  ```ts
  const categoryAction: Partial<Record<InfoCategory, {
    href: string;
    label: string;
    color: string;
    Icon: React.ComponentType<{ size?: number }>;
  }>> = {
    phone: {
      href: `tel:${infoItem.content}`,
      label: "Hívás",
      color: "bg-green-500",
      Icon: MdPhone,
    },
    address: {
      href: `https://maps.google.com/?q=${encodeURIComponent(infoItem.content)}`,
      label: "Térkép",
      color: "bg-amber-500",
      Icon: MdMap,
    },
    link: {
      href: infoItem.content,
      label: "Megnyitás",
      color: "bg-blue-500",
      Icon: MdOpenInNew,
    },
  };
  const action = categoryAction[infoItem.category];
  ```

- [ ] **Step 3: Update dialog height and insert action button**

  The `<dialog>` currently uses `h-[40vh]`. Change it to `min-h-[40vh]`:

  ```tsx
  <dialog ref={dialogRef} className="w-[90vw] min-h-[40vh] rounded-xl">
  ```

  The inner `div` currently uses `h-full`. Change it to `min-h-[40vh]`:

  ```tsx
  <div className="flex flex-col items-center justify-between p-2 min-h-[40vh]">
  ```

  Then insert the action button block immediately before the `<div className="flex gap-2">` button row:

  ```tsx
  {action && (
    <a
      href={action.href}
      target={infoItem.category === "link" ? "_blank" : undefined}
      rel={infoItem.category === "link" ? "noopener noreferrer" : undefined}
      className={`${action.color} text-white rounded-lg p-3 w-full flex items-center justify-center gap-2 font-semibold`}
    >
      <action.Icon size={20} />
      {action.label}
    </a>
  )}
  ```

- [ ] **Step 4: Verify lint and build pass**

  ```bash
  npm run lint
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 5: Manual verification**

  Navigate to `/info`. Verify:
  - Items added with `phone` category show a green left border in the list
  - Items added with `address` category show an amber left border
  - Items added with `link` category show a blue left border
  - Items added with `none` (or existing items) show no border
  - Opening a phone item shows a green "Hívás" button above delete/copy/close; tapping it opens the phone dialer
  - Opening an address item shows an amber "Térkép" button; tapping it opens Google Maps
  - Opening a link item shows a blue "Megnyitás" button; tapping it opens the link in a new tab
  - Opening a `none` item shows no action button — dialog unchanged

- [ ] **Step 6: Commit**

  ```bash
  git add app/info/InfoItemComponent.tsx
  git commit -m "feat: add category border and action button to InfoItemComponent"
  ```

---

## Done

All three chunks complete. The info category feature is fully implemented:
- Schema updated (existing items safe — `category` is optional)
- Add form has icon button selector with category-specific validation and placeholder hints
- List shows colored left border per category
- Dialog shows context-sensitive action button for phone / address / link items
