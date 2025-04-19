import { getShoppingList, ShoppingItem } from "../__backend/ShoppingService";
import ShoppingItemComponent from "./ShoppingItem";
import { ShoppingProvider } from "./ShoppingContext";
import MenuHolder from "../__components/MenuHolder";
import CardButton from "../__components/CardsButton";
import RefreshButton from "./RefreshButton";
import ShowHiddenButton from "./ShowHiddenButton";
import AddShoppingItem from "./AddShoppingItem";
import HomeButton from "../__components/HomeButton";

async function page() {
  const items: ShoppingItem[] = await getShoppingList();
  return (
    <>
      <ShoppingProvider>
        <div className="flex flex-col items-center justify-start gap-3 w-full md:w-4/5">
          {items.length > 0 ? (
            <div className="w-[90%] flex flex-col items-center h-[60vh] md:h-[80vh] overflow-y-auto gap-2">
              {items.map((item) => (
                <ShoppingItemComponent key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <p className="text-2xl">No items on list</p>
          )}
        </div>
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
