import { counCompletedItems } from "../__backend/ShoppingService";
import HomeButton from "../__components/HomeButton";
import MenuHolder from "../__components/MenuHolder";
import ClearFinished from "./ClearFinished";

async function page() {
  const completedShoppingItems = await counCompletedItems();
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 h-[60%]">
      <ClearFinished completedShoppingItems={completedShoppingItems} />
      <MenuHolder>
        <HomeButton />
      </MenuHolder>
    </div>
  );
}

export default page;
