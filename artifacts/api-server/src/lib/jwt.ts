import { createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-in-production";

export function signToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const [header, body, sig] = token.split(".");
    const expectedSig = createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
    if (sig !== expectedSig) return null;
    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return null;
  }
}
