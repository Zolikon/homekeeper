import React from "react";
import { MdFastfood, MdHouse, MdDirectionsCar, MdOutlineQuestionMark, MdPets } from "react-icons/md";
import { ShoppingItemType } from "../__backend/shopping.types";

const ICON_SIZE = 30;

export type ItemTypeSelectorProps = {
  currentType: ShoppingItemType;
  setCurrentType: (type: ShoppingItemType) => void;
  count?: Record<ShoppingItemType, number>;
};

export const ICON_MAP: Record<ShoppingItemType, React.JSX.Element> = {
  [ShoppingItemType.FOOD]: <MdFastfood size={ICON_SIZE} color="black" />,
  [ShoppingItemType.HOUSE]: <MdHouse size={ICON_SIZE} color="black" />,
  [ShoppingItemType.CAR]: <MdDirectionsCar size={ICON_SIZE} color="black" />,
  [ShoppingItemType.CAT]: <MdPets size={ICON_SIZE} color="black" />,
  [ShoppingItemType.OTHER]: <MdOutlineQuestionMark size={ICON_SIZE} color="black" />,
};

export const TypeIcon: React.FC<{
  type: ShoppingItemType;
  isSelected?: boolean;
  onClick: (type: ShoppingItemType) => void;
  count?: number;
}> = ({ type, isSelected, onClick, count }) => {
  return (
    <button
      className={`p-2 rounded-lg relative transition-colors duration-200 ${isSelected ? "bg-blue-500" : "bg-gray-300"}`}
      onClick={(e) => {
        e.preventDefault();
        onClick(type);
      }}
    >
      {ICON_MAP[type]}
      {count && count !== 0 && (
        <span
          className={`absolute -top-2 -right-2 text-xs font-bold text-white rounded-full h-5 w-5 flex items-center justify-center ${
            isSelected ? "bg-blue-700" : "bg-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

const ItemTypeSelector: React.FC<ItemTypeSelectorProps> = ({ currentType, setCurrentType, count = {} }) => {
  return (
    <div className="flex gap-4">
      <TypeIcon
        type={ShoppingItemType.FOOD}
        isSelected={currentType === ShoppingItemType.FOOD}
        onClick={setCurrentType}
        count={count[ShoppingItemType.FOOD]}
      />
      <TypeIcon
        type={ShoppingItemType.HOUSE}
        isSelected={currentType === ShoppingItemType.HOUSE}
        onClick={setCurrentType}
        count={count[ShoppingItemType.HOUSE]}
      />
      <TypeIcon
        type={ShoppingItemType.CAT}
        isSelected={currentType === ShoppingItemType.CAT}
        onClick={setCurrentType}
        count={count[ShoppingItemType.CAT]}
      />
      <TypeIcon
        type={ShoppingItemType.CAR}
        isSelected={currentType === ShoppingItemType.CAR}
        onClick={setCurrentType}
        count={count[ShoppingItemType.CAR]}
      />
      <TypeIcon
        type={ShoppingItemType.OTHER}
        isSelected={currentType === ShoppingItemType.OTHER}
        onClick={setCurrentType}
        count={count[ShoppingItemType.OTHER]}
      />
    </div>
  );
};

export default ItemTypeSelector;
