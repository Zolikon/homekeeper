"use client";

import InfoItemComponent from "./InfoItemComponent";

import { useState } from "react";
import Resetableinput from "../__components/Resetableinput";
import { InfoItem } from "../__backend/InfoService";
import { normalized } from "../utils";

function InfoList({ infoList }: { infoList: InfoItem[] }) {
  const [search, setSearch] = useState("");
  const filteredList = infoList.filter((item) =>
    (item.normalizedTitle || normalized(item.title)).includes(normalized(search)),
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full items-center gap-2 px-2">
      <Resetableinput placeholder="keresés" value={search} onChange={setSearch} />
      <div className="flex flex-col items-center justify-start gap-3 w-full flex-1 min-h-0 overflow-y-auto">
        {filteredList.map((item) => (
          <InfoItemComponent key={item.id} infoItem={item} />
        ))}
      </div>
    </div>
  );
}

export default InfoList;
