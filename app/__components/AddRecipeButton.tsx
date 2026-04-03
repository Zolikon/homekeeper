"use client";

import { useState } from "react";
import RecipeModal from "./RecipeModal";
import { addRecipe } from "../__backend/RecipeService";
import { Recipe } from "../__backend/recipe.types";
import { MdAdd } from "react-icons/md";

export default function AddRecipeButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = async (recipe: Omit<Recipe, "id">) => {
    await addRecipe(recipe);
  };

  return (
    <>
      <button
        className="flex flex-col items-center gap-0.5 text-white text-xs"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="bg-white rounded-full size-10 -mt-4 shadow-lg flex items-center justify-center text-theme_primary">
          <MdAdd size={22} />
        </div>
        <span>Recept</span>
      </button>

      <RecipeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdd}
      />
    </>
  );
}
