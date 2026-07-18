import {
  GrowthJourneyPanel,
  KnownLimitationsNotice,
  PageHeader,
  SafetyNotice
} from "@/components/productization/Phase11ProductPanels";
import { getGrowthLevels, getPrayerJourneys } from "../../../src/lib/teoyube/data-access";

export default function JourneyPage() {
  return (
    <main>
      <PageHeader eyebrow="Growth Journey" title="Session Journey Progress">
        Start a local growth journey, complete stages, reflections, actions, and milestones without accounts or persistence.
      </PageHeader>
      <GrowthJourneyPanel journeys={getPrayerJourneys()} levels={getGrowthLevels()} />
      <section className="grid two">
        <SafetyNotice />
        <KnownLimitationsNotice />
      </section>
    </main>
  );
}
