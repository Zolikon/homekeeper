"use client";

import React, { useRef, useEffect, useState } from "react";
import { useShopping } from "./ShoppingContext";

interface Props {
  children: React.ReactNode;
}

export default function ScrollOverflowIndicator({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const { hiddenIds } = useShopping() || { hiddenIds: [] };

  const checkOverflow = () => {
    const el = containerRef.current;
    if (!el) return;
    const epsilon = 2;
    setCanScrollUp(el.scrollTop > epsilon);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - epsilon);
  };

  useEffect(() => {
    checkOverflow();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkOverflow);
    window.addEventListener("resize", checkOverflow);
    return () => {
      el.removeEventListener("scroll", checkOverflow);
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  useEffect(() => {
    checkOverflow();
  }, [children, hiddenIds]);

  return (
    <div className="relative w-[70%] h-full">
      {canScrollUp && (
        <div className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-10">
          <div className="bg-gradient-to-b from-gray-300/80 to-transparent w-full h-6 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-600">expand_less</span>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full flex flex-col items-center h-[60vh] md:h-[80vh] overflow-y-auto gap-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {children}
      </div>
      {canScrollDown && (
        <div className="absolute bottom-0 left-0 w-full flex justify-center pointer-events-none z-10">
          <div className="bg-gradient-to-t from-gray-300/80 to-transparent w-full h-6 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-600">expand_more</span>
          </div>
        </div>
      )}
    </div>
  );
}
