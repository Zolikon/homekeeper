"use client";

import { useZooplusCart } from "./ZooplusContext";
import ZooplusItemDisplay from "./ZooplusItem";

export default function ZooplusList() {
  const { items } = useZooplusCart() ?? { items: [] };
  return (
    <div className="flex flex-col flex-1 min-h-0 mt-4 items-center justify-start w-full overflow-y-auto">
      {items.map((item, index) => (
        <ZooplusItemDisplay key={index} item={item} />
      ))}
    </div>
  );
}
