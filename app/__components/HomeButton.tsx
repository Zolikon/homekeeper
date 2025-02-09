import Link from "next/link";

function HomeButton() {
  return (
    <Link href="/" className="size-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg">
      <span className="material-symbols-outlined text-4xl">home</span>
    </Link>
  );
}

export default HomeButton;
