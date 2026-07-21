import type { UserId } from "../memory/memory-contracts";

export type UserRole = "user" | "owner" | "admin";

export type AuthenticatedUser = Readonly<{
  id: UserId;
  role: UserRole;
}>;

export type TrustedSession = Readonly<{
  id: string;
  user: AuthenticatedUser;
  csrfToken: string;
  createdAt: string;
  expiresAt: string;
  rotatedAt?: string;
}>;

export type IssuedSession = Readonly<{
  token: string;
  session: TrustedSession;
}>;

export interface IdentityProvider {
  readonly mode: "disabled" | "local_development" | "production_provider";
  authenticate(credential: string): Promise<Readonly<{ subject: string; role: UserRole }> | null>;
}

export interface SessionRepository {
  create(subject: string, role: UserRole, now: string): Promise<IssuedSession>;
  resolve(token: string, now: string): Promise<TrustedSession | null>;
  rotate(token: string, csrfToken: string, now: string): Promise<IssuedSession>;
  invalidate(token: string, csrfToken: string, now: string): Promise<void>;
  verifyCsrf(sessionId: string, csrfToken: string): Promise<boolean>;
}

export type AuthorizationContext = Readonly<{
  user: AuthenticatedUser;
  sessionId: string;
}>;
