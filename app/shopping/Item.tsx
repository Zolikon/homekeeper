"use client";

import { useEffect, useState } from "react";
import { toggleItemStatus } from "../__backend/ShoppingService";
import { ShoppingItem } from "../types";
import { AnimatePresence, motion } from "motion/react";

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

  return (
    <AnimatePresence mode="popLayout">
      {!toBeRemoved ? (
        <motion.div
          key={id + "_add"}
          className="flex items-center justify-between bg-gray-500 rounded-lg p-2 w-[90%] my-2 transition-all h-[75px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <div>
            <h2 className="font-bold text-">{name}</h2>
            <p>{note}</p>
            <p className="text-xs">{added.toLocaleDateString()}</p>
          </div>
          <input className="size-6" type="checkbox" checked={done} onChange={scheduleRemove} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="flex items-center justify-between bg-gray-500 rounded-lg p-2 w-[90%] my-2 transition-all h-[75px]"
          key={id + "_confirm"}
        >
          <p>Removing {name}</p>
          <button onClick={cancelRemove}>
            <span className="material-symbols-outlined text-4xl">undo</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Item;
