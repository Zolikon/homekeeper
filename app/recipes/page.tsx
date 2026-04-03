import { listRecipes } from "../__backend/RecipeService";
import SearchInput from "./SearchInput";
import Link from "next/link";
import HomeButton from "../__components/HomeButton";
import BottomNav from "../__components/BottomNav";
import AddRecipeButton from "../__components/AddRecipeButton";

export default async function RecipesPage(props: {
    searchParams?: Promise<{
        query?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
    const recipes = await listRecipes({ name: query });

    return (
        <div className="flex flex-col h-full w-full">
            <h1 className="text-2xl font-bold p-4 text-center">Receptek</h1>
            <div className="flex-none z-10">
                <SearchInput />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4 pt-0">
                {recipes.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">Nincsenek még receptek</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {recipes.map((recipe) => (
                            <li key={recipe.id}>
                                <Link
                                    href={`/recipe/${recipe.id}`}
                                    className="block p-4 border dark:border-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
                                >
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">{recipe.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <BottomNav>
                <HomeButton />
                <AddRecipeButton />
            </BottomNav>
        </div>
    );
}
