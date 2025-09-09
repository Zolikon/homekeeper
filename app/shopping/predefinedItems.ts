import { ShoppingItemType } from "../__backend/shopping.types";

export const predifinedItems: { name: string; type?: ShoppingItemType | null }[] = [
  {
    name: "Tortilla",
    type: ShoppingItemType.FOOD,
  },
  {
    name: "Sajt",
    type: ShoppingItemType.FOOD,
  },
  {
    name: "Felvágott",
    type: ShoppingItemType.FOOD,
  },
  {
    name: "Gyümölcs",
    type: ShoppingItemType.FOOD,
  },
  {
    name: "Paradicsom",
    type: ShoppingItemType.FOOD,
  },
  {
    name: "Csirkemell",
    type: ShoppingItemType.FOOD,
  },
  {
    name: "Tej",
    type: ShoppingItemType.FOOD,
  },
];
