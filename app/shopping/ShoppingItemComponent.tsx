"use client";

import { useState } from "react";
import { toggleItemStatus, ShoppingItem } from "../__backend/ShoppingService";
import { useShopping } from "./ShoppingContext";

function ShoppingItemComponent({ id, name, note, added, done }: ShoppingItem) {
  const [removeInProgress, setRemoveInProgress] = useState(false);
  const context = useShopping();

  function scheduleRemove() {
    context?.setToBeDeleted(id);
  }

  async function confirmRemove() {
    setRemoveInProgress(true);
    await toggleItemStatus(id);
  }

  function cancelRemove() {
    context?.setToBeDeleted(null);
  }

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

      {!removeInProgress ? (
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
          <input className="size-6" type="checkbox" checked={done} onChange={scheduleRemove} />
        )
      ) : (
        <div>Removing...</div>
      )}
    </div>
  );
}

export default ShoppingItemComponent;
