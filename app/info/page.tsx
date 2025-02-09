import { getInfoList } from "../__backend/InfoService";
import HomeButton from "../__components/HomeButton";
import AddInfoItem from "./AddInfoItem";
import InfoList from "./InfoList";

async function page() {
  const info = await getInfoList();
  return (
    <>
      <InfoList infoList={info} />
      <div className="fixed bottom-14 right-4 flex gap-2">
        <AddInfoItem />
        <HomeButton />
      </div>
    </>
  );
}

export default page;
