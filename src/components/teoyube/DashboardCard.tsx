import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardCard({
  title,
  href,
  action,
  children
}: {
  title: string;
  href?: string;
  action?: string;
  children: ReactNode;
}) {
  return (
    <section className="card">
      <h2 className="gold">{title}</h2>
      <div>{children}</div>
      {href && action && (
        <Link className="card-link" href={href}>
          {action}
        </Link>
      )}
    </section>
  );
}
