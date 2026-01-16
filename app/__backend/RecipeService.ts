"use server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
import { Recipe } from "./recipe.types";
import { normalizeString } from "./utils";

Amplify.configure(outputs);
const client = generateClient<Schema>().models.Recipe;

export type RecipeFilter = {
    name?: string;
    ingredients?: string;
};



export async function listRecipes(filter?: RecipeFilter): Promise<Recipe[]> {
    const { data } = await client.list();

    let recipes: Recipe[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        ingredients: item.ingredients.filter((i): i is string => i !== null),
    }));

    if (filter) {
        if (filter.name) {
            const normalizedName = normalizeString(filter.name);
            recipes = recipes.filter((r) => normalizeString(r.name).includes(normalizedName));
        }
        if (filter.ingredients) {
            const normalizedIng = normalizeString(filter.ingredients);
            recipes = recipes.filter((r) =>
                r.ingredients.some((i) => normalizeString(i).includes(normalizedIng))
            );
        }
    }

    return recipes.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
    const { data } = await client.get({ id });
    if (!data) return undefined;
    return {
        id: data.id,
        name: data.name,
        ingredients: data.ingredients.filter((i): i is string => i !== null),
    };
}

export async function addRecipe(recipe: Omit<Recipe, "id">): Promise<Recipe> {
    const newId = randomUUID();
    const newRecipe = {
        id: newId,
        name: recipe.name,
        ingredients: recipe.ingredients,
    };
    await client.create(newRecipe);
    revalidatePath("/recipes");
    return newRecipe;
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
    await client.update({
        id: recipe.id,
        name: recipe.name,
        ingredients: recipe.ingredients,
    });
    revalidatePath("/recipes");
}

export async function deleteRecipe(id: string): Promise<void> {
    await client.delete({ id });
    revalidatePath("/recipes");
}
