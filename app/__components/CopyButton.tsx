"use client";

export default function CopyButton({ text }: { text: string }) {
  function copyContent() {
    navigator.clipboard.writeText(text);
  }

  return (
    <button
      className="bg-green-500 disabled:bg-gray-400 text-white rounded-lg p-2 w-1/2 flex items-center justify-center"
      onClick={copyContent}
    >
      <span className="material-symbols-outlined text-3xl">content_copy</span>
    </button>
  );
}
