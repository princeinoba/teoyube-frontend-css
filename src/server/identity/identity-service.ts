import type { AuthorizationContext, IdentityProvider, IssuedSession, SessionRepository, TrustedSession, UserRole } from "../../domain/identity/identity-contracts";

export class IdentityService {
  constructor(private readonly provider: IdentityProvider, private readonly sessions: SessionRepository, private readonly clock: () => string = () => new Date().toISOString()) {}

  get mode() { return this.provider.mode; }

  async signIn(credential: string): Promise<IssuedSession> {
    const identity = await this.provider.authenticate(credential);
    if (!identity) throw new Error("Authentication failed.");
    return this.sessions.create(identity.subject, identity.role, this.clock());
  }

  async authenticate(token: string): Promise<TrustedSession> {
    const session = await this.sessions.resolve(token, this.clock());
    if (!session) throw new Error("Authentication required.");
    return session;
  }

  async authorizeMutation(token: string, csrfToken: string): Promise<AuthorizationContext> {
    const session = await this.authenticate(token);
    if (!await this.sessions.verifyCsrf(session.id, csrfToken)) throw new Error("Request verification failed.");
    return Object.freeze({ user: session.user, sessionId: session.id });
  }

  async requireRole(token: string, roles: readonly UserRole[]): Promise<AuthorizationContext> {
    const session = await this.authenticate(token);
    if (!roles.includes(session.user.role)) throw new Error("Resource unavailable.");
    return Object.freeze({ user: session.user, sessionId: session.id });
  }

  async rotate(token: string, csrfToken: string): Promise<IssuedSession> {
    return this.sessions.rotate(token, csrfToken, this.clock());
  }

  async signOut(token: string, csrfToken: string): Promise<void> {
    await this.sessions.invalidate(token, csrfToken, this.clock());
  }
}
