"use server";
import { randomUUID } from "crypto";
import { ShoppingItem } from "../types";
import { revalidatePath } from "next/cache";

let shoppingList: ShoppingItem[] = [
  {
    id: randomUUID(),
    name: "Apples",
    added: new Date(),
    done: false,
  },
];

export async function getShoppingList(): Promise<ShoppingItem[]> {
  return shoppingList.filter((t) => !t.done).sort((a, b) => a.added.getTime() - b.added.getTime());
}

export async function countPendingItems(): Promise<number> {
  return shoppingList.filter((t) => !t.done).length;
}

export async function addItem(name: string, note?: string): Promise<void> {
  shoppingList.push({
    id: randomUUID(),
    name,
    note,
    added: new Date(),
    done: false,
  });
  revalidatePath("/shopping");
}

export async function editItem(id: string, name: string, note?: string): Promise<void> {
  const item = shoppingList.find((item) => item.id === id);
  if (item) {
    item.name = name;
    item.note = note;
  }
}

export async function deleteItem(id: string): Promise<void> {
  const index = shoppingList.findIndex((item) => item.id === id);
  if (index !== -1) {
    shoppingList = shoppingList.filter((item) => item.id !== id);
  }
}

export async function toggleItemStatus(id: string): Promise<void> {
  const item = shoppingList.find((item) => item.id === id);
  if (item) {
    item.done = !item.done;
  }
  revalidatePath("/shopping");
}
