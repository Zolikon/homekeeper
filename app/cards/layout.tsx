import { Suspense } from "react";
import HomeButton from "../__components/HomeButton";
import MenuHolder from "../__components/MenuHolder";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-start gap-3 w-full">
      <h1 className="py-4 text-2xl font-extrabold">Cards</h1>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      <MenuHolder>
        <HomeButton />
      </MenuHolder>
    </div>
  );
}

export default Layout;
