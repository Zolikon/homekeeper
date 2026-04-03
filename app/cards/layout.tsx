import { Suspense } from "react";
import BottomNav from "../__components/BottomNav";
import HomeButton from "../__components/HomeButton";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full w-full items-center">
      <h1 className="py-4 text-2xl font-extrabold shrink-0">Cards</h1>
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </div>
      <BottomNav>
        <HomeButton />
      </BottomNav>
    </div>
  );
}

export default Layout;
