import { Suspense } from "react";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-start gap-3 w-full h-full overflow-hidden">
      <h1 className="py-4 text-2xl font-extrabold shrink-0">Shopping List</h1>
      <div className="flex-1 min-h-0 w-full flex flex-col items-center">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </div>
    </div>
  );
}

export default Layout;
