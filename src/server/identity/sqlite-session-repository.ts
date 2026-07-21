import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { IssuedSession, SessionRepository, TrustedSession, UserRole } from "../../domain/identity/identity-contracts";
import type { TeoyubeDatabase } from "../memory/sqlite-database";
import { withImmediateTransaction } from "../memory/sqlite-database";

type Row = Record<string, null | number | bigint | string | Uint8Array>;

function text(row: Row, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw new Error("Session record is invalid.");
  return value;
}

function secureEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.byteLength === b.byteLength && timingSafeEqual(a, b);
}

export class SqliteSessionRepository implements SessionRepository {
  constructor(
    private readonly database: TeoyubeDatabase,
    private readonly pepper: string,
    private readonly ttlMs = 8 * 60 * 60 * 1000,
    private readonly tokenBytes: () => Uint8Array = () => randomBytes(32),
    private readonly createId: () => string = randomUUID
  ) {
    if (pepper.length < 32) throw new Error("The server session pepper must be at least 32 characters.");
  }

  private hash(value: string): string {
    return createHash("sha256").update(this.pepper).update("\0").update(value).digest("hex");
  }

  private makeToken(): string { return Buffer.from(this.tokenBytes()).toString("base64url"); }

  async create(subject: string, role: UserRole, now: string): Promise<IssuedSession> {
    const subjectHash = this.hash(`subject:${subject}`);
    return withImmediateTransaction(this.database, () => {
      let user = this.database.prepare("SELECT id,role,deleted_at FROM users WHERE local_subject_hash=?").get(subjectHash);
      if (user?.deleted_at) throw new Error("Authentication failed.");
      if (!user) {
        const userId = this.createId();
        this.database.prepare("INSERT INTO users(id,role,local_subject_hash,created_at) VALUES (?,?,?,?)").run(userId, role, subjectHash, now);
        user = this.database.prepare("SELECT id,role,deleted_at FROM users WHERE id=?").get(userId);
      }
      if (!user) throw new Error("Authentication failed.");
      return this.insertSession(text(user, "id"), text(user, "role") as UserRole, now);
    });
  }

  private insertSession(userId: string, role: UserRole, now: string, rotatedAt?: string): IssuedSession {
    const token = this.makeToken();
    const csrfToken = this.makeToken();
    const sessionId = this.createId();
    const expiresAt = new Date(new Date(now).getTime() + this.ttlMs).toISOString();
    this.database.prepare("INSERT INTO sessions(id,token_hash,csrf_hash,user_id,created_at,expires_at,rotated_at) VALUES (?,?,?,?,?,?,?)")
      .run(sessionId, this.hash(`token:${token}`), this.hash(`csrf:${csrfToken}`), userId, now, expiresAt, rotatedAt || null);
    return Object.freeze({ token, session: Object.freeze({ id: sessionId, user: Object.freeze({ id: userId, role }), csrfToken, createdAt: now, expiresAt, rotatedAt }) });
  }

  async resolve(token: string, now: string): Promise<TrustedSession | null> {
    if (!token) return null;
    const row = this.database.prepare("SELECT s.*,u.role,u.deleted_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?").get(this.hash(`token:${token}`));
    if (!row || row.invalidated_at || row.deleted_at || text(row, "expires_at") <= now) return null;
    return Object.freeze({ id: text(row, "id"), user: Object.freeze({ id: text(row, "user_id"), role: text(row, "role") as UserRole }), csrfToken: "", createdAt: text(row, "created_at"), expiresAt: text(row, "expires_at"), rotatedAt: typeof row.rotated_at === "string" ? row.rotated_at : undefined });
  }

  async verifyCsrf(sessionId: string, csrfToken: string): Promise<boolean> {
    const row = this.database.prepare("SELECT csrf_hash FROM sessions WHERE id=? AND invalidated_at IS NULL").get(sessionId);
    return Boolean(row && secureEqual(text(row, "csrf_hash"), this.hash(`csrf:${csrfToken}`)));
  }

  async rotate(token: string, csrfToken: string, now: string): Promise<IssuedSession> {
    return withImmediateTransaction(this.database, () => {
      const row = this.database.prepare("SELECT s.*,u.role,u.deleted_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?").get(this.hash(`token:${token}`));
      if (!row || row.invalidated_at || row.deleted_at || text(row, "expires_at") <= now || !secureEqual(text(row, "csrf_hash"), this.hash(`csrf:${csrfToken}`))) throw new Error("Session validation failed.");
      this.database.prepare("UPDATE sessions SET invalidated_at=?,rotated_at=? WHERE id=? AND invalidated_at IS NULL").run(now, now, text(row, "id"));
      return this.insertSession(text(row, "user_id"), text(row, "role") as UserRole, now, now);
    });
  }

  async invalidate(token: string, csrfToken: string, now: string): Promise<void> {
    const row = this.database.prepare("SELECT id,csrf_hash FROM sessions WHERE token_hash=? AND invalidated_at IS NULL").get(this.hash(`token:${token}`));
    if (!row || !secureEqual(text(row, "csrf_hash"), this.hash(`csrf:${csrfToken}`))) throw new Error("Session validation failed.");
    this.database.prepare("UPDATE sessions SET invalidated_at=? WHERE id=? AND invalidated_at IS NULL").run(now, text(row, "id"));
  }
}
