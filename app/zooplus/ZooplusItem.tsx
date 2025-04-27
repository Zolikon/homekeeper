"use client";

import { ZooplusItem } from "./items";
import { useZooplusCart } from "./ZooplusContext";

export default function ZooplusItemDisplay({ item }: { item: ZooplusItem }) {
  const { updateCart, itemAmount } = useZooplusCart() ?? {
    updateCart: () => {},
    itemAmount: () => 0,
  };
  const amount = itemAmount(item.url);
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg p-2 w-[80%] md:w-[40%] my-2 ${
        amount > 0 && "bg-green-500 text-black"
      } shadow-lg transition-colors`}
    >
      {item.imgUrl ? (
        <img src={item.imgUrl} alt={item.name} className="w-16 h-16 rounded-lg" />
      ) : (
        <div className="size-16 aspect-square bg-gray-300 flex items-center justify-center rounded-lg">
          <span className="material-symbols-outlined">pets</span>
        </div>
      )}
      <div className="flex flex-col items-center justify-between w-full">
        <div className="flex items-center justify-between w-full">
          <p>
            {item.name} {item.bundleSize ? "- " + item.bundleSize : ""}
          </p>
        </div>
        <div className="flex items-center justify-start gap-2 w-full">
          <button onClick={() => updateCart(item.url, item.bundleSize, amount + 1)}>
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
          <p className="select-none">{amount}</p>
          <button onClick={() => updateCart(item.url, item.bundleSize, amount - 1)} disabled={amount <= 0}>
            <span className="material-symbols-outlined text-2xl">remove</span>
          </button>
          {amount > 0 && (
            <button onClick={() => updateCart(item.url, item.bundleSize, 0)}>
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          )}
        </div>
      </div>
      <button>
        <a rel="noopener noreferrer" target="_blank" href={item.url}>
          <span className="material-symbols-outlined text-2xl">open_in_new</span>
        </a>
      </button>
    </div>
  );
}
