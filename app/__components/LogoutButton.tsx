"use client";

import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { MdLogout } from "react-icons/md";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      title="Kijelentkezés"
      className="text-white hover:opacity-80 transition-opacity"
    >
      <MdLogout size={24} />
    </button>
  );
}
