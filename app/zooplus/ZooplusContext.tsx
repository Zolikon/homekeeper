"use client";
import { createContext, useContext, useState } from "react";
import { initialItems, ZooplusItem } from "./items";

export interface ZooplusContextType {
  cart: { url: string; bundleSize: string; amount: number }[];
  items: { name: string; imgUrl?: string; url: string; bundleSize: string }[];
  cartSize: number;
  updateCart: (url: string, bundleSize: string, amount: number) => void;
  itemAmount: (url: string) => number;
  addToItems: (name: string, url: string, bundleSize: string) => void;
}
const ZooplusContext = createContext<ZooplusContextType | null>(null);

export function ZooplusProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ZooplusItem[]>(initialItems);
  const [cart, setCart] = useState<{ url: string; bundleSize: string; amount: number }[]>([]);

  function updateCart(url: string, bundleSize: string, amount: number) {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.url === url && item.bundleSize === bundleSize);
      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].amount = amount;
        if (updatedCart[existingItemIndex].amount <= 0) {
          updatedCart.splice(existingItemIndex, 1);
        }
        return updatedCart;
      } else {
        return [...prevCart, { url, bundleSize, amount }];
      }
    });
  }

  function addToItems(name: string, url: string, bundleSize: string) {
    setItems((prevItems) => {
      if (prevItems.some((item) => item.url === url)) {
        return prevItems;
      }
      return [...prevItems, { name, url, bundleSize }];
    });
  }
  return (
    <ZooplusContext.Provider
      value={{
        cart,
        items,
        updateCart,
        addToItems,
        itemAmount: (url: string) => {
          const item = cart.find((item) => item.url === url);
          return item ? item.amount : 0;
        },
        cartSize: cart.length,
      }}
    >
      {children}
    </ZooplusContext.Provider>
  );
}

function useZooplusCart() {
  return useContext(ZooplusContext);
}

export { ZooplusContext, useZooplusCart };
