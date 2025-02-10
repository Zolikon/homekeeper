"use client";
import { createContext, useContext, useState } from "react";

export interface ShoppingContextType {
  toBeDeleted: string | null;
  setToBeDeleted: (id: string | null) => void;
}
const ShoppingContext = createContext<ShoppingContextType | null>(null);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const [toBeDeleted, setToBeDeleted] = useState<string | null>(null);
  return <ShoppingContext.Provider value={{ toBeDeleted, setToBeDeleted }}>{children}</ShoppingContext.Provider>;
}

function useShopping() {
  return useContext(ShoppingContext);
}

export { ShoppingContext, useShopping };
