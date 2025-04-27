"use client";

import { useRef } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useZooplusCart } from "./ZooplusContext";

function AddPetOrderItem() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm();
  const { addToItems } = useZooplusCart() ?? { addItem: () => {} };

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    reset();
    dialogRef.current?.close();
  }

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    saveItem(data.name, data.url, data.bundleSize);
  };

  function saveItem(name: string, url: string, bundleSize: string) {
    addToItems?.(name, url, bundleSize);
    reset();
    closeDialog();
  }

  return (
    <>
      <button
        className="size-12 md:size-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"
        onClick={openDialog}
      >
        <span className="material-symbols-outlined text-4xl">add</span>
      </button>
      <dialog ref={dialogRef} className="rounded-xl mt-10">
        <div className="flex flex-col gap-4 p-4 bg-gray-200 rounded-lg items-center">
          <form className="flex flex-col gap-4 p-4 items-center" onSubmit={handleSubmit(onSubmit)}>
            <h2 className="text-xl font-bold">Add Item</h2>
            <label className="flex flex-col gap-1 items-center justify-between">
              <span>Name</span>
              <input
                disabled={isSubmitting}
                autoFocus
                placeholder="Name of item (required)"
                type="text"
                {...register("name", { required: true, maxLength: 20 })}
                className={`p-2 rounded-md ${errors.name ? "bg-red-300" : ""} disabled:bg-gray-300 `}
                autoComplete="off"
              />
              {errors.name && (
                <span className="text-red-500">{errors.name.type === "required" ? "Required" : "Too long"}</span>
              )}
            </label>
            <label className="flex flex-col gap-1 items-center justify-between">
              <span>Url</span>
              <input
                disabled={isSubmitting}
                placeholder="Link to item (required)"
                type="text"
                {...register("url", { required: true, maxLength: 300 })}
                className="p-2 rounded-md disabled:bg-gray-300 "
                autoComplete="off"
              />
            </label>
            <label className="flex flex-col gap-1 items-center justify-between">
              <span>Bundle size</span>
              <input
                disabled={isSubmitting}
                placeholder="e.g. 24*70g (optional)"
                type="text"
                {...register("bundleSize", { maxLength: 20 })}
                className="p-2 rounded-md disabled:bg-gray-300 "
                autoComplete="off"
              />
            </label>
            <div className="w-full flex gap-4">
              {!isSubmitting ? (
                <>
                  <button className="bg-red-500 text-white rounded-lg p-2 w-1/2" type="button" onClick={closeDialog}>
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 disabled:bg-gray-400 text-white rounded-lg p-2 w-1/2"
                    type="submit"
                    disabled={!isDirty || Object.keys(errors).length > 0}
                  >
                    Add
                  </button>
                </>
              ) : (
                <div>Saving...</div>
              )}
            </div>
          </form>
          {!isSubmitting && (
            <button className="absolute top-2 right-2" onClick={closeDialog}>
              <span className="material-symbols-outlined text-4xl" onClick={closeDialog}>
                close
              </span>
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}

export default AddPetOrderItem;
