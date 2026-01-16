"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Recipe } from "../__backend/recipe.types";
import { updateRecipe, deleteRecipe } from "../__backend/RecipeService";
import RecipeModal from "./RecipeModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface RecipeActionButtonsProps {
    recipe: Recipe;
}

export default function RecipeActionButtons({ recipe }: RecipeActionButtonsProps) {
    const router = useRouter();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdate = async (updatedData: Omit<Recipe, "id">) => {
        await updateRecipe({
            id: recipe.id,
            ...updatedData,
        });
        // The page will be revalidated by the server action, but we might want to refresh client cache if needed.
        // Usually server action revalidatePath is enough.
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteRecipe(recipe.id);
            router.push("/recipes");
        } catch (error) {
            console.error("Failed to delete recipe", error);
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="size-12 md:size-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                title="Delete Recipe"
            >
                <span className="material-symbols-outlined text-3xl md:text-4xl">delete</span>
            </button>
            <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="size-12 md:size-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                title="Update Recipe"
            >
                <span className="material-symbols-outlined text-3xl md:text-4xl">edit</span>
            </button>


            <RecipeModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleUpdate}
                initialData={recipe}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Recipe"
                message={`Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`}
                isDeleting={isDeleting}
            />
        </>
    );
}
