import { PiBowlFoodFill } from "react-icons/pi";
import { countPendingItems } from "./__backend/ShoppingService";
import { MdOutlineShoppingCart, MdCreditCard, MdPets, MdInfoOutline, MdDone } from "react-icons/md";
import { PanelButton } from "./__components/PanelButton";

const ICON_SIZE = 24;

export default async function Home() {
  const pendingShoppingItems = await countPendingItems();

  return (
    <div className="w-full flex flex-col flex-grow items-center justify-start gap-4 h-full">
      <img src="/cats.png" alt="cats" className="h-1/3 p-3 z-0 object-contain sm:hidden" />
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
    </div>
  );
}
