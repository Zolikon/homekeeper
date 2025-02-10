"use client";

function RefreshButton() {
  return (
    <button
      onClick={() => {
        location.reload();
      }}
      className="size-12 md:size-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"
    >
      <span className="material-symbols-outlined text-4xl">refresh</span>
    </button>
  );
}

export default RefreshButton;
