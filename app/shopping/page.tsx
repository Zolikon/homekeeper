import { getShoppingList } from "../__backend/ShoppingService";
import type { ShoppingItem } from "../__backend/shopping.types";
import { ShoppingProvider } from "./ShoppingContext";
import BottomNav from "../__components/BottomNav";
import CardButton from "../__components/CardsButton";
import RefreshButton from "./RefreshButton";
import ShowHiddenButton from "./ShowHiddenButton";
import AddShoppingItem from "./AddShoppingItem";
import HomeButton from "../__components/HomeButton";
import ShoppingList from "./ShoppingList";

export const dynamic = 'force-dynamic';

async function page() {
  const items: ShoppingItem[] = await getShoppingList();

  return (
    <ShoppingProvider>
      <div className="flex flex-col h-full w-full">
        <ShoppingList items={items} />
        <BottomNav>
          <HomeButton />
          <RefreshButton />
          <ShowHiddenButton />
          <AddShoppingItem />
          <CardButton />
        </BottomNav>
      </div>
    </ShoppingProvider>
  );
}

export default page;
