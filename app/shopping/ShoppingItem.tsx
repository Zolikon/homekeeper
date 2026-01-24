"use client";

import { useState } from "react";
import { deleteItem } from "../__backend/ShoppingService";
import type { ShoppingItem } from "../__backend/shopping.types";
import { useShopping } from "./ShoppingContext";
import { ICON_MAP } from "./ItemTypeSelector";
import { MdAutorenew, MdCancel, MdDelete, MdDone, MdVisibilityOff } from "react-icons/md";

const ICON_SIZE = 24;

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
                <MdCancel size={ICON_SIZE} />
              </button>
              <button onClick={confirmRemove}>
                <MdDelete size={ICON_SIZE} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <button onClick={() => context?.hideElement(id)}>
                <MdVisibilityOff size={ICON_SIZE} />
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
          <div className="flex items-center justify-center animate-spin">
            <MdAutorenew size={ICON_SIZE} />
          </div>
        ))}
      {context?.deletedIds.includes(id) && <MdDone size={ICON_SIZE} />}
    </div>
  );
}

export default ShoppingItemComponent;
