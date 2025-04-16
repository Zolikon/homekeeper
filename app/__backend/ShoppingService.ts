"use server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>().models.ShoppingList;

export type ShoppingItem = {
  id: string;
  name: string;
  note?: string;
  added: Date;
  done: boolean;
};

export async function getShoppingList(): Promise<ShoppingItem[]> {
  const { data } = await client.list();
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
  return (await client.list()).data.length || 0;
}

export async function counCompletedItems(): Promise<number> {
  return (await client.list()).data.length || 0;
}

export async function addItem(name: string, note?: string): Promise<void> {
  await client.create({
    id: randomUUID(),
    name,
    note: note || "",
    added: new Date().getTime(),
    done: false,
  });
  revalidatePath("/shopping");
}

export async function deleteItem(id: string): Promise<void> {
  await client.delete({ id });
}

export async function refreshContent(): Promise<void> {
  revalidatePath("/shopping");
}
