import { getRecipe } from "../../__backend/RecipeService";
import { getShoppingList } from "../../__backend/ShoppingService";
import MenuHolder from "../../__components/MenuHolder";
import HomeButton from "../../__components/HomeButton";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import RecipeActionButtons from "../../__components/RecipeActionButtons";
import IngredientRow from "./IngredientRow";
import { normalizeString } from "@/app/__backend/utils";
import ShoppingButton from "@/app/__components/ShoppingButton";

export default async function RecipePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const recipe = await getRecipe(params.id);
    const shoppingList = await getShoppingList();

    // Create a Map of normalized shopping list item names to ids for efficient lookup
    const normalizedShoppingDocs = new Map(
        shoppingList.map((item) => [normalizeString(item.name), item.id])
    );

    if (!recipe) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-xl text-gray-500">Recipe not found</p>
                <Link href="/recipes" className="mt-4 text-blue-500 underline">
                    Back to Recipes
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header with Back Button */}
            <div className="flex items-center p-4 border-b dark:border-gray-800">
                <Link href="/recipes" className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <MdArrowBack size={24} className="text-gray-700 dark:text-gray-300" />
                </Link>
                <h1 className="text-2xl font-bold truncate flex-1 text-gray-900 dark:text-white">{recipe.name}</h1>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                {/* Ingredients Section */}
                <div>
                    <h2 className="text-lg font-semibold mb-2 border-b dark:border-gray-800 pb-1 text-gray-900 dark:text-white">Hozzávalók</h2>
                    <div className="flex flex-col space-y-1">
                        {recipe.ingredients.map((ingredient, index) => {
                            const shoppingItemId = normalizedShoppingDocs.get(normalizeString(ingredient));
                            return (
                                <IngredientRow
                                    key={index}
                                    ingredient={ingredient}
                                    initialShoppingItemId={shoppingItemId}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <MenuHolder>
                <RecipeActionButtons recipe={recipe} />
                <ShoppingButton />
                <HomeButton />
            </MenuHolder>
        </div>
    );
}
