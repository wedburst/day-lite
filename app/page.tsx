import Timeline from "../components/Timeline";
import matchesData from "./data/matches.json";

export default function Home() {
  return (
    <Timeline
      dayLabel={matchesData.date}
      timezone={matchesData.timezone}
      matches={matchesData.matches}
    />
  );
}
