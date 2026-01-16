"use client";

import { useState } from "react";
import { Recipe } from "../__backend/recipe.types";
import { MdAdd, MdDelete } from "react-icons/md";

interface RecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (recipe: Omit<Recipe, "id">) => Promise<void>;
    initialData?: Recipe;
}

export default function RecipeModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}: RecipeModalProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [ingredients, setIngredients] = useState<string[]>(
        initialData?.ingredients || [""]
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleAddIngredient = () => {
        setIngredients([...ingredients, ""]);
    };

    const handleIngredientChange = (index: number, value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const handleRemoveIngredient = (index: number) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Filter out empty values
            const cleanIngredients = ingredients.filter((i) => i.trim() !== "");

            await onSubmit({
                name,
                ingredients: cleanIngredients,
            });
            onClose();
            // Reset form if creating new (optional, but good UX)
            if (!initialData) {
                setName("");
                setIngredients([""]);
            }
        } catch (error) {
            console.error("Failed to save recipe", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col border dark:border-gray-700">
                <div className="p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {initialData ? "Edit Recipe" : "Add Recipe"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            required
                            autoFocus={name === ""}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Recipe Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Ingredients
                        </label>
                        <div className="space-y-2">
                            {ingredients.map((ingredient, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        autoFocus={name !== "" && ingredient == ""}
                                        value={ingredient}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleAddIngredient();
                                            }
                                        }}
                                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                                        className="flex-grow p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="Ingredient"
                                    />
                                    {ingredients.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveIngredient(index)}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-md transition-colors"
                                        >
                                            <MdDelete size={24} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddIngredient}
                                className="text-blue-600 dark:text-blue-400 text-sm font-medium group flex items-center gap-1"
                            >
                                <MdAdd size={24} />
                                <p className="group-hover:underline">Add Ingredient</p>
                            </button>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3 sticky bottom-0 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Add Recipe"}
                    </button>
                </div>
            </div>
        </div>
    );
}
