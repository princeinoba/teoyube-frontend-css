"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

type JournalEntry = {
  id: string;
  word: string;
  scripture: string;
  reflection: string;
  createdAt: string;
};

export default function JournalForm() {
  const [word, setWord] = useState("");
  const [scripture, setScripture] = useState("");
  const [reflection, setReflection] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const canSave = useMemo(
    () => Boolean(word.trim() && scripture.trim() && reflection.trim()),
    [reflection, scripture, word]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    setEntries((current) => [
      {
        id: `${Date.now()}`,
        word: word.trim(),
        scripture: scripture.trim(),
        reflection: reflection.trim(),
        createdAt: new Intl.DateTimeFormat("en", {
          dateStyle: "medium",
          timeStyle: "short"
        }).format(new Date())
      },
      ...current
    ]);
    setWord("");
    setScripture("");
    setReflection("");
  }

  return (
    <section className="journal-workspace">
      <form className="card journal-form" onSubmit={handleSubmit}>
        <h2 className="gold">New Reflection</h2>
        <label>
          Teoyube Word
          <input
            onChange={(event) => setWord(event.target.value)}
            placeholder="Example: Luma"
            type="text"
            value={word}
          />
        </label>

        <label>
          Scripture
          <input
            onChange={(event) => setScripture(event.target.value)}
            placeholder="Example: John 8:12"
            type="text"
            value={scripture}
          />
        </label>

        <label>
          Reflection
          <textarea
            onChange={(event) => setReflection(event.target.value)}
            placeholder="What is God showing you today?"
            rows={8}
            value={reflection}
          />
        </label>

        <button className="button" disabled={!canSave} type="submit">
          Save Journal Entry
        </button>
      </form>

      <section className="card saved-entries">
        <h2 className="gold">Saved This Session</h2>
        {entries.length === 0 ? (
          <p className="muted">Your reflections will appear here after you save them.</p>
        ) : (
          entries.map((entry) => (
            <article className="journal-entry" key={entry.id}>
              <p className="entry-meta">{entry.createdAt}</p>
              <h3>{entry.word}</h3>
              <p className="muted">{entry.scripture}</p>
              <p>{entry.reflection}</p>
            </article>
          ))
        )}
      </section>
    </section>
  );
}
