"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { createPrayerCompanionAdapterContext } from "@/lib/teoyube/adapters/prayer-companion-adapter";

export default function PrayerCompanion() {
  const [message, setMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const companionContext = useMemo(() => {
    const adapter = createPrayerCompanionAdapterContext({
      message: submittedMessage || message || "I need Scripture-grounded prayer and direction."
    });

    return {
      ...adapter,
      fallbackUsed: adapter.safeDisplayData.fallbackUsed,
      warnings: adapter.recommendation.warnings,
      blockers: adapter.recommendation.blockers,
      noExternalServicesRequired: true,
      noBrowserPersistenceRequired: true
    };
  }, [message, submittedMessage]);
  const reply = submittedMessage ? companionContext.safeDisplayData : null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmittedMessage(message.trim() || "I need Scripture-grounded prayer and direction.");
  }

  return (
    <section className="card">
      <h2 className="gold">Prayer Companion</h2>
      <p className="muted">Share a need and receive a cluster, prayer, and journal prompt.</p>
      <form onSubmit={handleSubmit}>
        <textarea
          aria-label="Prayer need"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Example: I need peace and direction today."
          rows={5}
        />
        <button className="button" type="submit">
          Ask Companion
        </button>
      </form>

      {reply && (
        <div className="companion-reply">
          <h3>{reply.cluster}</h3>
          <p>{reply.response}</p>
          {reply.scriptureAnchor && (
            <p>
              <strong>Scripture Anchor:</strong> {reply.scriptureAnchor}
            </p>
          )}
          <p>
            <strong>Prayer:</strong> {reply.prayer}
          </p>
          <p>
            <strong>Journal Prompt:</strong> {reply.journalPrompt}
          </p>
          <p>
            <strong>Confidence:</strong> {reply.confidenceLabel || "available after graph match"}
          </p>
          <p>
            <strong>Fallback:</strong> {reply.fallbackUsed ? "Used safe fallback support" : "Not used"}
          </p>
          <p>
            <strong>Safety:</strong> {reply.safetyStatus || "safe"}
          </p>
          <p className="muted">
            <strong>Devotional boundary:</strong> Prayer guidance is framed as Scripture-grounded encouragement, not divine certainty or professional advice.
          </p>
          {companionContext.warnings.length > 0 && (
            <p className="muted">
              <strong>Warnings:</strong> {companionContext.warnings.join("; ")}
            </p>
          )}
          {Array.isArray(reply.explanationPath) && reply.explanationPath.length > 0 && (
            <div>
              <strong>Why this was selected:</strong>
              <ol>
                {reply.explanationPath.map((reason: string, index: number) => (
                  <li key={`${reason}-${index}`}>{reason}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
