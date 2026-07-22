"use client";

import { useCallback, useEffect, useState } from "react";

type Session = Readonly<{ user: Readonly<{ id: string; role: string }> }>;
type MemoryRecord = Readonly<{ id: string; layer: string; sensitivity: string; purposeId: string; content: Readonly<Record<string, unknown>>; provenance: Readonly<Record<string, unknown>>; createdAt: string; updatedAt: string; expiresAt?: string; version: number }>;
type ConsentEvent = Readonly<{ id: string; purposeId: string; action: string; resultingEffectiveState: string; occurredAt: string }>;

const PURPOSES = Object.freeze([
  Object.freeze({ id: "preference_continuity", label: "Preference continuity", scope: Object.freeze(["memory:read", "memory:write", "memory:export", "memory:delete"]) }),
  Object.freeze({ id: "journey_continuity", label: "Journey continuity", scope: Object.freeze(["memory:read", "memory:write", "memory:export", "memory:delete"]) }),
  Object.freeze({ id: "sensitive_spiritual_storage", label: "Sensitive spiritual storage", scope: Object.freeze(["memory:read", "memory:write", "memory:export", "memory:delete"]) }),
  Object.freeze({ id: "testimony_book_continuity", label: "Testimony and Book continuity", scope: Object.freeze(["memory:read", "memory:write", "memory:export", "memory:delete"]) }),
  Object.freeze({ id: "external_ai_processing", label: "External AI processing", scope: Object.freeze(["external_ai:process"]) }),
  Object.freeze({ id: "external_ai_sensitive_content", label: "External AI sensitive content", scope: Object.freeze(["external_ai:sensitive_content"]) }),
  Object.freeze({ id: "external_ai_memory_context", label: "External AI memory context", scope: Object.freeze(["external_ai:memory_context"]) }),
  Object.freeze({ id: "live_ai_conversation_retention", label: "Live AI conversation retention", scope: Object.freeze(["external_ai:conversation_retention"]) })
]);

function cookie(name: string): string {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  return document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix))?.slice(prefix.length) || "";
}

export function ConsentAwareMemoryControls() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [credential, setCredential] = useState("");
  const [memories, setMemories] = useState<readonly MemoryRecord[]>([]);
  const [history, setHistory] = useState<readonly ConsentEvent[]>([]);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    const sessionResponse = await fetch("/api/teoyube/identity/session", { cache: "no-store" });
    if (sessionResponse.status === 503) { setAvailable(false); return; }
    setAvailable(true);
    if (!sessionResponse.ok) { setSession(null); return; }
    const sessionPayload = await sessionResponse.json() as Session;
    setSession(sessionPayload);
    const [memoryResponse, consentResponse] = await Promise.all([
      fetch("/api/teoyube/memory", { cache: "no-store" }),
      fetch("/api/teoyube/consent", { cache: "no-store" })
    ]);
    if (memoryResponse.ok) setMemories((await memoryResponse.json() as { memories: readonly MemoryRecord[] }).memories);
    if (consentResponse.ok) setHistory((await consentResponse.json() as { history: readonly ConsentEvent[] }).history);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const mutate = useCallback(async (url: string, method: "POST" | "PATCH" | "DELETE", body: Readonly<Record<string, unknown>>) => {
    const response = await fetch(url, { method, headers: { "content-type": "application/json", "x-teoyube-csrf": decodeURIComponent(cookie("teoyube_csrf")) }, body: JSON.stringify(body) });
    const payload = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) throw new Error(payload.error || "The memory request could not be completed.");
    return response;
  }, []);

  if (available !== true) return null;

  if (!session) {
    return (
      <section className="panel">
        <p className="eyebrow">Local Identity</p>
        <h2>Sign in to manage durable continuity</h2>
        <p className="muted">This development/test adapter is not a production identity provider. Session-only use remains available without signing in.</p>
        <label>Local development credential<input value={credential} onChange={(event) => setCredential(event.target.value)} autoComplete="off" /></label>
        <div className="button-row"><button className="button secondary" type="button" onClick={async () => {
          const response = await fetch("/api/teoyube/identity/sign-in", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credential }) });
          if (!response.ok) { setStatus("Sign-in was not completed."); return; }
          setCredential(""); setStatus("Signed in."); await load();
        }}>Sign In</button></div>
        {status && <p className="muted" role="status">{status}</p>}
      </section>
    );
  }

  return (
    <section className="panel">
      <p className="eyebrow">User-Owned Memory</p>
      <h2>Consent, memory, export, and deletion</h2>
      <p className="muted">Signed in as a {session.user.role}. Every durable write remains purpose-specific, inspectable, and revocable.</p>
      <div className="activity-list">
        {PURPOSES.map((purpose) => {
          const latest = history.find((event) => event.purposeId === purpose.id);
          return <article className="mini-card" key={purpose.id}><strong>{purpose.label}</strong><p>Status: {latest?.resultingEffectiveState || "not granted"}</p><div className="button-row">
            <button className="button secondary" type="button" onClick={async () => { try { await mutate("/api/teoyube/consent", "POST", { purposeId: purpose.id, scope: purpose.scope, policyVersion: "2026-07-22" }); setStatus(`${purpose.label} granted.`); await load(); } catch (error) { setStatus(error instanceof Error ? error.message : "Consent was not granted."); } }}>Grant</button>
            <button className="button secondary" type="button" onClick={async () => { try { await mutate("/api/teoyube/consent", "DELETE", { purposeId: purpose.id, policyVersion: "2026-07-21" }); setStatus(`${purpose.label} revoked and active memory removed from future retrieval.`); await load(); } catch (error) { setStatus(error instanceof Error ? error.message : "Consent was not revoked."); } }}>Revoke</button>
          </div></article>;
        })}
      </div>
      <div className="button-row">
        <button className="button secondary" type="button" onClick={async () => { try { await mutate("/api/teoyube/memory", "POST", { idempotencyKey: `translation-${Date.now()}`, layer: "semantic_preference", sensitivity: "low", purposeId: "preference_continuity", provenance: { sourceType: "user_explicit", createdBy: "user" }, content: { preferredTranslation: "WEB" }, userApproved: true }); setStatus("WEB preference saved."); await load(); } catch (error) { setStatus(error instanceof Error ? error.message : "Preference was not saved."); } }}>Save WEB Preference</button>
        <button className="button secondary" type="button" onClick={async () => { const response = await fetch("/api/teoyube/memory/export", { cache: "no-store" }); if (!response.ok) { setStatus("Export was not completed."); return; } const blob = await response.blob(); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "teoyube-user-data.json"; link.click(); URL.revokeObjectURL(link.href); setStatus("Export completed."); }}>Export JSON</button>
        <button className="button secondary" type="button" onClick={async () => { try { await mutate("/api/teoyube/memory", "DELETE", { allSensitive: true, idempotencyKey: `delete-sensitive-${Date.now()}` }); setStatus("All active sensitive memory was deleted."); await load(); } catch (error) { setStatus(error instanceof Error ? error.message : "Sensitive memory was not deleted."); } }}>Delete Sensitive Memory</button>
      </div>
      <div className="activity-list">
        {memories.map((record) => <article className="mini-card" key={record.id}><strong>{record.layer} · {record.purposeId}</strong><p>Created: {record.createdAt}</p><p>Updated: {record.updatedAt} · Version {record.version}</p><p>Retention: {record.expiresAt || "policy default"}</p><pre className="export-box">{JSON.stringify({ content: record.content, provenance: record.provenance }, null, 2)}</pre><div className="button-row">
          <button className="button secondary" type="button" onClick={async () => { try { await mutate("/api/teoyube/memory", "PATCH", { id: record.id, expectedVersion: record.version, content: { ...record.content, userReviewedAt: new Date().toISOString() }, userApproved: true }); setStatus("Memory reviewed and updated."); await load(); } catch (error) { setStatus(error instanceof Error ? error.message : "Memory was not updated."); } }}>Mark Reviewed</button>
          <button className="button secondary" type="button" onClick={async () => { try { await mutate("/api/teoyube/memory", "DELETE", { id: record.id, idempotencyKey: `delete-${record.id}` }); setStatus("Memory deleted."); await load(); } catch (error) { setStatus(error instanceof Error ? error.message : "Memory was not deleted."); } }}>Delete</button>
        </div></article>)}
      </div>
      <div className="button-row">
        <button className="button secondary" type="button" onClick={async () => { try { await mutate("/api/teoyube/identity/sign-out", "POST", {}); setSession(null); setMemories([]); setStatus("Signed out."); } catch (error) { setStatus(error instanceof Error ? error.message : "Sign-out failed."); } }}>Sign Out</button>
        <button className="button secondary" type="button" onClick={async () => { if (!window.confirm("Delete this local Teoyube account and all active user-owned memory?")) return; try { await mutate("/api/teoyube/memory/account-deletion", "POST", { confirm: "DELETE MY TEOYUBE DATA", idempotencyKey: `delete-account-${session.user.id}` }); setSession(null); setMemories([]); setStatus("Account deletion completed."); } catch (error) { setStatus(error instanceof Error ? error.message : "Account deletion failed."); } }}>Delete Account</button>
      </div>
      {status && <p className="muted" role="status">{status}</p>}
    </section>
  );
}
