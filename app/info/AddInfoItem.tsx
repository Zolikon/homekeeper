"use client";

import { useRef } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { addInfoItem, isNameAvailable } from "../__backend/InfoService";

function translateValidationErrors(errorType: string) {
  switch (errorType) {
    case "required":
      return "Required";
    case "maxLength":
      return "Too long";
    case "validate":
      return "Name already exists";
    default:
      return "Not valid";
  }
}

function AddInfoItem() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ reValidateMode: "onBlur" });

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    reset();
    dialogRef.current?.close();
  }

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    addInfoItem(data.name, data.content);
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
      <dialog ref={dialogRef} className="rounded-xl mt-10 w-[90%] h-[40%]">
        <form
          className="flex flex-col gap-4 p-4 bg-gray-200 rounded-lg items-center size-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-xl font-bold">Add Info</h2>
          <label className="flex flex-col gap-1 items-center justify-between w-full">
            <span>Name</span>
            <input
              autoFocus
              type="text"
              {...register("name", { required: true, maxLength: 20, validate: (value) => isNameAvailable(value) })}
              className={`p-2 rounded-md ${errors.name ? "bg-red-200" : ""}`}
              autoComplete="off"
            />
            {errors.name && (
              <span className="text-red-500">{translateValidationErrors(errors.name.type as string)}</span>
            )}
          </label>
          <label className="flex flex-col gap-1 items-center justify-between w-full flex-grow">
            <span>Content</span>
            <textarea
              {...register("content", { required: true, maxLength: 50 })}
              className={`p-2 rounded-md h-full resize-none w-full ${errors.content ? "bg-red-200" : ""}`}
              autoComplete="off"
            />
            {errors.content && (
              <span className="text-red-500">{translateValidationErrors(errors.content.type as string)}</span>
            )}
          </label>
          <div className="w-full flex gap-4">
            <button className="bg-red-500 text-white rounded-lg p-2 w-1/2" type="button" onClick={closeDialog}>
              Cancel
            </button>
            <button
              className="bg-blue-500 disabled:bg-gray-400 text-white rounded-lg p-2 w-1/2"
              type="submit"
              disabled={!isDirty}
            >
              Add
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export default AddInfoItem;
