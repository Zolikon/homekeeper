"use client";

import { useState } from "react";
import { deleteItem, ShoppingItem } from "../__backend/ShoppingService";
import { useShopping } from "./ShoppingContext";

function ShoppingItemComponent({ id, name, note, added, done }: ShoppingItem) {
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
      } rounded-lg p-2 w-[80%] md:w-[40%] my-2 transition-all duration-500 h-[75px] px-5`}
    >
      <div>
        <h2 className="font-bold text-xl">{name}</h2>
        <p>{note}</p>
        <p className="text-xs">{added.toLocaleDateString()}</p>
      </div>
      {!context?.deletedIds.includes(id) &&
        (!removeInProgress ? (
          context?.toBeDeleted === id ? (
            <div className="flex gap-4 items-center">
              <button onClick={confirmRemove}>
                <span className="material-symbols-outlined text-3xl">delete</span>
              </button>
              <button onClick={cancelRemove}>
                <span className="material-symbols-outlined text-3xl">cancel</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <button onClick={() => context?.hideElement(id)}>
                <span className="material-symbols-outlined text-xl">visibility_off</span>
              </button>
              <input
                className="size-6"
                type="checkbox"
                disabled={!!context?.toBeDeleted && context?.toBeDeleted !== id}
                checked={done}
                onChange={scheduleRemove}
              />
            </div>
          )
        ) : (
          <div>Removing...</div>
        ))}
      {context?.deletedIds.includes(id) && <span className="material-symbols-outlined">done</span>}
    </div>
  );
}

export default ShoppingItemComponent;
