"use client";

import { useState } from "react";
import { refreshContent } from "../__backend/ShoppingService";
import { MdRefresh } from "react-icons/md";

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
        <MdRefresh size={24} key="norefresh" />
      ) : (
        <MdRefresh size={24} className="animate-spin" key="refresh" />
      )}
    </button>
  );
}

export default RefreshButton;
