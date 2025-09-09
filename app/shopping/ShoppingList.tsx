"use client";

import React from "react";
import { ShoppingItem, ShoppingItemType } from "../__backend/shopping.types";
import ItemTypeSelector from "./ItemTypeSelector";
import ScrollOverflowIndicator from "./ScrollOverflowIndicator";
import ShoppingItemComponent from "./ShoppingItem";
import { useShopping } from "./ShoppingContext";

const ShoppingList: React.FC<{ items: ShoppingItem[] }> = ({ items }) => {
  const [selectedType, setSelectedType] = React.useState<ShoppingItemType>(ShoppingItemType.FOOD);
  const context = useShopping();

  function countItemTypes(): Record<ShoppingItemType, number> {
    return items.reduce((acc, item) => {
      if (context?.deletedIds.includes(item.id)) {
        return acc;
      }
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<ShoppingItemType, number>);
  }

  return (
    <div className="flex flex-col items-center justify-start gap-3 w-full h-full md:w-4/5">
      <ItemTypeSelector currentType={selectedType} setCurrentType={setSelectedType} count={countItemTypes()} />
      <ScrollOverflowIndicator>
        {items
          .filter((item) => item.type === selectedType)
          .map((item) => (
            <ShoppingItemComponent key={item.id} {...item} />
          ))}
      </ScrollOverflowIndicator>
    </div>
  );
};

export default ShoppingList;
