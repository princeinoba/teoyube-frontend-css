import type { ReactNode } from "react";

function Notice({
  eyebrow,
  title,
  children,
  compact
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={compact ? "panel compact-panel" : "panel"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export function PublicConsentNotice({ compact = false }: { compact?: boolean }) {
  return (
    <Notice compact={compact} eyebrow="Consent" title="Session-Only Consent Boundary">
      <p>
        Teoyube uses local session state for this prototype. It does not enable hidden personalization,
        browser persistence, analytics, automatic contact, or live AI orchestration.
      </p>
      <ul className="check-list">
        <li>Raw private text storage is disabled.</li>
        <li>Personalization can be reset by the user.</li>
        <li>Major decisions should be tested through Scripture, prayer, counsel, fruit, and time.</li>
      </ul>
    </Notice>
  );
}

export function PublicLaunchLimitationsNotice({ compact = false }: { compact?: boolean }) {
  return (
    <Notice compact={compact} eyebrow="Limitations" title="Public Preview Limitations">
      <p>
        This local app preview is not a production service connection. External media sources, analytics,
        accounts, payments, database persistence, automatic feedback collection, and live AI remain disabled.
      </p>
    </Notice>
  );
}

export function PublicPrivacyNotice({ compact = false }: { compact?: boolean }) {
  return (
    <Notice compact={compact} eyebrow="Privacy" title="Privacy Boundary">
      <p>
        The repaired runtime keeps sensitive personalization in memory only. No localStorage, cookies,
        IndexedDB, external analytics, database writes, or automatic user contact are required.
      </p>
    </Notice>
  );
}

export function PublicTermsNotice({ compact = false }: { compact?: boolean }) {
  return (
    <Notice compact={compact} eyebrow="Terms" title="Faithful Use Boundary">
      <p>
        Teoyube words and recommendations are devotional aids, not Scripture and not claims of divine
        certainty. Teoyube does not replace pastoral, medical, legal, financial, emergency, or professional support.
      </p>
    </Notice>
  );
}
