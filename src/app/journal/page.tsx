import {
  JournalEntryForm,
  KnownLimitationsNotice,
  PageHeader,
  SafetyNotice,
  TeoyubeProductCard
} from "@/components/productization/Phase11ProductPanels";

export default function JournalPage() {
  return (
    <main>
      <PageHeader eyebrow="Reflection" title="Teoyube Journal">
        Write session-only reflections, attach the current Scripture/word/promise manually, export a safe local bundle, and clear entries.
      </PageHeader>

      <JournalEntryForm />

      <TeoyubeProductCard eyebrow="Prompts" title="Reflection Prompts">
        <p>Where do I need God's light today?</p>
        <p>Which promise should shape my next faithful step?</p>
        <p>What prayer should I return to this week?</p>
      </TeoyubeProductCard>

      <section className="grid two">
        <SafetyNotice />
        <KnownLimitationsNotice />
      </section>
    </main>
  );
}
