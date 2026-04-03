"use client";
import { useRef, useState } from "react";
import { useZooplusCart } from "./ZooplusContext";
import CopyButton from "../__components/CopyButton";
import { MdShoppingCart } from "react-icons/md";

function FinalOrderButton() {
  const { cart } = useZooplusCart() ?? { cart: [] };
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [order, setOrder] = useState<string>("");

  function openDialog() {
    setOrder(cart.map((item) => `${item.url} ➡️ ${item.bundleSize} x ${item.amount} db`).join("\n"));
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button
        className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70 disabled:opacity-40 relative"
        onClick={openDialog}
        disabled={cart.length === 0}
      >
        <span className="relative">
          <MdShoppingCart size={22} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] size-4 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </span>
        <span>Rendelés</span>
      </button>
      <dialog ref={dialogRef} className="rounded-xl mt-10 w-[90%] h-[80%]">
        <div className="flex flex-col gap-4 p-4 bg-gray-200 rounded-lg items-center size-full">
          <textarea
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            className="w-full h-full p-2 rounded-lg resize-none flex-grow-1"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />
          <div className="flex gap-4 items-center justify-center">
            <CopyButton text={order} />
            <button
              onClick={() => dialogRef.current?.close()}
              className="bg-blue-500 disabled:bg-gray-400 text-white rounded-lg p-2 w-1/2 flex items-center justify-center"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default FinalOrderButton;
