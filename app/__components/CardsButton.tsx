import Link from "next/link";

function CardButton() {
  return (
    <Link
      href="/cards"
      className="size-12 md:size-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"
    >
      <span className="material-symbols-outlined text-4xl">credit_card</span>
    </Link>
  );
}

export default CardButton;
