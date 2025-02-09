import { Suspense } from "react";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-start gap-3 w-full">
      <h1 className="pt-4 text-2xl font-extrabold">Info store</h1>
      <p className=" text-xs italic">{"Not secure, don't store sensitive info"}</p>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
}

export default Layout;
