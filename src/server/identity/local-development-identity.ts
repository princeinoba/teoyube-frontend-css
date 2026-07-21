import type { IdentityProvider, UserRole } from "../../domain/identity/identity-contracts";

export type LocalIdentitySubject = Readonly<{ subject: string; role: UserRole }>;

export class LocalDevelopmentIdentityProvider implements IdentityProvider {
  readonly mode = "local_development" as const;

  constructor(private readonly credentials: ReadonlyMap<string, LocalIdentitySubject>, private readonly environment: "development" | "test") {}

  async authenticate(credential: string): Promise<LocalIdentitySubject | null> {
    if (this.environment !== "development" && this.environment !== "test") return null;
    return this.credentials.get(credential) || null;
  }
}

export class DisabledIdentityProvider implements IdentityProvider {
  readonly mode = "disabled" as const;
  async authenticate(): Promise<null> { return null; }
}
