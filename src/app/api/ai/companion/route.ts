import { NextResponse } from "next/server";
import { runAiCompanionTigProduction } from "../../../../../src/lib/tig";

export async function POST(req: Request) {
  const body = await req.json();
  const message = body.message || "";
  const production = runAiCompanionTigProduction({
    input: message,
    userState: message,
    context: {
      source: "legacy-ai-companion-api",
      note: "Local production intelligence only; no live AI model orchestration."
    }
  });
  const clusterName = production.selection.promiseCluster?.label || "Scripture-backed promise";
  const prayer =
    production.selection.prayerSequence?.description ||
    production.selection.prayerSequence?.label ||
    "Father, guide me through Your Word and help me respond with faith today.";
  const journalPrompt =
    production.selection.actionStep?.description ||
    "What Scripture promise do I need to remember and practice today?";

  return NextResponse.json({
    cluster: clusterName,
    words: production.selection.teoyubeWord ? [production.selection.teoyubeWord.label] : [],
    response: production.explanation.summary,
    prayer,
    journalPrompt,
    confidenceLabel: production.confidence.label,
    fallbackUsed: production.fallback.used,
    safetyStatus: production.safety.status,
    explanationPath: production.explanation.reasonPath,
    scriptureAnchor: production.selection.scriptureAnchor?.label
  });
}
