"use server";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>().models.ShoppingList;

export async function deleteFinishedItems(): Promise<null> {
  (await client.list({ filter: { done: { eq: true } } })).data.map(async (item) => {
    await client.delete({ id: item.id });
  });
  return null;
}
