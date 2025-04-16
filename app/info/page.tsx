import { getInfoList } from "../__backend/InfoService";
import InfoList from "./InfoList";

async function page() {
  const info = await getInfoList();
  return (
    <>
      <InfoList infoList={info} />
    </>
  );
}

export default page;
