import { getShoppingList, ShoppingItem } from "../__backend/ShoppingService";
import ShoppingItemComponent from "./ShoppingItem";
import { ShoppingProvider } from "./ShoppingContext";

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
      </ShoppingProvider>
    </>
  );
}

export default page;
