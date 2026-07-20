import { permanentRedirect } from "next/navigation";

type CompassAliasPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function safeText(value: string | undefined): string | undefined {
  const normalized = value?.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return normalized && normalized.length <= 160 ? normalized : undefined;
}

export default async function CompassAliasPage({ searchParams }: CompassAliasPageProps) {
  const input = await searchParams;
  const output = new URLSearchParams();
  const assessment = firstValue(input.assessment);
  if (assessment === "1" || assessment === "true") output.set("assessment", assessment);
  for (const key of ["topic", "q"] as const) {
    const value = safeText(firstValue(input[key]));
    if (value) output.set(key, value);
  }
  const query = output.toString();
  permanentRedirect(`/calling-compass${query ? `?${query}` : ""}`);
}
