import { PiBowlFoodFill } from "react-icons/pi";
import { countPendingItems } from "./__backend/ShoppingService";
import { MdOutlineShoppingCart, MdCreditCard, MdPets, MdInfoOutline, MdDone, MdCall } from "react-icons/md";
import { PanelButton } from "./__components/PanelButton";

const ICON_SIZE = 24;

export const dynamic = 'force-dynamic';

export default async function Home() {
  const pendingShoppingItems = await countPendingItems();

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4 h-full">
      <img src="/cats.png" alt="cats" className="h-1/4 p-3 z-0 object-contain sm:hidden" />
      <div className="font-extrabold text-center w-full gap-3 h-1/2 grid grid-cols-2 grid-rows-3 overflow-auto p-4">
        <PanelButton link="/shopping">
          <MdOutlineShoppingCart size={ICON_SIZE} />
          <p>Shop</p>
          {pendingShoppingItems > 0 ? (
            <p className=" animate-pulse text-red-600 rounded-full bg-yellow-300 size-6 flex items-center justify-center">
              {pendingShoppingItems}
            </p>
          ) : (
            <MdDone size={ICON_SIZE} />
          )}
        </PanelButton>
        <PanelButton link="/recipes">
          <PiBowlFoodFill size={ICON_SIZE} />
          <p>Recipes</p>
        </PanelButton>
        <PanelButton link="/cards">
          <MdCreditCard size={ICON_SIZE} />
          <p>Cards</p>
        </PanelButton>
        <PanelButton link="/zooplus">
          <MdPets size={ICON_SIZE} />
          <p>Zooplus</p>
        </PanelButton>
        <PanelButton link="/info">
          <MdInfoOutline size={ICON_SIZE} />
          <p>Info</p>
        </PanelButton>
      </div>
      <div className="flex gap-2 items-center h-1/5 p-4 justify-around w-full">
        <a href="tel:+36202967034" className="flex gap-1 items-center justify-center bg-blue-700 text-white rounded-full size-24 p-2">
          <p className="font-extrabold text-3xl">🐄</p>
          <MdCall size={ICON_SIZE} />
        </a>

        <a href="tel:+36205843422" className="flex gap-1 items-center justify-center bg-blue-700 text-white rounded-full size-24 p-2">
          <p className="font-extrabold text-3xl">🐈</p>
          <MdCall size={ICON_SIZE} />
        </a>
      </div>
    </div>
  );
}
