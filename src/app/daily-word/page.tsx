import {
  DailyWordPanel,
  KnownLimitationsNotice,
  PageHeader,
  SafetyNotice
} from "@/components/productization/Phase11ProductPanels";
import { createPhase11DailyWordContext } from "@/lib/phase11Productization";

export default function DailyWordPage() {
  return (
    <main>
      <PageHeader eyebrow="Daily Word" title="Today's Formation Path">
        Generate a local daily Teoyube word, keep Scripture visible, pray from it, add a reflection, and save session activity.
      </PageHeader>
      <DailyWordPanel initialContext={createPhase11DailyWordContext()} />
      <section className="grid two">
        <SafetyNotice />
        <KnownLimitationsNotice />
      </section>
    </main>
  );
}
