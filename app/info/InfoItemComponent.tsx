"use client";
import { useRef } from "react";
import { deleteInfoItem, InfoItem, InfoCategory } from "../__backend/InfoService";
import CopyButton from "../__components/CopyButton";
import { MdTouchApp, MdDelete, MdPhone, MdMap, MdOpenInNew } from "react-icons/md";

function InfoItemComponent({ infoItem }: { infoItem: InfoItem }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function deleteItem() {
    if (confirm("Biztosan törölni szeretnéd ezt az elemet?")) {
      await deleteInfoItem(infoItem.id).then(closeDialog);
    }
  }

  const categoryBorder: Record<InfoCategory, string> = {
    none: "",
    phone: "border-l-4 border-green-400",
    address: "border-l-4 border-amber-400",
    link: "border-l-4 border-blue-400",
  };

  const categoryAction: Partial<Record<InfoCategory, {
    href: string;
    label: string;
    color: string;
    Icon: React.ComponentType<{ size?: number }>;
  }>> = {
    phone: {
      href: `tel:${infoItem.content}`,
      label: "Hívás",
      color: "bg-green-500",
      Icon: MdPhone,
    },
    address: {
      href: `https://maps.google.com/?q=${encodeURIComponent(infoItem.content)}`,
      label: "Térkép",
      color: "bg-amber-500",
      Icon: MdMap,
    },
    link: {
      href: infoItem.content,
      label: "Megnyitás",
      color: "bg-blue-500",
      Icon: MdOpenInNew,
    },
  };
  const action = categoryAction[infoItem.category];

  return (
    <>
      <div
        className={`flex items-center justify-center gap-2 w-[90%] bg-gray-500 p-2 rounded-lg cursor-pointer ${categoryBorder[infoItem.category]}`}
        onClick={openDialog}
      >
        <h2>{infoItem.title}</h2>
        <MdTouchApp size={24} />
      </div>
      <dialog ref={dialogRef} className="w-[90vw] min-h-[40vh] rounded-xl">
        <div className="flex flex-col items-center justify-between p-2 min-h-[40vh]">
          <h2 className="font-bold text-2xl">{infoItem.title}</h2>
          <p className="flex-grow border-2 border-black m-2 w-[90%] p-2 rounded-lg">{infoItem.content}</p>
          {action && (
            <a
              href={action.href}
              target={infoItem.category === "link" ? "_blank" : undefined}
              rel={infoItem.category === "link" ? "noopener noreferrer" : undefined}
              className={`${action.color} text-white rounded-lg p-3 w-full flex items-center justify-center gap-2 font-semibold`}
            >
              <action.Icon size={20} />
              {action.label}
            </a>
          )}
          <div className="flex gap-2">
            <button
              className="bg-red-500 disabled:bg-gray-400 text-white rounded-lg p-2 w-1/2 flex items-center justify-center"
              onClick={deleteItem}
            >
              <MdDelete size={24} />
            </button>
            <CopyButton text={infoItem.content} />
            <button
              className="bg-blue-500 disabled:bg-gray-400 text-white rounded-lg p-2 w-1/2 flex items-center justify-center"
              onClick={closeDialog}
            >
              Bezár
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
export default InfoItemComponent;
