"use client";
import { useState } from "react";
import { deleteFinishedItems } from "../__backend/AdminService";

function ClearFinished({ completedShoppingItems }: { completedShoppingItems: number }) {
  const [operationInProgress, setOperationInProgress] = useState(false);
  function handleDeleteFinishedItems() {
    if (operationInProgress) return;
    setOperationInProgress(true);

    deleteFinishedItems()
      .then(() => {
        setOperationInProgress(false);
      })
      .catch((error) => {
        console.error("Error deleting finished items:", error);
        setOperationInProgress(false);
      });
  }

  return (
    <button
      className="bg-theme_primary font-extrabold text-2xl p-2 rounded-lg w-4/5 text-center flex gap-2 items-center justify-center"
      onClick={handleDeleteFinishedItems}
    >
      {operationInProgress ? (
        <div className="material-symbols-outlined animate-spin">autorenew</div>
      ) : (
        <>
          Clear finished
          <p className="text-red-600 rounded-full bg-yellow-300 size-10 flex items-center justify-center">
            {completedShoppingItems}
          </p>
        </>
      )}
    </button>
  );
}

export default ClearFinished;
