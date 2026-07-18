import type {
  TeoyubeSignalRetentionPolicy,
  TeoyubeSignalStoreRecord
} from "./personalization-signal-store-contracts";

function now(): string {
  return new Date().toISOString();
}

function createdTime(record: TeoyubeSignalStoreRecord): number {
  const value = Date.parse(record.createdAt || record.signal.timestamp);
  return Number.isFinite(value) ? value : 0;
}

export function getDefaultTeoyubeSignalRetentionPolicy(): TeoyubeSignalRetentionPolicy {
  return {
    id: "default_signal_retention",
    privacyLevel: "session_only",
    maxSignalCount: 100,
    maxAgeDays: 30,
    allowSessionOnly: true,
    allowConsentedProfile: false,
    allowedScopes: ["session", "surface", "development"],
    deleteExpired: true,
    createdAt: now()
  };
}

export function createSessionOnlyRetentionPolicy(): TeoyubeSignalRetentionPolicy {
  return {
    ...getDefaultTeoyubeSignalRetentionPolicy(),
    id: "session_only_signal_retention",
    privacyLevel: "session_only",
    maxSignalCount: 50,
    maxAgeDays: 1,
    allowSessionOnly: true,
    allowConsentedProfile: false,
    allowedScopes: ["session", "surface", "development"],
    createdAt: now()
  };
}

export function createConsentBasedRetentionPolicy(): TeoyubeSignalRetentionPolicy {
  return {
    ...getDefaultTeoyubeSignalRetentionPolicy(),
    id: "consented_profile_signal_retention",
    privacyLevel: "consented_profile",
    maxSignalCount: 250,
    maxAgeDays: 90,
    allowSessionOnly: true,
    allowConsentedProfile: true,
    allowedScopes: ["session", "surface", "profile_preview", "development"],
    createdAt: now()
  };
}

export function shouldRetainTeoyubeSignal(
  signal: TeoyubeSignalStoreRecord,
  policy: TeoyubeSignalRetentionPolicy
): boolean {
  if (signal.privacyLevel === "disabled") return false;
  if (signal.privacyLevel === "session_only" && !policy.allowSessionOnly) return false;
  if (signal.privacyLevel === "consented_profile" && !policy.allowConsentedProfile) return false;
  if (!policy.allowedScopes.includes(signal.scope)) return false;

  if (policy.deleteExpired && policy.maxAgeDays !== undefined) {
    const maxAgeMs = policy.maxAgeDays * 24 * 60 * 60 * 1000;
    const ageMs = Date.now() - createdTime(signal);
    if (ageMs > maxAgeMs) return false;
  }

  if (signal.expiresAt && Date.parse(signal.expiresAt) < Date.now()) return false;

  return true;
}

export function getTeoyubeSignalRetentionReason(
  signal: TeoyubeSignalStoreRecord,
  policy: TeoyubeSignalRetentionPolicy
): string {
  if (shouldRetainTeoyubeSignal(signal, policy)) {
    return "Signal is within retention policy.";
  }
  if (signal.privacyLevel === "disabled") return "Disabled privacy level is not retained.";
  if (signal.privacyLevel === "session_only" && !policy.allowSessionOnly) {
    return "Session-only signals are disabled by the retention policy.";
  }
  if (signal.privacyLevel === "consented_profile" && !policy.allowConsentedProfile) {
    return "Consented profile signals are disabled by the retention policy.";
  }
  if (!policy.allowedScopes.includes(signal.scope)) {
    return `Scope ${signal.scope} is outside the retention policy.`;
  }
  if (signal.expiresAt && Date.parse(signal.expiresAt) < Date.now()) {
    return "Signal has passed its explicit expiration date.";
  }
  return "Signal is expired by max age policy.";
}

export function applyTeoyubeSignalRetentionPolicy(
  signals: TeoyubeSignalStoreRecord[],
  policy: TeoyubeSignalRetentionPolicy
): TeoyubeSignalStoreRecord[] {
  return signals
    .filter((signal) => shouldRetainTeoyubeSignal(signal, policy))
    .sort((a, b) => createdTime(b) - createdTime(a))
    .slice(0, Math.max(0, policy.maxSignalCount));
}
