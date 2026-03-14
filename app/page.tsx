import { PiBowlFoodFill, PiAirplaneTakeoff } from "react-icons/pi";
import { countPendingItems } from "./__backend/ShoppingService";
import { getVacationInfo } from "./__backend/VacationService";
import { MdOutlineShoppingCart, MdCreditCard, MdPets, MdInfoOutline, MdDone, MdCall } from "react-icons/md";
import { PanelButton } from "./__components/PanelButton";

const ICON_SIZE = 24;

export const dynamic = 'force-dynamic';

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export default async function Home() {
  const [pendingShoppingItems, vacationInfo] = await Promise.all([
    countPendingItems(),
    getVacationInfo(),
  ]);
  const daysToVacation = vacationInfo ? daysUntil(vacationInfo.startDate) : null;
  const vacationUnderway = vacationInfo
    ? daysToVacation !== null && daysToVacation <= 0 && daysUntil(vacationInfo.endDate) >= 0
    : false;

  return (
    <div className="w-full flex flex-col items-center justify-start h-full">
      <img src="/cats.png" alt="cats" className="h-1/4 p-3 z-0 object-contain sm:hidden" />
      <div className="font-extrabold text-center w-full gap-3 grid grid-cols-2 grid-rows-3 overflow-auto px-4 pt-4 pb-2">
        <PanelButton link="/shopping">
          <div className="relative">
            <MdOutlineShoppingCart size={ICON_SIZE} />
            {pendingShoppingItems > 0 && (
              <span className="absolute -top-2 -right-2 text-red-600 rounded-full bg-yellow-300 size-[18px] text-[10px] flex items-center justify-center font-bold">
                {pendingShoppingItems}
              </span>
            )}
          </div>
          <p>Shop</p>
          {pendingShoppingItems === 0 && <MdDone size={ICON_SIZE} />}
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
        <PanelButton link="/vacation">
          <PiAirplaneTakeoff size={ICON_SIZE} />
          <p>Nyaralás</p>
        </PanelButton>
      </div>
      <div className="flex items-center justify-center pb-2">
        {daysToVacation !== null && daysToVacation > 0 && vacationInfo && (
          <p className="text-theme_primary rounded-full bg-white dark:bg-gray-900 px-3 py-1 text-sm font-bold whitespace-nowrap border border-theme_primary">
            Még {daysToVacation} nap {vacationInfo.city}ig
          </p>
        )}
        {vacationUnderway && (
          <p className="text-white rounded-full bg-orange-500 px-3 py-1 text-sm font-bold whitespace-nowrap">
            Nyaralás!
          </p>
        )}
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
