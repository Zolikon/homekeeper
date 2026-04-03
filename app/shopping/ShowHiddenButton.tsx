"use client";
import { useShopping } from "./ShoppingContext";
import { MdVisibility } from "react-icons/md";

function ShowHiddenButton() {
  const context = useShopping();

  return (
    <button
      className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70 disabled:opacity-40 relative"
      disabled={context?.hiddenIds.length === 0}
      onClick={() => context?.resetHiddenElements()}
    >
      <span className="relative">
        <MdVisibility size={22} />
        {context?.hiddenIds && context.hiddenIds.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] size-4 flex items-center justify-center">
            {context.hiddenIds.length}
          </span>
        )}
      </span>
      <span>Rejtett</span>
    </button>
  );
}

export default ShowHiddenButton;
