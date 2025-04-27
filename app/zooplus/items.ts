import ZooplusItem from "./ZooplusItem";

export const initialItems: ZooplusItem[] = [
  {
    name: "Szőroldó Krém",
    url: "https://www.zooplus.hu/shop/macska/jutalomfalat/gimpet/gimpet_paszta/241503",
    imgUrl: "/zooplus/szor_krem.jpg",
    bundleSize: "2 x 200g",
  },
  {
    name: "Vitamin Krém",
    url: "https://www.zooplus.hu/shop/macska/jutalomfalat/gimpet/gimpet_paszta/241502",
    imgUrl: "/zooplus/vitamin_krem.jpg",
    bundleSize: "2 x 200g",
  },
  {
    name: "Alom",
    url: "https://www.zooplus.hu/shop/macska/macskaalom/benek/corncat/462686",
    imgUrl: "/zooplus/alom.jpg",
    bundleSize: "7 kg",
  },
  {
    name: "Applaws hal",
    url: "https://www.zooplus.hu/shop/macska/nedves_macskatap/applaws/probacsomagok/241064",
    imgUrl: "/zooplus/applaws_hal.jpg",
    bundleSize: "12 x 70g",
  },
  {
    name: "Royal Canin",
    url: "https://www.zooplus.hu/shop/macska/nedves_macskatap/royal_canin/breed/553015",
    imgUrl: "/zooplus/royal_canin.jpg",
    bundleSize: "24 x 85g",
  },
];

export type ZooplusItem = {
  name?: string;
  url: string;
  imgUrl?: string;
  bundleSize: string;
};
