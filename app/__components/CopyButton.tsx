"use client";

import { MdContentCopy } from "react-icons/md";

export default function CopyButton({ text }: { text: string }) {
  function copyContent() {
    navigator.clipboard.writeText(text);
  }

  return (
    <button
      className="bg-green-500 disabled:bg-gray-400 text-white rounded-lg p-2 w-1/2 flex items-center justify-center"
      onClick={copyContent}
    >
      <MdContentCopy size={24} />
    </button>
  );
}
