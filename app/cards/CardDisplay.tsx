"use client";

import Image from "next/image";
import { CardType } from "./cards";
import { useRef } from "react";

function CardDisplay({ card }: { card: CardType }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function handleBackgroundClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      dialogRef.current?.close();
    }
  }

  return (
    <>
      <button
        key={card.title}
        style={{ height: 80 }}
        className="flex items-center justify-between gap-2 w-3/5 bg-slate-600 text-slate-700 p-4 rounded-lg"
        onClick={openDialog}
      >
        <div className="p-2">
          <Image src={card.icon} alt={card.title} width={64} height={64} className="w-16 h-16 object-contain" />
        </div>
        <h2 className="text-2xl font-extrabold flex-grow text-center bg-slate-200 h-full flex items-center justify-center rounded-md">
          {card.title}
        </h2>
      </button>
      <dialog className="w-[90%] aspect-square p-4 rounded-lg" ref={dialogRef} onClick={handleBackgroundClick}>
        <div className="flex flex-col items-center justify-center bg-gray-600 size-full">
          <Image src={card.code} alt={card.title} width={400} height={400} className="w-96 h-96 object-contain" />
        </div>
      </dialog>
    </>
  );
}

export default CardDisplay;
