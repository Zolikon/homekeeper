export enum ShoppingItemType {
  FOOD = "food",
  HOUSE = "house",
  CAR = "car",
  CAT = "cat",
  OTHER = "other",
}

export type ShoppingItem = {
  id: string;
  name: string;
  added: Date;
  type: ShoppingItemType;
};
