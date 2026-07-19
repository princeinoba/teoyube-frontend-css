"use client";

import { useState, type FormEvent } from "react";
import type { PrayerReplyDto } from "../../domain/prayer/prayer-contracts";

type PrayerApiResponse = Readonly<{
  reply: PrayerReplyDto;
}>;

export function PrayerCompanionController() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<PrayerReplyDto | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const input = message.trim() || "I need Scripture-grounded prayer and direction.";
    const response = await fetch("/api/teoyube/prayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input })
    });
    if (!response.ok) return;
    const payload = await response.json() as PrayerApiResponse;
    setReply(payload.reply);
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
        <button className="button" type="submit">Ask Companion</button>
      </form>

      {reply && (
        <div className="companion-reply">
          <h3>{reply.cluster}</h3>
          <p>{reply.response}</p>
          {reply.scriptureAnchor && <p><strong>Scripture Anchor:</strong> {reply.scriptureAnchor}</p>}
          <p><strong>Prayer:</strong> {reply.prayer}</p>
          <p><strong>Journal Prompt:</strong> {reply.journalPrompt}</p>
          <p><strong>Confidence:</strong> {reply.confidenceLabel}</p>
          <p><strong>Fallback:</strong> {reply.fallbackUsed ? "Used safe fallback support" : "Not used"}</p>
          <p><strong>Safety:</strong> {reply.safetyStatus}</p>
          <p className="muted"><strong>Devotional boundary:</strong> {reply.devotionalBoundary}</p>
          {reply.explanationPath.length > 0 && <div><strong>Why this was selected:</strong><ol>{reply.explanationPath.map((reason, index) => <li key={`${reason}-${index}`}>{reason}</li>)}</ol></div>}
        </div>
      )}
    </section>
  );
}
