"use client";

import { useRef } from "react";

function Resetableinput({
  value,
  onChange,
  placeholder = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative h-full w-1/2 items-center justify-center text-stone-800">
      <input
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onChange("");
          }
        }}
        ref={inputRef}
        className="p-2 rounded-md w-full pr-8"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          className="absolute right-0 top-0 h-full w-8 flex items-center justify-center"
          onClick={() => onChange("")}
        >
          <span
            className="material-symbols-outlined"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
          >
            close
          </span>
        </button>
      )}
    </div>
  );
}

export default Resetableinput;
