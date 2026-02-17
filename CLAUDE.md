# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HomeKeeper is a private household management web app (mobile-first) for managing a shared shopping list, recipes, loyalty cards, pet supply orders (Zooplus), and a key-value info store. UI text is in Hungarian. Deployed privately on AWS Amplify Hosting.

## Tech Stack

Next.js 15 (App Router), TypeScript 5.7 (strict), React 19, Tailwind CSS 3.4, AWS Amplify Gen 2 + DynamoDB, AWS Cognito auth, react-hook-form v7, motion (Framer Motion v12), react-icons v5.

## Commands

```bash
npm run dev      # Start dev server (requires sandbox running first)
npm run build    # Production build
npm run lint     # ESLint (flat config: next/core-web-vitals + next/typescript)

npx ampx sandbox         # Start AWS dev sandbox (generates amplify_outputs.json)
npx ampx sandbox delete  # Tear down sandbox
```

**Local dev requires** `npx ampx sandbox` running before `npm run dev`. The generated `amplify_outputs.json` is needed at runtime.

## Architecture

### Server/Client Split

- Route `page.tsx` files are **async Server Components** that fetch data directly via service functions.
- Interactive components use `"use client"` and receive data as props.
- Data-driven pages set `export const dynamic = 'force-dynamic'` to prevent static caching.

### Service Layer (`app/__backend/`)

All files are `"use server"` modules. Each service configures Amplify, creates a typed DynamoDB client via `generateClient<Schema>()`, exports CRUD functions, and calls `revalidatePath()` after mutations. Services: `ShoppingService.ts`, `RecipeService.ts`, `InfoService.ts`.

### State Management

No global state library. Uses:
- **React Context** for ephemeral UI state: `ShoppingContext` (delete/hide tracking), `ZooplusContext` (in-memory cart, not persisted)
- **URL search params** for recipe search
- **Local `useState`** for component-level state

### Data Models (DynamoDB)

| Model | Key Fields | Notes |
|---|---|---|
| ShoppingList | id, name, type (food/house/car/cat/other), added | `ShoppingItemType` enum |
| InfoStore | id (= title), title, content | Title used as ID |
| Recipe | id, name, ingredients (string[]), link? | |

All models use `allow.guest()` (IAM) auth.

### Routes

`/` home, `/shopping` shopping list, `/recipes` recipe list with search, `/recipe/[id]` recipe detail with ingredient-to-shopping toggle, `/cards` loyalty card barcodes, `/info` key-value store, `/zooplus` pet supply order builder.

### UI Patterns

- **FABs**: Fixed bottom-right cluster via `MenuHolder`, round buttons (`rounded-full size-12 md:size-16`)
- **Dialogs**: Native `<dialog>` element for add-item forms; custom `fixed inset-0` divs for recipe modals
- **Theme**: Primary color `rgb(29,181,147)` (`theme_primary`), dark mode via `prefers-color-scheme` + Tailwind `dark:`

## Key Conventions

- Path alias: `@/*` maps to project root
- Two string normalization utils exist: `app/__backend/utils.ts` (server) and `app/utils.ts` (client)
- IDs generated via `randomUUID()` from Node.js `crypto`
- Shopping item types: `food`, `house`, `car`, `cat`, `other`
- Deployment: push to `master` triggers auto-deploy via `amplify.yml`
