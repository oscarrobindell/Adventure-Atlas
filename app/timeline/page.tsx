import Timeline from "@/components/Timeline";
import { getAdventures } from "@/lib/content";

export const metadata = { title: "Timeline" };
export default function Page() { return <Timeline adventures={getAdventures()} />; }
