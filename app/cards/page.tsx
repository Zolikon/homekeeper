import { availableCards } from "./cards";
import CardDisplay from "./CardDisplay";

export const dynamic = 'force-dynamic';

function page() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 h-[60%]">
      {availableCards.map((card) => (
        <CardDisplay key={card.title} card={card} />
      ))}
    </div>
  );
}

export default page;
