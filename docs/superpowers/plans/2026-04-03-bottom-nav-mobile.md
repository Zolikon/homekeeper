# Bottom Navigation Bar Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace floating FAB buttons and the broken footer with a global bottom navigation bar, and fix the root layout to use `100dvh` so the layout works correctly on mobile browsers.

**Architecture:** The root layout switches from percentage heights to a `h-[100dvh]` flex column, removing the footer. Each page/layout that previously used `MenuHolder` now renders a `BottomNav` component as the last item in its own flex column. Button components are restyled from round FABs to icon+label nav items.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS 3.4, react-icons v5

---

## Chunk 1: Foundation

### Task 1: Update root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update `app/layout.tsx`**

Replace the current body/header/main/footer structure:

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./globalicon.css";
import ConfigureAmplify from "./ConfigureAmplify";
import LogoutButton from "./__components/LogoutButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeKeeper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gradient-to-b from-background to-background-to flex flex-col h-[100dvh] overflow-hidden`}
      >
        <ConfigureAmplify />
        <header className="w-full bg-theme_primary text-white text-center h-14 shrink-0 flex gap-3 justify-center items-center select-none relative">
          <Link href="/" className="h-full flex items-center py-1"><img src="/HomeKeeper.svg" alt="Main icon" loading="lazy" className="object-contain h-full" /></Link>
          <div className="absolute right-4">
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Run lint to verify no errors**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: update root layout to use 100dvh and remove footer"
```

---

### Task 2: Create BottomNav component

**Files:**
- Create: `app/__components/BottomNav.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/__components/BottomNav.tsx
function BottomNav({ children }: { children: React.ReactNode }) {
  return (
    <nav className="w-full h-14 bg-theme_primary flex items-center justify-around shrink-0">
      {children}
    </nav>
  );
}

export default BottomNav;
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/__components/BottomNav.tsx
git commit -m "feat: add BottomNav component"
```

---

## Chunk 2: Shopping, Recipes, Recipe Detail Pages

### Task 3: Restyle shared nav button components

These components currently render as round colored FABs. They need to become icon+label nav items for use inside `BottomNav`.

**Files:**
- Modify: `app/__components/HomeButton.tsx`
- Modify: `app/__components/CardsButton.tsx`
- Modify: `app/__components/ShoppingButton.tsx`

- [ ] **Step 1: Update `HomeButton.tsx`**

```tsx
// app/__components/HomeButton.tsx
import Link from "next/link";
import { IoHome } from "react-icons/io5";

function HomeButton() {
  return (
    <Link
      href="/"
      className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70"
    >
      <IoHome size={22} />
      <span>Főoldal</span>
    </Link>
  );
}

export default HomeButton;
```

- [ ] **Step 2: Update `CardsButton.tsx`**

```tsx
// app/__components/CardsButton.tsx
import Link from "next/link";
import { MdCreditCard } from "react-icons/md";

function CardButton() {
  return (
    <Link
      href="/cards"
      className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70"
    >
      <MdCreditCard size={22} />
      <span>Kártyák</span>
    </Link>
  );
}

export default CardButton;
```

- [ ] **Step 3: Update `ShoppingButton.tsx`**

```tsx
// app/__components/ShoppingButton.tsx
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";

function ShoppingButton() {
  return (
    <Link
      href="/shopping"
      className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70"
    >
      <FaShoppingCart size={22} />
      <span>Bevásárlás</span>
    </Link>
  );
}

export default ShoppingButton;
```

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/__components/HomeButton.tsx app/__components/CardsButton.tsx app/__components/ShoppingButton.tsx
git commit -m "feat: restyle nav link buttons as bottom nav items"
```

---

### Task 4: Update shopping page button components

**Files:**
- Modify: `app/shopping/RefreshButton.tsx`
- Modify: `app/shopping/ShowHiddenButton.tsx`
- Modify: `app/shopping/AddShoppingItem.tsx`

- [ ] **Step 1: Update `RefreshButton.tsx`**

```tsx
// app/shopping/RefreshButton.tsx
"use client";

import { useState } from "react";
import { refreshContent } from "../__backend/ShoppingService";
import { MdRefresh } from "react-icons/md";

function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  function handleClick() {
    setIsRefreshing(true);
    refreshContent()
      .then(() => setIsRefreshing(false))
      .catch((error) => {
        console.error("Error refreshing content:", error);
        setIsRefreshing(false);
      });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing}
      className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70 disabled:opacity-40"
    >
      <MdRefresh size={22} className={isRefreshing ? "animate-spin" : ""} />
      <span>Frissít</span>
    </button>
  );
}

export default RefreshButton;
```

- [ ] **Step 2: Update `ShowHiddenButton.tsx`**

```tsx
// app/shopping/ShowHiddenButton.tsx
"use client";
import { useShopping } from "./ShoppingContext";
import { MdVisibility } from "react-icons/md";

function ShowHiddenButton() {
  const context = useShopping();

  return (
    <button
      className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70 disabled:opacity-40 relative"
      disabled={context?.hiddenIds.length === 0}
      onClick={() => context?.resetHiddenElements()}
    >
      <span className="relative">
        <MdVisibility size={22} />
        {context?.hiddenIds && context.hiddenIds.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] size-4 flex items-center justify-center">
            {context.hiddenIds.length}
          </span>
        )}
      </span>
      <span>Rejtett</span>
    </button>
  );
}

export default ShowHiddenButton;
```

- [ ] **Step 3: Update `AddShoppingItem.tsx` trigger button only**

Replace only the trigger `<button>` element (lines 43–48). The dialog and everything else stays the same. The primary action gets a raised white circle:

```tsx
// In AddShoppingItem.tsx, replace the trigger button:
      <button
        className="flex flex-col items-center gap-0.5 text-white text-xs"
        onClick={openDialog}
      >
        <div className="bg-white rounded-full size-10 -mt-4 shadow-lg flex items-center justify-center text-theme_primary">
          <MdAdd size={22} />
        </div>
        <span>Hozzáad</span>
      </button>
```

Full updated `AddShoppingItem.tsx` return block (only the outer `<button>` changes; the `<dialog>` is untouched):

```tsx
  return (
    <>
      <button
        className="flex flex-col items-center gap-0.5 text-white text-xs"
        onClick={openDialog}
      >
        <div className="bg-white rounded-full size-10 -mt-4 shadow-lg flex items-center justify-center text-theme_primary">
          <MdAdd size={22} />
        </div>
        <span>Hozzáad</span>
      </button>
      <dialog ref={dialogRef} className="rounded-xl mt-10">
        {/* unchanged */}
```

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/shopping/RefreshButton.tsx app/shopping/ShowHiddenButton.tsx app/shopping/AddShoppingItem.tsx
git commit -m "feat: restyle shopping action buttons as bottom nav items"
```

---

### Task 5: Update shopping page and layout

**Files:**
- Modify: `app/shopping/page.tsx`
- Modify: `app/shopping/layout.tsx`

- [ ] **Step 1: Update `app/shopping/page.tsx`**

Wrap content in a flex column div and replace `MenuHolder` with `BottomNav`:

```tsx
// app/shopping/page.tsx
import { getShoppingList } from "../__backend/ShoppingService";
import type { ShoppingItem } from "../__backend/shopping.types";
import { ShoppingProvider } from "./ShoppingContext";
import BottomNav from "../__components/BottomNav";
import CardButton from "../__components/CardsButton";
import RefreshButton from "./RefreshButton";
import ShowHiddenButton from "./ShowHiddenButton";
import AddShoppingItem from "./AddShoppingItem";
import HomeButton from "../__components/HomeButton";
import ShoppingList from "./ShoppingList";

export const dynamic = 'force-dynamic';

async function page() {
  const items: ShoppingItem[] = await getShoppingList();

  return (
    <ShoppingProvider>
      <div className="flex flex-col h-full w-full">
        <ShoppingList items={items} />
        <BottomNav>
          <HomeButton />
          <RefreshButton />
          <ShowHiddenButton />
          <AddShoppingItem />
          <CardButton />
        </BottomNav>
      </div>
    </ShoppingProvider>
  );
}

export default page;
```

- [ ] **Step 2: Verify `app/shopping/layout.tsx` passes height correctly**

The existing layout wraps children in `flex-1 min-h-0`. The `ShoppingList` already uses `h-full` internally. The `div` wrapping ShoppingList + BottomNav in the page now fills that `flex-1` space and pushes BottomNav to the bottom. No layout.tsx change needed.

- [ ] **Step 3: Verify `ShoppingList` uses `h-full` correctly**

`ShoppingList` renders `flex flex-col items-center justify-start gap-3 w-full h-full`. The BottomNav is a sibling at the page level, not inside ShoppingList — the flex column in `page.tsx` means ShoppingList grows with `flex-1` implicitly as the only non-shrink sibling. Update `ShoppingList.tsx` to add `flex-1 min-h-0` to the outer div:

In `app/shopping/ShoppingList.tsx`, change line 28:
```tsx
// Before:
<div className="flex flex-col items-center justify-start gap-3 w-full h-full md:w-4/5">
// After:
<div className="flex flex-col items-center justify-start gap-3 w-full flex-1 min-h-0 md:w-4/5">
```

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/shopping/page.tsx app/shopping/ShoppingList.tsx
git commit -m "feat: update shopping page to use BottomNav"
```

---

### Task 6: Update recipes page

**Files:**
- Modify: `app/recipes/page.tsx`
- Modify: `app/__components/AddRecipeButton.tsx`

- [ ] **Step 1: Restyle `AddRecipeButton.tsx`** (primary action — raised white circle)

```tsx
// app/__components/AddRecipeButton.tsx
"use client";

import { useState } from "react";
import RecipeModal from "./RecipeModal";
import { addRecipe } from "../__backend/RecipeService";
import { Recipe } from "../__backend/recipe.types";
import { MdAdd } from "react-icons/md";

export default function AddRecipeButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = async (recipe: Omit<Recipe, "id">) => {
    await addRecipe(recipe);
  };

  return (
    <>
      <button
        className="flex flex-col items-center gap-0.5 text-white text-xs"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="bg-white rounded-full size-10 -mt-4 shadow-lg flex items-center justify-center text-theme_primary">
          <MdAdd size={22} />
        </div>
        <span>Recept</span>
      </button>

      <RecipeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
      />
    </>
  );
}
```

- [ ] **Step 2: Update `app/recipes/page.tsx`**

Replace `MenuHolder` with `BottomNav` and update scroll area to `flex-1 min-h-0`:

```tsx
// app/recipes/page.tsx
import { listRecipes } from "../__backend/RecipeService";
import SearchInput from "./SearchInput";
import Link from "next/link";
import HomeButton from "../__components/HomeButton";
import BottomNav from "../__components/BottomNav";
import AddRecipeButton from "../__components/AddRecipeButton";

export default async function RecipesPage(props: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
    const recipes = await listRecipes({ name: query });

    return (
        <div className="flex flex-col h-full w-full">
            <h1 className="text-2xl font-bold p-4 text-center">Receptek</h1>
            <div className="flex-none z-10">
                <SearchInput />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4 pt-0">
                {recipes.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">Nincsenek még receptek</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {recipes.map((recipe) => (
                            <li key={recipe.id}>
                                <Link
                                    href={`/recipe/${recipe.id}`}
                                    className="block p-4 border dark:border-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
                                >
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">{recipe.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <BottomNav>
                <HomeButton />
                <AddRecipeButton />
            </BottomNav>
        </div>
    );
}
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/__components/AddRecipeButton.tsx app/recipes/page.tsx
git commit -m "feat: update recipes page to use BottomNav"
```

---

### Task 7: Update recipe detail page

**Files:**
- Modify: `app/recipe/[id]/page.tsx`
- Modify: `app/__components/RecipeActionButtons.tsx`

- [ ] **Step 1: Restyle `RecipeActionButtons.tsx`**

The component renders two nav items (Edit + Delete) as siblings, plus their modals. Replace the `<button>` styling:

```tsx
// app/__components/RecipeActionButtons.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Recipe } from "../__backend/recipe.types";
import { updateRecipe, deleteRecipe } from "../__backend/RecipeService";
import RecipeModal from "./RecipeModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { MdDelete, MdEdit } from "react-icons/md";

interface RecipeActionButtonsProps {
    recipe: Recipe;
}

export default function RecipeActionButtons({ recipe }: RecipeActionButtonsProps) {
    const router = useRouter();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdate = async (updatedData: Omit<Recipe, "id">) => {
        await updateRecipe({
            id: recipe.id,
            ...updatedData,
        });
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteRecipe(recipe.id);
            router.push("/recipes");
        } catch (error) {
            console.error("Failed to delete recipe", error);
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70"
                title="Update Recipe"
            >
                <MdEdit size={22} />
                <span>Szerkeszt</span>
            </button>
            <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70"
                title="Delete Recipe"
            >
                <MdDelete size={22} />
                <span>Töröl</span>
            </button>

            <RecipeModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdate}
                initialData={recipe}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Recipe"
                message={`Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`}
                isDeleting={isDeleting}
            />
        </>
    );
}
```

- [ ] **Step 2: Update `app/recipe/[id]/page.tsx`**

Replace `MenuHolder` with `BottomNav` and fix scroll area:

```tsx
// app/recipe/[id]/page.tsx
import { getRecipe } from "../../__backend/RecipeService";
import { getShoppingList } from "../../__backend/ShoppingService";
import BottomNav from "../../__components/BottomNav";
import HomeButton from "../../__components/HomeButton";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import RecipeActionButtons from "../../__components/RecipeActionButtons";
import IngredientRow from "./IngredientRow";
import { normalizeString } from "@/app/__backend/utils";
import ShoppingButton from "@/app/__components/ShoppingButton";

export const dynamic = 'force-dynamic';

export default async function RecipePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const recipe = await getRecipe(params.id);
    const shoppingList = await getShoppingList();

    const normalizedShoppingDocs = new Map(
        shoppingList.map((item) => [normalizeString(item.name), item.id])
    );

    if (!recipe) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-xl text-gray-500">Recipe not found</p>
                <Link href="/recipes" className="mt-4 text-blue-500 underline">
                    Back to Recipes
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center p-4 border-b dark:border-gray-800 shrink-0">
                <Link href="/recipes" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <MdArrowBack size={24} className="text-gray-700 dark:text-gray-300" />
                </Link>
                <h1 className="text-2xl font-bold truncate flex-1 text-gray-900 dark:text-white">{recipe.name}</h1>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-2 border-b dark:border-gray-800 pb-1 text-gray-900 dark:text-white">Hozzávalók</h2>
                    <div className="flex flex-col space-y-1">
                        {recipe.ingredients.map((ingredient, index) => {
                            const shoppingItemId = normalizedShoppingDocs.get(normalizeString(ingredient));
                            return (
                                <IngredientRow
                                    key={index}
                                    ingredient={ingredient}
                                    initialShoppingItemId={shoppingItemId}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <BottomNav>
                <HomeButton />
                <ShoppingButton />
                <RecipeActionButtons recipe={recipe} />
            </BottomNav>
        </div>
    );
}
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/__components/RecipeActionButtons.tsx app/recipe/[id]/page.tsx
git commit -m "feat: update recipe detail page to use BottomNav"
```

---

## Chunk 3: Zooplus, Info, Cards, Scroll Fixes, Cleanup

### Task 8: Update zooplus page

**Files:**
- Modify: `app/zooplus/page.tsx`
- Modify: `app/zooplus/AddPetOrderItem.tsx`
- Modify: `app/zooplus/FinalOrderButton.tsx`
- Modify: `app/zooplus/ZooplusList.tsx`

- [ ] **Step 1: Restyle `AddPetOrderItem.tsx`** (primary action)

Replace only the trigger `<button>` (lines 39–44). Dialog is unchanged:

```tsx
      <button
        className="flex flex-col items-center gap-0.5 text-white text-xs"
        onClick={openDialog}
      >
        <div className="bg-white rounded-full size-10 -mt-4 shadow-lg flex items-center justify-center text-theme_primary">
          <MdAdd size={22} />
        </div>
        <span>Hozzáad</span>
      </button>
```

- [ ] **Step 2: Restyle `FinalOrderButton.tsx`**

Replace only the trigger `<button>` (lines 19–30). Dialog is unchanged:

```tsx
      <button
        className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70 disabled:opacity-40 relative"
        onClick={openDialog}
        disabled={cart.length === 0}
      >
        <span className="relative">
          <MdShoppingCart size={22} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] size-4 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </span>
        <span>Rendelés</span>
      </button>
```

- [ ] **Step 3: Fix scroll area in `ZooplusList.tsx`**

Change `h-2/3` to `flex-1 min-h-0` on the outer div:

```tsx
// app/zooplus/ZooplusList.tsx
"use client";

import { useZooplusCart } from "./ZooplusContext";
import ZooplusItemDisplay from "./ZooplusItem";

export default function ZooplusList() {
  const { items } = useZooplusCart() ?? { items: [] };
  return (
    <div className="flex flex-col flex-1 min-h-0 mt-4 items-center justify-start w-full overflow-y-auto">
      {items.map((item, index) => (
        <ZooplusItemDisplay key={index} item={item} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Update `app/zooplus/page.tsx`**

Add flex column wrapper and replace `MenuHolder` with `BottomNav`:

```tsx
// app/zooplus/page.tsx
import HomeButton from "../__components/HomeButton";
import BottomNav from "../__components/BottomNav";
import AddPetOrderItem from "./AddPetOrderItem";
import FinalOrderButton from "./FinalOrderButton";
import { ZooplusProvider } from "./ZooplusContext";
import ZooplusList from "./ZooplusList";

export default function Page() {
  return (
    <ZooplusProvider>
      <div className="flex flex-col h-full w-full">
        <ZooplusList />
        <BottomNav>
          <HomeButton />
          <AddPetOrderItem />
          <FinalOrderButton />
        </BottomNav>
      </div>
    </ZooplusProvider>
  );
}
```

- [ ] **Step 5: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/zooplus/page.tsx app/zooplus/AddPetOrderItem.tsx app/zooplus/FinalOrderButton.tsx app/zooplus/ZooplusList.tsx
git commit -m "feat: update zooplus page to use BottomNav, fix scroll area"
```

---

### Task 9: Update info layout and fix InfoList scroll

**Files:**
- Modify: `app/info/layout.tsx`
- Modify: `app/info/AddInfoItem.tsx`
- Modify: `app/info/InfoList.tsx`

- [ ] **Step 1: Restyle `AddInfoItem.tsx`** (primary action)

Replace only the trigger `<button>` (lines 47–52). Dialog is unchanged:

```tsx
      <button
        className="flex flex-col items-center gap-0.5 text-white text-xs"
        onClick={openDialog}
      >
        <div className="bg-white rounded-full size-10 -mt-4 shadow-lg flex items-center justify-center text-theme_primary">
          <MdAdd size={22} />
        </div>
        <span>Hozzáad</span>
      </button>
```

- [ ] **Step 2: Fix scroll area in `InfoList.tsx`**

Change `h-[50vh]` to `flex-1 min-h-0` on the scroll div (line 19):

```tsx
// In InfoList.tsx, change:
<div className="flex flex-col items-center justify-start gap-3 w-full h-[50vh] overflow-y-auto">
// To:
<div className="flex flex-col items-center justify-start gap-3 w-full flex-1 min-h-0 overflow-y-auto">
```

Also the InfoList outer return needs to be a flex column to allow `flex-1` to work. Wrap in a flex column:

```tsx
// InfoList.tsx full return:
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full items-center gap-2 px-2">
      <Resetableinput placeholder="search" value={search} onChange={setSearch} />
      <div className="flex flex-col items-center justify-start gap-3 w-full flex-1 min-h-0 overflow-y-auto">
        {filteredList.map((item) => (
          <InfoItemComponent key={item.id} infoItem={item} />
        ))}
      </div>
    </div>
  );
```

- [ ] **Step 3: Update `app/info/layout.tsx`**

Change outer div to `flex flex-col h-full`, replace `MenuHolder` with `BottomNav`:

```tsx
// app/info/layout.tsx
import { Suspense } from "react";
import BottomNav from "../__components/BottomNav";
import AddInfoItem from "./AddInfoItem";
import HomeButton from "../__components/HomeButton";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full w-full items-center">
      <h1 className="pt-4 text-2xl font-extrabold shrink-0">Info store</h1>
      <p className="text-xs italic shrink-0">Ne tárolj érzékeny adatokat</p>
      <div className="flex-1 min-h-0 w-full flex flex-col items-center">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </div>
      <BottomNav>
        <HomeButton />
        <AddInfoItem />
      </BottomNav>
    </div>
  );
}

export default Layout;
```

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/info/layout.tsx app/info/AddInfoItem.tsx app/info/InfoList.tsx
git commit -m "feat: update info layout to use BottomNav, fix scroll area"
```

---

### Task 10: Update cards layout

**Files:**
- Modify: `app/cards/layout.tsx`

- [ ] **Step 1: Update `app/cards/layout.tsx`**

Change outer div to `flex flex-col h-full`, replace `MenuHolder` with `BottomNav`:

```tsx
// app/cards/layout.tsx
import { Suspense } from "react";
import BottomNav from "../__components/BottomNav";
import HomeButton from "../__components/HomeButton";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full w-full items-center">
      <h1 className="py-4 text-2xl font-extrabold shrink-0">Cards</h1>
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </div>
      <BottomNav>
        <HomeButton />
      </BottomNav>
    </div>
  );
}

export default Layout;
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/cards/layout.tsx
git commit -m "feat: update cards layout to use BottomNav"
```

---

### Task 11: Fix DayTimeline FAB

**Files:**
- Modify: `app/vacation/programs/DayTimeline.tsx`

- [ ] **Step 1: Replace `MenuHolder` with inline fixed button**

In `DayTimeline.tsx`, find the FAB section (around line 344–352):

```tsx
      {/* FAB */}
      <MenuHolder>
        <button
          onClick={() => { setInitialStartTime(undefined); setAddModalOpen(true); }}
          className="size-14 rounded-full bg-theme_primary text-white shadow-lg flex items-center justify-center"
        >
          <PiPlus className="text-2xl" />
        </button>
      </MenuHolder>
```

Replace with:

```tsx
      {/* FAB */}
      <button
        onClick={() => { setInitialStartTime(undefined); setAddModalOpen(true); }}
        className="fixed bottom-4 right-4 size-14 rounded-full bg-theme_primary text-white shadow-lg flex items-center justify-center z-50"
      >
        <PiPlus className="text-2xl" />
      </button>
```

Also remove the `MenuHolder` import from the top of the file:
```tsx
// Remove this line:
import MenuHolder from "@/app/__components/MenuHolder";
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/vacation/programs/DayTimeline.tsx
git commit -m "feat: replace MenuHolder FAB with inline fixed button in DayTimeline"
```

---

### Task 12: Delete MenuHolder

**Files:**
- Delete: `app/__components/MenuHolder.tsx`

- [ ] **Step 1: Verify no remaining imports**

```bash
grep -r "MenuHolder" app/ --include="*.tsx" --include="*.ts"
```

Expected: no output (all usages removed in previous tasks).

- [ ] **Step 2: Delete the file**

```bash
rm app/__components/MenuHolder.tsx
```

- [ ] **Step 3: Run build to verify everything compiles**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: delete MenuHolder component — replaced by BottomNav"
```
