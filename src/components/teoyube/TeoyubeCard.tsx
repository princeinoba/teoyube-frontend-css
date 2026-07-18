import type { ReactNode } from "react";

export default function TeoyubeCard({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="card">
      <h2 className="gold">{title}</h2>
      {children}
    </section>
  );
}
