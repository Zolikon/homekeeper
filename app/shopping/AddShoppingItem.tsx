"use client";

import { useRef } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { addItem } from "../__backend/ShoppingService";

function AddShoppingItem() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    reset();
    dialogRef.current?.close();
  }

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    addItem(data.name, data.note);
    reset();
    closeDialog();
  };

  return (
    <>
      <button
        className="size-12 md:size-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"
        onClick={openDialog}
      >
        <span className="material-symbols-outlined text-4xl">add</span>
      </button>
      <dialog ref={dialogRef} className="rounded-xl mt-10">
        <form className="flex flex-col gap-4 p-4 bg-gray-200 rounded-lg items-center" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-xl font-bold">Add Item</h2>
          <label className="flex flex-col gap-1 items-center justify-between">
            <span>Name</span>
            <input
              autoFocus
              type="text"
              {...register("name", { required: true, maxLength: 20 })}
              className={`p-2 rounded-md ${errors.name ? "bg-red-300" : ""}`}
              autoComplete="off"
            />
            {errors.name && (
              <span className="text-red-500">{errors.name.type === "required" ? "Required" : "Too long"}</span>
            )}
          </label>
          <label className="flex flex-col gap-1 items-center justify-between">
            <span>Note</span>
            <input type="text" {...register("note", { maxLength: 30 })} className="p-2 rounded-md" autoComplete="off" />
          </label>
          <div className="w-full flex gap-4">
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
          </div>
        </form>
      </dialog>
    </>
  );
}

export default AddShoppingItem;
