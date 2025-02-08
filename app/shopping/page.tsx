import Link from "next/link";
import { getShoppingList } from "../__backend/ShoppingService";
import { ShoppingItem } from "../types";
import AddItem from "./AddItem";
import Item from "./Item";

async function page() {
  const items: ShoppingItem[] = await getShoppingList();
  return (
    <>
      <div className="flex flex-col items-center justify-start gap-3 w-full  ">
        <h1 className="py-4 text-2xl font-extrabold">Shopping List</h1>
        {items.length > 0 ? (
          <div className="w-[90%] flex flex-col items-center h-[65vh] overflow-y-auto gap-2">
            {items.map((item) => (
              <Item key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <p className="text-2xl">No items on list</p>
        )}
      </div>
      <div className="fixed bottom-14 right-4 flex gap-2">
        <AddItem />
        <Link
          href="/"
          className="size-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="material-symbols-outlined text-4xl">home</span>
        </Link>
      </div>
    </>
  );
}

export default page;
