import DashboardCard from "@/components/DashboardCard";
import DataGrid from "@/components/DataGrid";
import { getExploreData } from "@/lib/teoyubeData";

export default function ProfilePage() {
  const { kingdomArchetypes, covenantPaths, tkos } = getExploreData();
  const profile = tkos.sampleProfile;
  const archetype =
    kingdomArchetypes.find((item: any) => item.name === profile.archetype) ||
    kingdomArchetypes[1];
  const path =
    covenantPaths.find((item: any) => item.name === profile.primaryPath) ||
    covenantPaths[0];

  return (
    <main>
      <section className="page-hero profile-hero compact-hero">
        <p className="eyebrow">Saint Profile</p>
        <h1>{profile.displayName || "Profile"}</h1>
        <p>User archetype, journey, growth level, recommended words, and saved spiritual focus.</p>
      </section>

      <DataGrid>
        <DashboardCard title="Kingdom Profile">
          <h3>{profile.displayName || "Saint"}</h3>
          <p>
            <strong>Archetype:</strong> {profile.archetype}
          </p>
          <p>
            <strong>Growth Level:</strong> {profile.growthLevel}
          </p>
          <p>
            <strong>Current Journey:</strong> {profile.currentJourney}
          </p>
        </DashboardCard>

        <DashboardCard title="Primary Path">
          <h3>{path.name}</h3>
          <p>{path.sequence.join(" -> ")}</p>
          <p className="muted">{(path.scriptureFlow || []).join(", ")}</p>
        </DashboardCard>

        <DashboardCard title="Archetype Words">
          <h3>{archetype.name}</h3>
          <p>{archetype.coreWords.join(", ")}</p>
        </DashboardCard>

        <DashboardCard title="Saved Focus">
          <div className="pill-row">
            {(profile.recommendedWords || []).map((word: string) => (
              <span className="pill" key={word}>{word}</span>
            ))}
          </div>
        </DashboardCard>
      </DataGrid>
    </main>
  );
}
