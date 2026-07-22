import {
  SAFETY_POLICY_VERSION,
  type CrisisResourceRequest,
  type CrisisResourceResult
} from "../../domain/safety/safety-contracts";
import { SAFETY_LIMITS } from "../../domain/safety/safety-policy";

export interface CrisisResourceProvider {
  resolve(request: CrisisResourceRequest): Promise<CrisisResourceResult>;
}

export type CrisisResourceFixture = CrisisResourceResult;

export const GENERIC_EMERGENCY_FALLBACK: CrisisResourceResult = Object.freeze({
  countryOrRegionScope: "GLOBAL_GENERIC_NO_LOCAL_RESOURCE",
  emergencyGuidance: "If you may act now or cannot stay safe, contact your local emergency services now, move toward a trusted person who can be physically present, and create distance from anything you could use to harm yourself or someone else.",
  contactMode: "local_emergency_services",
  source: `Teoyube ${SAFETY_POLICY_VERSION} generic emergency fallback`,
  language: "en",
  limitations: Object.freeze([
    "No locale-specific phone number, URL, operating hour, or service availability is asserted.",
    "Teoyube does not infer precise location from an IP address.",
    "Production locale-specific resource coverage is currently zero and requires separate owner-reviewed verification."
  ]),
  verificationStatus: "NO_LOCAL_RESOURCE_GENERIC_EMERGENCY_FALLBACK",
  safeToDisplay: true,
  preciseLocationInferred: false,
  timedOut: false
});

function validFixture(fixture: CrisisResourceFixture, nowDate: string): boolean {
  if (fixture.verificationStatus !== "VERIFIED_CURRENT" && fixture.verificationStatus !== "OWNER_APPROVED_LOCAL_FIXTURE") return false;
  if (!fixture.safeToDisplay || !fixture.source || !fixture.countryOrRegionScope) return false;
  if (!fixture.expiryOrReviewDate) return fixture.verificationStatus === "OWNER_APPROVED_LOCAL_FIXTURE";
  return fixture.expiryOrReviewDate >= nowDate;
}

export class DeterministicCrisisResourceProvider implements CrisisResourceProvider {
  constructor(
    private readonly fixtures: readonly CrisisResourceFixture[] = Object.freeze([]),
    private readonly today: () => string = () => new Date().toISOString().slice(0, 10),
    private readonly latencyMs: number = 0
  ) {}

  async resolve(request: CrisisResourceRequest): Promise<CrisisResourceResult> {
    const fallback = Object.freeze({ ...GENERIC_EMERGENCY_FALLBACK, language: request.language || "en" });
    const lookup = async (): Promise<CrisisResourceResult> => {
      if (this.latencyMs > 0) await new Promise<void>((resolve) => setTimeout(resolve, this.latencyMs));
      const region = (request.countryOrRegion || "").trim().toUpperCase();
      const fixture = this.fixtures.find((entry) => entry.countryOrRegionScope.toUpperCase() === region);
      if (!fixture || !validFixture(fixture, this.today())) return fallback;
      return Object.freeze({ ...fixture, preciseLocationInferred: false, timedOut: false });
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<CrisisResourceResult>((resolve) => {
      timer = setTimeout(() => resolve(Object.freeze({ ...fallback, timedOut: true })), SAFETY_LIMITS.resourceTimeoutMs);
    });
    const result = await Promise.race([lookup(), timeout]);
    if (timer) clearTimeout(timer);
    return result;
  }
}

export const crisisResourceProvider = new DeterministicCrisisResourceProvider();
