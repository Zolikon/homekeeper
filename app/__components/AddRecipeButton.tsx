"use client";

import { useState } from "react";
import RecipeModal from "./RecipeModal";
import { addRecipe } from "../__backend/RecipeService";
import { Recipe } from "../__backend/recipe.types";

export default function AddRecipeButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAdd = async (recipe: Omit<Recipe, "id">) => {
        await addRecipe(recipe);
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="size-12 md:size-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
            >
                <span className="material-symbols-outlined text-4xl">add</span>
            </button>

            <RecipeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAdd}
            />
        </>
    );
}
