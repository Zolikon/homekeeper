"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react"; // Added useEffect and useState
import { MdSearch } from "react-icons/md";
// Removed useDebounce import as I will implement a simple debounce here or just simple onChange for now.
// Actually, standard practice is to use a debounce. I'll implement a simple one inside.

export default function SearchInput() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const [searchTerm, setSearchTerm] = useState(searchParams.get("query")?.toString() || "");

    const handleSearch = useCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("query", term);
        } else {
            params.delete("query");
        }
        replace(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, replace]);

    // Debounce effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, handleSearch]);


    return (
        <div className="relative flex flex-1 flex-shrink-0 w-full p-4">
            <label htmlFor="search" className="sr-only">
                Receptek keresése
            </label>
            <input
                className="peer block w-full rounded-md border border-gray-200 dark:border-gray-700 py-[9px] pl-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                placeholder="Receptek keresése..."
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                }}
                value={searchTerm} // Controlled input
            />
            <MdSearch className="absolute left-7 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900 dark:peer-focus:text-gray-100" />
        </div>
    );
}
