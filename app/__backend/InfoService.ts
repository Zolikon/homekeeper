"use server";
import { revalidatePath } from "next/cache";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>().models.InfoStore;

export type InfoItem = {
  id: string;
  title: string;
  content: string;
  normalizedTitle?: string;
};

function normalized(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function getInfoList(): Promise<InfoItem[]> {
  const { data } = await client.list();
  return data
    .map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      normalizedTitle: normalized(item.title),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function isNameAvailable(title: string): Promise<boolean> {
  const { data } = await client.list({ filter: { title: { eq: title } } });
  return data.length === 0;
}

export async function addInfoItem(title: string, content: string): Promise<void> {
  await client.create({
    id: title,
    title,
    content,
  });
  revalidatePath("/");
}

export async function deleteInfoItem(id: string): Promise<void> {
  await client.delete({ id });
  revalidatePath("/");
}
