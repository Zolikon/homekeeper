import { getShoppingList } from "../__backend/ShoppingService";
import type { ShoppingItem } from "../__backend/shopping.types";
import { ShoppingProvider } from "./ShoppingContext";
import MenuHolder from "../__components/MenuHolder";
import CardButton from "../__components/CardsButton";
import RefreshButton from "./RefreshButton";
import ShowHiddenButton from "./ShowHiddenButton";
import AddShoppingItem from "./AddShoppingItem";
import HomeButton from "../__components/HomeButton";
import ShoppingList from "./ShoppingList";

async function page() {
  const items: ShoppingItem[] = await getShoppingList();

  return (
    <>
      <ShoppingProvider>
        <ShoppingList items={items} />

        <MenuHolder>
          <RefreshButton />
          <ShowHiddenButton />
          <AddShoppingItem />
          <CardButton />
          <HomeButton />
        </MenuHolder>
      </ShoppingProvider>
    </>
  );
}

export default page;
