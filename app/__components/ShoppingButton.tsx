import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";

function ShoppingButton() {
  return (
    <Link
      href="/shopping"
      className="size-12 md:size-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg"
    >
      <FaShoppingCart size={24} />
    </Link>
  );
}

export default ShoppingButton;
