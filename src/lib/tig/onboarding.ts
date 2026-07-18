export const TIG_ONBOARDING_STORAGE_KEY = "teoyube:tig:onboarding-completed";

let sessionOnboardingCompleted = false;

export function hasCompletedTIGOnboarding(): boolean {
  return sessionOnboardingCompleted;
}

export function markTIGOnboardingCompleted(): void {
  sessionOnboardingCompleted = true;
}

export function resetTIGOnboarding(): void {
  sessionOnboardingCompleted = false;
}
