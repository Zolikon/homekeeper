import { Suspense } from "react";
import MenuHolder from "../__components/MenuHolder";
import RefreshButton from "./RefreshButton";
import ShowHiddenButton from "./ShowHiddenButton";
import AddShoppingItem from "./AddShoppingItem";
import HomeButton from "../__components/HomeButton";
import CardButton from "../__components/CardsButton";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-start gap-3 w-full">
      <h1 className="py-4 text-2xl font-extrabold">Shopping List</h1>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      <MenuHolder>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center justify-end">
            <CardButton />
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <RefreshButton />
            <ShowHiddenButton />
            <AddShoppingItem />
            <HomeButton />
          </div>
        </div>
      </MenuHolder>
    </div>
  );
}

export default Layout;
