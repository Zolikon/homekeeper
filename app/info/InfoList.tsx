"use client";

import InfoItemComponent from "./InfoItemComponent";
import { InfoItem } from "../types";
import { useState } from "react";
import Resetableinput from "../__components/Resetableinput";

function InfoList({ infoList }: { infoList: InfoItem[] }) {
  const [search, setSearch] = useState("");
  const filteredList = infoList.filter((item) => item.title.includes(search));

  return (
    <>
      <Resetableinput placeholder="search" value={search} onChange={setSearch} />
      <div className="flex flex-col items-center justify-start gap-3 w-full h-[50vh] overflow-y-auto">
        {filteredList.map((item) => (
          <InfoItemComponent key={item.id} infoItem={item} />
        ))}
      </div>
    </>
  );
}

export default InfoList;
