"use client";

import { useState } from "react";
import { refreshContent } from "../__backend/ShoppingService";

function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  function handleClick() {
    setIsRefreshing(true);
    refreshContent()
      .then(() => {
        setIsRefreshing(false);
      })
      .catch((error) => {
        console.error("Error refreshing content:", error);
        setIsRefreshing(false);
      });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing}
      className="size-12 md:size-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"
    >
      {!isRefreshing ? (
        <span className="material-symbols-outlined text-4xl" key="norefresh">
          refresh
        </span>
      ) : (
        <span className="material-symbols-outlined text-4xl animate-spin" key="refresh">
          refresh
        </span>
      )}
    </button>
  );
}

export default RefreshButton;
