"use server";
import { randomUUID } from "crypto";
import { ShoppingItem } from "../types";
import { revalidatePath } from "next/cache";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export async function getShoppingList(): Promise<ShoppingItem[]> {
  const { data } = await client.models.ShoppingList.list({ filter: { done: { eq: false } } });
  return data
    .map((item) => ({
      id: item.id,
      name: item.name,
      note: item.note,
      added: new Date(item.added),
      done: item.done,
    }))
    .sort((a, b) => a.added.getTime() - b.added.getTime());
}

export async function countPendingItems(): Promise<number> {
  return (await client.models.ShoppingList.list({ filter: { done: { eq: false } } })).data.length || 0;
}

export async function addItem(name: string, note?: string): Promise<void> {
  await client.models.ShoppingList.create({
    id: randomUUID(),
    name,
    note: note || "",
    added: new Date().getTime(),
    done: false,
  });
  revalidatePath("/");
}

export async function toggleItemStatus(id: string): Promise<void> {
  await client.models.ShoppingList.update({ id, done: true });
  revalidatePath("/");
}
