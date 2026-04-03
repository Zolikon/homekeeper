import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";

function ShoppingButton() {
  return (
    <Link
      href="/shopping"
      className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70"
    >
      <FaShoppingCart size={22} />
      <span>Bevásárlás</span>
    </Link>
  );
}

export default ShoppingButton;
