import { expect, test, type BrowserContext } from "@playwright/test";

const ORIGIN = process.env.TEOYUBE_MEMORY_E2E_BASE_URL || "http://127.0.0.1:3116";

async function signIn(context: BrowserContext, credential: string) {
  const response = await context.request.post("/api/teoyube/identity/sign-in", { headers: { origin: ORIGIN }, data: { credential } });
  expect(response.status()).toBe(200);
  const payload = await response.json();
  return payload.session as { csrfToken: string; user: { id: string; role: string } };
}

async function grant(context: BrowserContext, csrfToken: string, purposeId: string) {
  const response = await context.request.post("/api/teoyube/consent", {
    headers: { origin: ORIGIN, "x-teoyube-csrf": csrfToken },
    data: { purposeId, scope: ["memory:read", "memory:write", "memory:export", "memory:delete"], policyVersion: "2026-07-21" }
  });
  expect(response.status()).toBe(201);
}

test("two independent authenticated browser contexts resume one user's memory while another user remains isolated", async ({ browser }) => {
  const browserOne = await browser.newContext();
  const browserTwo = await browser.newContext();
  const otherUser = await browser.newContext();
  try {
    const first = await signIn(browserOne, "alpha-e2e");
    await grant(browserOne, first.csrfToken, "preference_continuity");
    const created = await browserOne.request.post("/api/teoyube/memory", {
      headers: { origin: ORIGIN, "x-teoyube-csrf": first.csrfToken },
      data: { idempotencyKey: "cross-device-pref", layer: "semantic_preference", sensitivity: "low", purposeId: "preference_continuity", provenance: { sourceType: "user_explicit", createdBy: "user" }, content: { preferredTranslation: "WEB" }, userApproved: true }
    });
    expect(created.status()).toBe(201);
    await grant(browserOne, first.csrfToken, "journey_continuity");
    const journey = await browserOne.request.post("/api/teoyube/memory", {
      headers: { origin: ORIGIN, "x-teoyube-csrf": first.csrfToken },
      data: { idempotencyKey: "cross-device-journey", layer: "journey_state", sensitivity: "structured_spiritual", purposeId: "journey_continuity", provenance: { sourceType: "journey_transition", sourceId: "journey-e2e", createdBy: "deterministic_system", scriptureCitations: [{ reference: { book: "EPH", chapterStart: 1, verseStart: 18 }, canonicalLabel: "Ephesians 1:18", translationId: "engwebp", corpusVersion: "engwebp-2026-07-21", sourceId: "engwebp", validationStatus: "validated" }], tigRecommendationId: "tig-e2e", reversibleTransitionRevision: 2 }, content: { journeyId: "journey-e2e", currentStage: "scripture", acceptedStages: ["check_in"], undoDepth: 1, privateTextPersisted: false }, userApproved: true }
    });
    expect(journey.status()).toBe(201);

    const second = await signIn(browserTwo, "alpha-e2e");
    expect(second.user.id).toBe(first.user.id);
    const resumed = await browserTwo.request.get("/api/teoyube/memory?purpose=preference_continuity");
    expect(resumed.status()).toBe(200);
    const resumedRecords = (await resumed.json()).memories;
    expect(resumedRecords).toHaveLength(1);
    const resumedJourney = await browserTwo.request.get("/api/teoyube/memory?purpose=journey_continuity");
    expect((await resumedJourney.json()).memories[0]).toMatchObject({ content: { currentStage: "scripture", undoDepth: 1 }, provenance: { tigRecommendationId: "tig-e2e", reversibleTransitionRevision: 2 } });

    const beta = await signIn(otherUser, "beta-e2e");
    await grant(otherUser, beta.csrfToken, "preference_continuity");
    const isolated = await otherUser.request.get("/api/teoyube/memory?purpose=preference_continuity");
    expect((await isolated.json()).memories).toEqual([]);
  } finally {
    await browserOne.close();
    await browserTwo.close();
    await otherUser.close();
  }
});

test("sensitive persistence is denied by default, requires explicit approval, and disappears immediately on revocation", async ({ browser }) => {
  const context = await browser.newContext();
  try {
    const session = await signIn(context, "alpha-e2e");
    const record = { idempotencyKey: "private-e2e", layer: "episodic", sensitivity: "sensitive_spiritual", purposeId: "sensitive_spiritual_storage", provenance: { sourceType: "user_explicit", createdBy: "user" }, content: { text: "Private browser prayer." }, userApproved: true, explicitSensitiveContentApproval: true };
    const denied = await context.request.post("/api/teoyube/memory", { headers: { origin: ORIGIN, "x-teoyube-csrf": session.csrfToken }, data: record });
    expect(denied.status()).toBe(403);
    await grant(context, session.csrfToken, "sensitive_spiritual_storage");
    expect((await context.request.post("/api/teoyube/memory", { headers: { origin: ORIGIN, "x-teoyube-csrf": session.csrfToken }, data: record })).status()).toBe(201);
    const revoked = await context.request.delete("/api/teoyube/consent", { headers: { origin: ORIGIN, "x-teoyube-csrf": session.csrfToken }, data: { purposeId: "sensitive_spiritual_storage", policyVersion: "2026-07-21" } });
    expect(revoked.status()).toBe(200);
    const after = await context.request.get("/api/teoyube/memory?purpose=sensitive_spiritual_storage");
    expect(after.status()).toBe(403);
  } finally { await context.close(); }
});

test("request forgery, missing CSRF, client user-id injection, and owner-role escalation are rejected", async ({ browser }) => {
  const context = await browser.newContext();
  try {
    const session = await signIn(context, "alpha-e2e");
    const forged = await context.request.post("/api/teoyube/consent", { headers: { origin: "https://attacker.invalid", "x-teoyube-csrf": session.csrfToken }, data: { purposeId: "preference_continuity", scope: ["memory:*"], policyVersion: "v1", userId: "someone-else" } });
    expect(forged.status()).toBe(403);
    const missingCsrf = await context.request.post("/api/teoyube/consent", { headers: { origin: ORIGIN }, data: { purposeId: "preference_continuity", scope: ["memory:*"], policyVersion: "v1" } });
    expect(missingCsrf.status()).toBe(403);
    const sessionResponse = await context.request.get("/api/teoyube/identity/session?userId=someone-else");
    expect((await sessionResponse.json()).user.id).toBe(session.user.id);
    expect((await context.request.get("/tig")).status()).toBe(404);
    const owner = await browser.newContext();
    try {
      await signIn(owner, "owner-e2e");
      expect((await owner.request.get("/tig")).status()).toBe(200);
    } finally { await owner.close(); }
  } finally { await context.close(); }
});
