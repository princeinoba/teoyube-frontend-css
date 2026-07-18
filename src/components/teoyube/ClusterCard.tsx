import TeoyubeCard from "@/components/TeoyubeCard";

export default function ClusterCard({ cluster }: { cluster: any }) {
  return (
    <TeoyubeCard title={cluster.name}>
      {cluster.coreWords && (
        <p>
          <strong>Words:</strong> {cluster.coreWords.join(", ")}
        </p>
      )}
      {cluster.anchorScripture && (
        <p>
          <strong>Anchor Scripture:</strong> {cluster.anchorScripture}
        </p>
      )}
      {cluster.declaration && (
        <p>
          <strong>Declaration:</strong> {cluster.declaration}
        </p>
      )}
    </TeoyubeCard>
  );
}
