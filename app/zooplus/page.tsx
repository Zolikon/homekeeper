import HomeButton from "../__components/HomeButton";
import BottomNav from "../__components/BottomNav";
import AddPetOrderItem from "./AddPetOrderItem";
import FinalOrderButton from "./FinalOrderButton";
import { ZooplusProvider } from "./ZooplusContext";
import ZooplusList from "./ZooplusList";

export default function Page() {
  return (
    <ZooplusProvider>
      <div className="flex flex-col h-full w-full">
        <ZooplusList />
        <BottomNav>
          <HomeButton />
          <AddPetOrderItem />
          <FinalOrderButton />
        </BottomNav>
      </div>
    </ZooplusProvider>
  );
}
