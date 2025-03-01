"use client";
import { createContext, useContext, useState } from "react";

export interface ShoppingContextType {
  toBeDeleted: string | null;
  setToBeDeleted: (id: string | null) => void;
  deletedIds: string[];
  addDeletedId: (id: string) => void;
  hiddenIds: string[];
  hideElement: (id: string) => void;
  resetHiddenElements: () => void;
}
const ShoppingContext = createContext<ShoppingContextType | null>(null);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const [toBeDeleted, setToBeDeleted] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
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
