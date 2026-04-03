import Link from "next/link";
import { IoHome } from "react-icons/io5";

function HomeButton() {
  return (
    <Link
      href="/"
      className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70"
    >
      <IoHome size={22} />
      <span>Főoldal</span>
    </Link>
  );
}

export default HomeButton;
