import type { ReactNode } from "react";

export default function DataGrid({
  children,
  columns = "two"
}: {
  children: ReactNode;
  columns?: "one" | "two" | "three";
}) {
  return <div className={`grid ${columns}`}>{children}</div>;
}
