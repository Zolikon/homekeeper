import Link from "next/link";

export const PanelButton = ({ children, link }: { children: React.ReactNode; link: string }) => {
  return (
    <Link
      href={link}
      className="bg-theme_primary  p-2 rounded-lg w-full h-1/2 text-center flex gap-2 items-center justify-between"
    >
      {children}
    </Link>
  );
};
