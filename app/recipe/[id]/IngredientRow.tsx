"use client";

import { useState } from "react";
import { MdCheck, MdAddShoppingCart } from "react-icons/md";
import { addItem, deleteItem } from "../../__backend/ShoppingService";
import { ShoppingItemType } from "../../__backend/shopping.types";

interface IngredientRowProps {
    ingredient: string;
    initialShoppingItemId?: string;
}

export default function IngredientRow({ ingredient, initialShoppingItemId }: IngredientRowProps) {
    const [shoppingItemId, setShoppingItemId] = useState<string | undefined>(initialShoppingItemId);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            if (shoppingItemId) {
                // Remove from list
                await deleteItem(shoppingItemId);
                setShoppingItemId(undefined);
            } else {
                // Add to list
                const newId = await addItem(ingredient, ShoppingItemType.FOOD);
                setShoppingItemId(newId);
            }
        } catch (error) {
            console.error("Failed to toggle item in shopping list", error);
        } finally {
            setIsLoading(false);
        }
    };

    const added = !!shoppingItemId;

    return (
        <div className="flex items-center justify-between py-1 group">
            <span className="text-gray-800 dark:text-gray-300">{ingredient}</span>
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`
          p-2 rounded-full transition-all duration-200
          ${added
                        ? "text-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
                        : "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95"
                    }
        `}
                aria-label={added ? "Remove from shopping list" : "Add to shopping list"}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : added ? (
                    <MdCheck size={20} />
                ) : (
                    <MdAddShoppingCart size={20} />
                )}
            </button>
        </div>
    );
}
