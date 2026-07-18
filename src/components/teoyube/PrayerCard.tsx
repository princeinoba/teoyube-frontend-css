import TeoyubeCard from "@/components/TeoyubeCard";

export default function PrayerCard({ prayer }: { prayer: any }) {
  return (
    <TeoyubeCard title={prayer.name}>
      <p>
        <strong>Category:</strong> {prayer.category}
      </p>
      <p>
        <strong>Sequence:</strong> {prayer.sequence.join(" -> ")}
      </p>
      <p>
        <strong>Scripture:</strong> {prayer.scriptureAnchor}
      </p>
      <p>{prayer.prayer}</p>
    </TeoyubeCard>
  );
}
