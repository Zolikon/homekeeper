import { Suspense } from "react";
import BottomNav from "../__components/BottomNav";
import AddInfoItem from "./AddInfoItem";
import HomeButton from "../__components/HomeButton";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full w-full items-center">
      <h1 className="pt-4 text-2xl font-extrabold shrink-0">Info store</h1>
      <p className="text-xs italic shrink-0">Ne tárolj érzékeny adatokat</p>
      <div className="flex-1 min-h-0 w-full flex flex-col items-center">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </div>
      <BottomNav>
        <HomeButton />
        <AddInfoItem />
      </BottomNav>
    </div>
  );
}

export default Layout;
