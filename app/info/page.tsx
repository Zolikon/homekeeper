import { getInfoList } from "../__backend/InfoService";
import InfoList from "./InfoList";

export const dynamic = 'force-dynamic';

async function page() {
  const info = await getInfoList();
  return (
    <>
      <InfoList infoList={info} />
    </>
  );
}

export default page;
