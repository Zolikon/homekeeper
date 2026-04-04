"use client";

import { useRef, useState } from "react";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { MdAdd, MdInfo, MdPhone, MdLocationOn, MdLink } from "react-icons/md";
import { addInfoItem, isNameAvailable, InfoCategory } from "../__backend/InfoService";

type InfoFormValues = { name: string; content: string; category: InfoCategory };

const CONTENT_MAX = 500;

function translateValidationErrors(errorType: string) {
  switch (errorType) {
    case "required":
      return "Kötelező";
    case "maxLength":
      return "Túl hosszú";
    case "validate":
      return "A név már létezik";
    case "pattern":
      return "Érvénytelen formátum";
    default:
      return "Érvénytelen";
  }
}

function AddInfoItem() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<InfoFormValues>({
    defaultValues: { category: "none" },
    reValidateMode: "onBlur",
  });
  const [selectedCategory, setSelectedCategory] = useState<InfoCategory>("none");
  const contentValue: string = useWatch({ control, name: "content", defaultValue: "" });
  const contentLength = contentValue?.length ?? 0;
  const showCounter = contentLength + 10 >= CONTENT_MAX;

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    reset();
    setSelectedCategory("none");
    dialogRef.current?.close();
  }

  function handleCategoryChange(cat: InfoCategory) {
    setSelectedCategory(cat);
    setValue("category", cat, { shouldDirty: true });
    clearErrors("content");
  }

  const onSubmit: SubmitHandler<InfoFormValues> = (data) => {
    addInfoItem(data.name, data.content, data.category);
    closeDialog();
  };

  const contentPlaceholders: Record<InfoCategory, string> = {
    none: "",
    phone: "+36 30 123 4567",
    address: "Utca, Város",
    link: "https://...",
  };

  return (
    <>
      <button
        className="flex flex-col items-center gap-0.5 text-white text-xs"
        onClick={openDialog}
      >
        <div className="bg-white rounded-full size-10 -mt-4 shadow-lg flex items-center justify-center text-theme_primary">
          <MdAdd size={22} />
        </div>
        <span>Hozzáad</span>
      </button>
      <dialog ref={dialogRef} className="rounded-xl mt-10 w-[90%]">
        <form
          className="flex flex-col gap-4 p-4 bg-gray-200 rounded-lg items-center w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-xl font-bold">Info hozzáadása</h2>
          <label className="flex flex-col gap-1 items-center justify-between w-full">
            <span>Név</span>
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
          <div className="flex flex-col gap-1 items-center w-full">
            <span>Kategória</span>
            <div className="flex gap-2 justify-center">
              {(
                [
                  { value: "none", label: "Egyéb", Icon: MdInfo },
                  { value: "phone", label: "Telefon", Icon: MdPhone },
                  { value: "address", label: "Cím", Icon: MdLocationOn },
                  { value: "link", label: "Link", Icon: MdLink },
                ] as { value: InfoCategory; label: string; Icon: React.ComponentType<{ size?: number }> }[]
              ).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCategoryChange(value)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === value
                      ? "bg-[rgb(29,181,147)] text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1 items-center justify-between w-full">
            <span>Tartalom</span>
            <textarea
              {...register("content", {
                required: true,
                maxLength: CONTENT_MAX,
                validate: {
                  pattern: (value) => {
                    if (selectedCategory === "phone") {
                      return /^[+\d][\d\s\-().]{5,20}$/.test(value);
                    }
                    if (selectedCategory === "link") {
                      return /^https?:\/\/.+/.test(value);
                    }
                    return true;
                  },
                },
              })}
              placeholder={contentPlaceholders[selectedCategory]}
              className={`p-2 rounded-md h-28 resize-none w-full ${errors.content ? "bg-red-200" : ""}`}
              autoComplete="off"
            />
            <div className="flex justify-between w-full">
              {errors.content ? (
                <span className="text-red-500">{translateValidationErrors(errors.content.type as string)}</span>
              ) : (
                <span />
              )}
              {showCounter && (
                <span className={`text-xs tabular-nums ${contentLength > CONTENT_MAX ? "text-red-500 font-semibold" : "text-gray-500"}`}>
                  {contentLength}/{CONTENT_MAX}
                </span>
              )}
            </div>
          </label>
          <div className="w-full flex gap-4">
            <button className="bg-red-500 text-white rounded-lg p-2 w-1/2" type="button" onClick={closeDialog}>
              Mégse
            </button>
            <button
              className="bg-blue-500 disabled:bg-gray-400 text-white rounded-lg p-2 w-1/2"
              type="submit"
              disabled={!isDirty}
            >
              Hozzáad
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export default AddInfoItem;
