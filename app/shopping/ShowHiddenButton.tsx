"use client";
import { useShopping } from "./ShoppingContext";

function ShowHiddenButton() {
  const context = useShopping();

  return (
    <button
      className="size-12 md:size-16 bg-blue-500 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center shadow-lg relative"
      disabled={context?.hiddenIds.length === 0}
      onClick={() => context?.resetHiddenElements()}
    >
      <span className="material-symbols-outlined text-4xl">visibility</span>
      {context?.hiddenIds && context?.hiddenIds.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 text-xs size-6">
          {context?.hiddenIds.length}
        </span>
      )}
    </button>
  );
}

export default ShowHiddenButton;
