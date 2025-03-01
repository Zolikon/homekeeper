import { getShoppingList, ShoppingItem } from "../__backend/ShoppingService";
import AddShoppingItem from "./AddShoppingItem";
import ShoppingItemComponent from "./ShoppingItem";
import HomeButton from "../__components/HomeButton";
import RefreshButton from "./RefreshButton";
import { ShoppingProvider } from "./ShoppingContext";
import ShowHiddenButton from "./ShowHiddenButton";

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
        <div className="fixed bottom-14 right-4 flex gap-2">
          <RefreshButton />
          <ShowHiddenButton />
          <AddShoppingItem />
          <HomeButton />
        </div>
      </ShoppingProvider>
    </>
  );
}

export default page;
