import Link from "next/link";
import { countPendingItems } from "./__backend/ShoppingService";

export default async function Home() {
  const pendingShoppingItems = await countPendingItems();

  return (
    <div className="w-full flex flex-col flex-grow items-center justify-center gap-4 h-full relative -top-10">
      <img src="/cats.png" className="absolute z-0 object-contain sm:hidden" />
      <div className="font-extrabold text-center z-10 w-1/2 relative -left-[20%] -top-[3%] gap-3 flex flex-col">
        <Link
          href="/shopping"
          className="bg-theme_primary  p-2 rounded-lg w-4/5 text-center flex gap-2 items-center justify-between h-[50px]"
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          <p>Shop</p>
          {pendingShoppingItems > 0 ? (
            <p className=" animate-pulse text-red-600 rounded-full bg-yellow-300 size-6 flex items-center justify-center">
              {pendingShoppingItems}
            </p>
          ) : (
            <span className="material-symbols-outlined">done</span>
          )}
        </Link>
        <Link
          href="/cards"
          className="bg-theme_primary p-2 rounded-lg w-4/5 text-center flex gap-2 items-center justify-between h-[50px]"
        >
          <span className="material-symbols-outlined">credit_card</span>
          <p>Cards</p>
        </Link>
        <Link
          href="/zooplus"
          className="bg-theme_primary p-2 rounded-lg w-4/5 text-center flex gap-2 items-center justify-between h-[50px]"
        >
          <span className="material-symbols-outlined">pets</span>
          <p>Zooplus</p>
        </Link>
        <Link
          href="/info"
          className="bg-theme_primary p-2 rounded-lg w-4/5 text-center flex gap-2 items-center justify-between h-[50px]"
        >
          <span className="material-symbols-outlined">info</span>
          <p>Info</p>
        </Link>
      </div>
    </div>
  );
}
