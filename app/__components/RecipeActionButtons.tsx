"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Recipe } from "../__backend/recipe.types";
import { updateRecipe, deleteRecipe } from "../__backend/RecipeService";
import RecipeModal from "./RecipeModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { MdDelete, MdEdit } from "react-icons/md";

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
                onClick={() => setIsUpdateModalOpen(true)}
                className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70"
                title="Recept szerkesztése"
            >
                <MdEdit size={22} />
                <span>Szerkeszt</span>
            </button>
            <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70"
                title="Recept törlése"
            >
                <MdDelete size={22} />
                <span>Töröl</span>
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
                title="Recept törlése"
                message={`Biztosan törlöd a(z) "${recipe.name}" receptet? Ez a művelet nem visszafordítható.`}
                isDeleting={isDeleting}
            />
        </>
    );
}
