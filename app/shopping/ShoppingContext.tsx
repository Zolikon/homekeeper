"use client";
import { createContext, useContext, useState } from "react";
import { ShoppingItemType } from "../__backend/shopping.types";

export interface ShoppingContextType {
  toBeDeleted: string | null;
  setToBeDeleted: (id: string | null) => void;
  deletedIds: string[];
  addDeletedId: (id: string) => void;
  hiddenIds: string[];
  hideElement: (id: string) => void;
  resetHiddenElements: () => void;
  selectedType: ShoppingItemType;
  setSelectedType: (type: ShoppingItemType) => void;
}
const ShoppingContext = createContext<ShoppingContextType | null>(null);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const [toBeDeleted, setToBeDeleted] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<ShoppingItemType>(ShoppingItemType.FOOD);
  return (
    <ShoppingContext.Provider
      value={{
        toBeDeleted,
        setToBeDeleted,
        deletedIds,
        addDeletedId: (id) => setDeletedIds((c) => [...c, id]),
        hiddenIds,
        hideElement: (id) => setHiddenIds((c) => [...c, id]),
        resetHiddenElements: () => setHiddenIds([]),
        selectedType,
        setSelectedType,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}

function useShopping() {
  return useContext(ShoppingContext);
}

export { ShoppingContext, useShopping };
