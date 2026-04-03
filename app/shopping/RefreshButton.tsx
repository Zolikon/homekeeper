"use client";

import { useState } from "react";
import { refreshContent } from "../__backend/ShoppingService";
import { MdRefresh } from "react-icons/md";

function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  function handleClick() {
    setIsRefreshing(true);
    refreshContent()
      .then(() => setIsRefreshing(false))
      .catch((error) => {
        console.error("Error refreshing content:", error);
        setIsRefreshing(false);
      });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing}
      className="flex flex-col items-center gap-0.5 text-white text-xs py-2 px-3 active:opacity-70 disabled:opacity-40"
    >
      <MdRefresh size={22} className={isRefreshing ? "animate-spin" : ""} />
      <span>Frissít</span>
    </button>
  );
}

export default RefreshButton;
