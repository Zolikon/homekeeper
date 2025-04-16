export const availableCards: CardType[] = [
  {
    title: "Tesco",
    icon: "/tesco_icon.png",
    code: "/tesco_code.jpg",
  },
  {
    title: "Lidl",
    icon: "/lidl_icon.png",
    code: "/lidl_code.jpg",
  },
  {
    title: "Unipatika",
    icon: "/unipatika_icon.png",
    code: "/unipatika_code.jpg",
  },
];

export type CardType = {
  title: string;
  icon: string;
  code: string;
};
