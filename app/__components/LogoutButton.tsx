"use client";

import { useState, useEffect } from "react";
import { signOut, getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useRouter } from "next/navigation";
import { MdLogout } from "react-icons/md";

export default function LogoutButton() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(() => setSignedIn(true))
      .catch(() => setSignedIn(false));

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") setSignedIn(true);
      if (payload.event === "signedOut") setSignedIn(false);
    });

    return unsubscribe;
  }, []);

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  if (!signedIn) return null;

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
