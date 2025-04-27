import Link from "next/link";
import { countPendingItems } from "./__backend/ShoppingService";

export default async function Home() {
  const pendingShoppingItems = await countPendingItems();

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 h-[60%]">
      <Link
        href="/shopping"
        className="bg-theme_primary font-extrabold text-2xl p-2 rounded-lg w-4/5 text-center flex gap-2 items-center justify-center"
      >
        <span className="material-symbols-outlined">shopping_cart</span>
        <p>Shopping</p>
        {pendingShoppingItems > 0 ? (
          <p className=" animate-pulse text-red-600 rounded-full bg-yellow-300 size-10 flex items-center justify-center">
            {pendingShoppingItems}
          </p>
        ) : (
          <span className="material-symbols-outlined">done</span>
        )}
      </Link>
      <Link
        href="/cards"
        className="bg-theme_primary font-extrabold text-2xl p-2 rounded-lg w-4/5 text-center flex gap-2 items-center justify-center"
      >
        <span className="material-symbols-outlined">credit_card</span>
        <p>Shopping cards</p>
      </Link>
      <Link
        href="/zooplus"
        className="bg-theme_primary font-extrabold text-2xl p-2 rounded-lg w-4/5 text-center flex gap-2 items-center justify-center"
      >
        <span className="material-symbols-outlined">pets</span>
        <p>Zooplus</p>
      </Link>
      <Link
        href="/info"
        className="bg-theme_primary font-extrabold text-2xl p-2 rounded-lg w-4/5 text-center flex gap-2 items-center justify-center"
      >
        <span className="material-symbols-outlined">info</span>
        <p>Info store</p>
      </Link>
    </div>
  );
}
