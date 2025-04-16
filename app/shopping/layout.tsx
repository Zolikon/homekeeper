import { Suspense } from "react";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-start gap-3 w-full">
      <h1 className="py-4 text-2xl font-extrabold">Shopping List</h1>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
}

export default Layout;
