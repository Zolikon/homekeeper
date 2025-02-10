"use client";
import { useRef } from "react";
import { deleteInfoItem, InfoItem } from "../__backend/InfoService";

function InfoItemComponent({ infoItem }: { infoItem: InfoItem }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function copyContent() {
    navigator.clipboard.writeText(infoItem.content);
  }

  async function deleteItem() {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteInfoItem(infoItem.id).then(closeDialog);
    }
  }

  return (
    <>
      <div
        className="flex items-center justify-center gap-2 w-[90%] bg-gray-500 p-2 rounded-lg cursor-pointer"
        onClick={openDialog}
      >
        <h2>{infoItem.title}</h2>
        <span className="material-symbols-outlined text-3xl">touch_app</span>
      </div>
      <dialog ref={dialogRef} className="w-[90vw] h-[40vh] rounded-xl">
        <div className="flex flex-col items-center justify-between p-2 h-full">
          <h2 className="font-bold text-2xl">{infoItem.title}</h2>
          <p className="flex-grow border-2 border-black m-2 w-[90%] p-2 rounded-lg">{infoItem.content}</p>
          <div className="flex gap-2">
            <button
              className="bg-red-500 disabled:bg-gray-400 text-white rounded-lg p-2 w-1/2 flex items-center justify-center"
              onClick={deleteItem}
            >
              <span className="material-symbols-outlined text-3xl">delete</span>
            </button>
            <button
              className="bg-green-500 disabled:bg-gray-400 text-white rounded-lg p-2 w-1/2 flex items-center justify-center"
              onClick={copyContent}
            >
              <span className="material-symbols-outlined text-3xl">content_copy</span>
            </button>
            <button
              className="bg-blue-500 disabled:bg-gray-400 text-white rounded-lg p-2 w-1/2 flex items-center justify-center"
              onClick={closeDialog}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
export default InfoItemComponent;
