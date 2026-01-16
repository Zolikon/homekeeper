import { listRecipes } from "../__backend/RecipeService";
import SearchInput from "./SearchInput";
import Link from "next/link";
import HomeButton from "../__components/HomeButton";
import MenuHolder from "../__components/MenuHolder";
import AddRecipeButton from "../__components/AddRecipeButton";

// Wait, the requirements say "On this page user can see a search field for name only... and under them a list of all the available recipes displayed by name".
// It doesn't explicitly ask for an "Add" button yet, but "user can add recipes under its own endpoint" is the high level goal.
// "Subtasks -> - [ ] add a new endpoint under /recipes... On this page user can see a search field... and under them a list".
// I will focus on the search and list.

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
            <div className="flex-grow overflow-y-auto p-4 pt-0">
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
            <MenuHolder>
                <AddRecipeButton />
                <HomeButton />
            </MenuHolder>
        </div>
    );
}
