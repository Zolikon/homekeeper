"use client";

import { useZooplusCart } from "./ZooplusContext";
import ZooplusItemDisplay from "./ZooplusItem";

export default function ZooplusList() {
  const { items } = useZooplusCart() ?? { items: [] };
  return (
    <div className="flex flex-col mt-4 items-center justify-center w-full h-2/3 overflow-y-auto">
      {items.map((item, index) => (
        <ZooplusItemDisplay key={index} item={item} />
      ))}
    </div>
  );
}
