"use client";

import { useState } from "react";
import { deleteItem } from "../__backend/ShoppingService";
import type { ShoppingItem } from "../__backend/shopping.types";
import { useShopping } from "./ShoppingContext";
import { ICON_MAP } from "./ItemTypeSelector";

function ShoppingItemComponent({ id, type, name, added }: ShoppingItem) {
  const [removeInProgress, setRemoveInProgress] = useState(false);
  const context = useShopping();

  function scheduleRemove() {
    context?.setToBeDeleted(id);
  }

  async function confirmRemove() {
    setRemoveInProgress(true);
    await deleteItem(id);
    setRemoveInProgress(false);
    context?.setToBeDeleted(null);
    context?.addDeletedId(id);
  }

  function cancelRemove() {
    context?.setToBeDeleted(null);
  }
  if (context?.hiddenIds.includes(id)) return null;

  return (
    <div
      className={`flex items-center justify-between  ${
        context?.toBeDeleted === id ? "bg-red-400" : "bg-gray-500"
      } rounded-lg p-2 w-[95%] md:w-[40%] my-2 transition-all duration-500 h-[80px] min-h-[80px] px-5`}
    >
      <div className="flex gap-4 items-center w-[85%]">
        {ICON_MAP[type]}
        <div className="w-3/5">
          <h2 className="font-bold md:text-lg break-words whitespace-pre-line">{name}</h2>
          <p className="text-xs">{added.toLocaleDateString()}</p>
        </div>
      </div>
      {!context?.deletedIds.includes(id) &&
        (!removeInProgress ? (
          context?.toBeDeleted === id ? (
            <div className="flex flex-col gap-2 items-center">
              <button onClick={cancelRemove}>
                <span className="material-symbols-outlined text-2xl">cancel</span>
              </button>
              <button onClick={confirmRemove}>
                <span className="material-symbols-outlined text-2xl">delete</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <button onClick={() => context?.hideElement(id)}>
                <span className="material-symbols-outlined text-xl">visibility_off</span>
              </button>
              <input
                className="size-6"
                type="checkbox"
                checked={context?.deletedIds.includes(id)}
                onChange={scheduleRemove}
              />
            </div>
          )
        ) : (
          <div>
            <span className="material-symbols-outlined animate-spin text-2xl">autorenew</span>
          </div>
        ))}
      {context?.deletedIds.includes(id) && <span className="material-symbols-outlined">done</span>}
    </div>
  );
}

export default ShoppingItemComponent;
