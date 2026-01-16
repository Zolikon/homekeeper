"use server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
import { ShoppingItem, ShoppingItemType } from "./shopping.types";

Amplify.configure(outputs);
const client = generateClient<Schema>().models.ShoppingList;

function convertToShoppingItemType(type: string): ShoppingItemType {
  switch (type) {
    case "food":
      return ShoppingItemType.FOOD;
    case "house":
      return ShoppingItemType.HOUSE;
    case "car":
      return ShoppingItemType.CAR;
    case "cat":
      return ShoppingItemType.CAT;
    default:
      return ShoppingItemType.OTHER;
  }
}

export async function getShoppingList(): Promise<ShoppingItem[]> {
  const { data } = await client.list();
  return data
    .map((item) => ({
      id: item.id,
      name: item.name,
      added: new Date(item.added),
      type: convertToShoppingItemType(item.type),
    }))
    .sort((a, b) => a.added.getTime() - b.added.getTime());
}

export async function countPendingItems(): Promise<number> {
  return (await client.list()).data.length || 0;
}

export async function counCompletedItems(): Promise<number> {
  return (await client.list()).data.length || 0;
}

export async function addItem(name: string, type?: ShoppingItemType): Promise<string> {
  const newId = randomUUID();
  await client.create({
    id: newId,
    name,
    added: new Date().getTime(),
    type: type || ShoppingItemType.FOOD,
  });
  revalidatePath("/shopping");
  return newId;
}

export async function deleteItem(id: string): Promise<void> {
  await client.delete({ id });
}

export async function refreshContent(): Promise<void> {
  revalidatePath("/shopping");
}
