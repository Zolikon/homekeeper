"use client";

import { useRef } from "react";
import { MdClose } from "react-icons/md";

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
    <div className="relative w-1/2 items-center justify-center text-stone-800">
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
          onClick={() => { onChange(""); inputRef.current?.focus(); }}
        >
          <MdClose size={24} />
        </button>
      )}
    </div>
  );
}

export default Resetableinput;
