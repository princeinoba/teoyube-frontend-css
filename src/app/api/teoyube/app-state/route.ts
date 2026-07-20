import { NextResponse } from "next/server";
import {
  addPersonalizationSignal,
  addPromiseTableItem,
  createTeoGuideTurn,
  generateDailyJourney,
  resetPersonalization,
  saveBookEntry,
  saveJournalEntry,
  saveTestimony,
  setActiveTigSurface,
  setConsentState,
  updatePromiseTableStatus,
  type TeoyubeAppState,
  type TeoyubeConsentChoice,
  type TeoyubePersonalizationSignal
} from "../../../../lib/teoyube/app-state";
import type { Phase11ProductSurface } from "../../../../lib/phase11Productization";
import type {
  Phase112BookEntry,
  Phase112PromiseTableStatus,
  Phase112TestimonyRecord
} from "../../../../lib/phase112Productization";

type RequestBody = Readonly<{
  action?: string;
  state?: TeoyubeAppState;
  payload?: Readonly<Record<string, unknown>>;
}>;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as RequestBody;
  if (!body.state || !body.action) return NextResponse.json({ error: "A session state and action are required." }, { status: 400 });
  const payload = body.payload || {};
  let next: TeoyubeAppState;
  switch (body.action) {
    case "generateDailyJourney": next = generateDailyJourney(body.state, typeof payload.seedDate === "string" ? payload.seedDate : undefined); break;
    case "addPromiseTableItem": next = addPromiseTableItem(body.state, typeof payload.query === "string" ? payload.query : undefined); break;
    case "updatePromiseTableStatus": next = updatePromiseTableStatus(body.state, String(payload.id || ""), payload.status as Phase112PromiseTableStatus); break;
    case "saveBookEntry": next = saveBookEntry(body.state, (payload.entry || {}) as Partial<Phase112BookEntry>); break;
    case "saveJournalEntry": next = saveJournalEntry(body.state, typeof payload.text === "string" ? payload.text : "", Array.isArray(payload.scriptureReferences) ? payload.scriptureReferences.filter((item): item is string => typeof item === "string") : undefined); break;
    case "saveTestimony": next = saveTestimony(body.state, (payload.testimony || {}) as Partial<Phase112TestimonyRecord>); break;
    case "createTeoGuideTurn": next = createTeoGuideTurn(body.state, typeof payload.prompt === "string" ? payload.prompt : ""); break;
    case "setConsentState": next = setConsentState(body.state, payload.personalization as TeoyubeConsentChoice); break;
    case "addPersonalizationSignal": next = addPersonalizationSignal(body.state, String(payload.label || ""), payload.source as TeoyubePersonalizationSignal["source"] | undefined); break;
    case "resetPersonalization": next = resetPersonalization(body.state); break;
    case "setActiveTigSurface": next = setActiveTigSurface(body.state, payload.surface as Phase11ProductSurface, typeof payload.input === "string" ? payload.input : undefined); break;
    default: return NextResponse.json({ error: "Unsupported local session action." }, { status: 400 });
  }
  return NextResponse.json(next, { headers: { "cache-control": "no-store" } });
}
