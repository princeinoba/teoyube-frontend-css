"use client";

import type { FormEvent } from "react";
import { useState } from "react";

const compassDefaults = [
  "Calling and purpose",
  "Scripture encouragement",
  "Prayer direction",
  "Promise language"
];

export default function CompassSearchBar({
  onSearch,
  loading
}: {
  onSearch: (term: string) => void;
  loading?: boolean;
}) {
  const [term, setTerm] = useState("Calling and purpose");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSearch(term);
  }

  return (
    <section className="card">
      <form onSubmit={handleSubmit}>
        <label>
          Compass Topic
          <input
            aria-label="Compass reflection topic"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Enter a calling, prayer, or promise topic..."
            type="search"
          />
        </label>
        <button className="button" disabled={loading} type="submit">
          {loading ? "Reviewing..." : "Review Compass Topic"}
        </button>
      </form>
      <div className="pill-row compass-defaults">
        {compassDefaults.map((defaultTerm) => (
          <button
            aria-label={`Review Compass topic ${defaultTerm}`}
            className="tab"
            key={defaultTerm}
            onClick={() => {
              setTerm(defaultTerm);
              onSearch(defaultTerm);
            }}
            type="button"
          >
            {defaultTerm}
          </button>
        ))}
      </div>
    </section>
  );
}
