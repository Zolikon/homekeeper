import Link from "next/link";
import { IoHome } from "react-icons/io5";

function HomeButton() {
  return (
    <Link
      href="/"
      className="size-12 md:size-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"
    >
      <IoHome size={24} />
    </Link>
  );
}

export default HomeButton;
