import Link from "next/link";
import { MdCreditCard } from "react-icons/md";

function CardButton() {
  return (
    <Link
      href="/cards"
      className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70"
    >
      <MdCreditCard size={22} />
      <span>Kártyák</span>
    </Link>
  );
}

export default CardButton;
