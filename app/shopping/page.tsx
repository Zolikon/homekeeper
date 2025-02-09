import { getShoppingList } from "../__backend/ShoppingService";
import { ShoppingItem } from "../types";
import AddShoppingItem from "./AddShoppingItem";
import ShoppingItemComponent from "./ShoppingItemComponent";
import HomeButton from "../__components/HomeButton";

async function page() {
  const items: ShoppingItem[] = await getShoppingList();
  return (
    <>
      <div className="flex flex-col items-center justify-start gap-3 w-full  ">
        {items.length > 0 ? (
          <div className="w-[90%] flex flex-col items-center h-[65vh] overflow-y-auto gap-2">
            {items.map((item) => (
              <ShoppingItemComponent key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <p className="text-2xl">No items on list</p>
        )}
      </div>
      <div className="fixed bottom-14 right-4 flex gap-2">
        <AddShoppingItem />
        <HomeButton />
      </div>
    </>
  );
}

export default page;
