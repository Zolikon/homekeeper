import HomeButton from "../__components/HomeButton";
import MenuHolder from "../__components/MenuHolder";
import AddPetOrderItem from "./AddPetOrderItem";
import FinalOrderButton from "./FinalOrderButton";
import { ZooplusProvider } from "./ZooplusContext";
import ZooplusList from "./ZooplusList";

export default function Page() {
  return (
    <ZooplusProvider>
      <ZooplusList />
      <MenuHolder>
        <FinalOrderButton />
        <AddPetOrderItem />
        <HomeButton />
      </MenuHolder>
    </ZooplusProvider>
  );
}
