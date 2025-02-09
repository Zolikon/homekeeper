"use client";

import { useState } from "react";
import { toggleItemStatus } from "../__backend/ShoppingService";
import { ShoppingItem } from "../types";

function ShoppingItemComponent({ id, name, note, added, done }: ShoppingItem) {
  const [toBeRemoved, setToBeRemoved] = useState(false);
  const [removeInProgress, setRemoveInProgress] = useState(false);

  function scheduleRemove() {
    setToBeRemoved(true);
  }

  async function confirmRemove() {
    setRemoveInProgress(true);
    await toggleItemStatus(id);
  }

  function cancelRemove() {
    setToBeRemoved(false);
  }

  return (
    <div
      className={`flex items-center justify-between  ${
        toBeRemoved ? "bg-red-400" : "bg-gray-500"
      } rounded-lg p-2 w-[90%] my-2 transition-all duration-500 h-[75px] px-5`}
    >
      <div>
        <h2 className="font-bold text-">{name}</h2>
        <p>{note}</p>
        <p className="text-xs">{added.toLocaleDateString()}</p>
      </div>

      {!removeInProgress ? (
        toBeRemoved ? (
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
