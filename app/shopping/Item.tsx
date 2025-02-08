"use client";

import { useEffect, useState } from "react";
import { toggleItemStatus } from "../__backend/ShoppingService";
import { ShoppingItem } from "../types";
import { motion } from "motion/react";

function Item({ id, name, note, added, done }: ShoppingItem) {
  const [toBeRemoved, setToBeRemoved] = useState(false);
  const [scheduledTask, setScheduledTask] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (toBeRemoved) {
      setScheduledTask(
        setTimeout(() => {
          toggleItemStatus(id);
        }, 3000),
      );
    }
  }, [toBeRemoved, id]);

  function scheduleRemove() {
    setToBeRemoved(true);
  }

  function cancelRemove() {
    setToBeRemoved(false);
    if (scheduledTask) {
      clearTimeout(scheduledTask);
    }
  }

  return !toBeRemoved ? (
    <motion.div
      key={id}
      drag="x"
      whileDrag={{ scale: 1.05, backgroundColor: "#f00" }}
      dragConstraints={{ left: 0, right: 300 }}
      className="flex items-center justify-between bg-gray-500 rounded-lg p-2 w-[90%] my-2 transition-all"
      onDragEnd={(event, info) => {
        if (info.offset.x > 100) {
          scheduleRemove();
        }
      }}
    >
      <div>
        <h2 className="font-bold text-">{name}</h2>
        <p>{note}</p>
        <p className="text-xs">{added.toLocaleDateString()}</p>
      </div>
      <input className="size-6" type="checkbox" checked={done} onChange={scheduleRemove} />
    </motion.div>
  ) : (
    <div className="flex items-center justify-between bg-gray-500 rounded-lg p-2 w-[90%] my-2 transition-all">
      <p>Removing {name}</p>
      <button onClick={cancelRemove}>
        <span className="material-symbols-outlined text-4xl">undo</span>
      </button>
    </div>
  );
}

export default Item;
