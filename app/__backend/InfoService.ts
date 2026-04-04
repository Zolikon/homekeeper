"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import type { Schema } from "../../amplify/data/resource";
import outputs from "../../amplify_outputs.json";

const cookieClient = generateServerClientUsingCookies<Schema>({
  cookies,
  config: outputs,
});
const client = cookieClient.models.InfoStore;

export type InfoCategory = "none" | "phone" | "address" | "link";

export type InfoItem = {
  id: string;
  title: string;
  content: string;
  category: InfoCategory;
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
      category: (item.category as InfoCategory) ?? "none",
      normalizedTitle: normalized(item.title),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function isNameAvailable(title: string): Promise<boolean> {
  const { data } = await client.list({ filter: { title: { eq: title } } });
  return data.length === 0;
}

export async function addInfoItem(title: string, content: string, category: InfoCategory): Promise<void> {
  await client.create({
    id: title,
    title,
    content,
    category,
  });
  revalidatePath("/");
}

export async function deleteInfoItem(id: string): Promise<void> {
  await client.delete({ id });
  revalidatePath("/");
}
