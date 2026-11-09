import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ApiError } from "./http";
import { readJSON, writeJSON } from "./storage";
export const COOKIE = "wafaa_admin";
export function configured() { return (process.env.ADMIN_PASSWORD?.length || 0) >= 12 && (process.env.ADMIN_SESSION_SECRET?.length || 0) >= 32; }
function key() { if (!configured()) throw new Error("AUTH_NOT_CONFIGURED"); return `${process.env.ADMIN_SESSION_SECRET}:${process.env.ADMIN_PASSWORD}`; }
function sign(value: string) { return createHmac("sha256", key()).update(value).digest("base64url"); }
export function checkPassword(password: string) {
  key();
  return timingSafeEqual(createHash("sha256").update(password).digest(), createHash("sha256").update(process.env.ADMIN_PASSWORD!).digest());
}
export function sessionToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000, nonce: randomUUID() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export async function authenticated() {
  if (!configured()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    const [payload, signature, extra] = token.split(".");
    const expected = sign(payload);
    return !extra && signature?.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) && JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
  } catch { return false; }
}
export async function requireAdmin() { if (!configured()) throw new Error("AUTH_NOT_CONFIGURED"); if (!await authenticated()) throw new ApiError(401, "سجّل دخولك أولًا"); }
export async function limitLogin(request: Request) {
  // Netlify supplies the client IP. Do not trust arbitrary forwarded headers.
  const ip = process.env.CATALOG_STORAGE === "netlify" || process.env.NETLIFY || process.env.SITE_ID ? request.headers.get("x-nf-client-connection-ip") || "unknown" : "local";
  const id = createHmac("sha256", key()).update(ip).digest("hex");
  const now = Date.now();
  const record = await readJSON<{ count: number; until: number }>(`login/${id}`);
  if (record && record.until > now && record.count >= 8) throw new ApiError(429, "محاولات كثيرة. انتظر 15 دقيقة ثم حاول مجددًا.");
  await writeJSON(`login/${id}`, { count: record && record.until > now ? record.count + 1 : 1, until: record && record.until > now ? record.until : now + 15 * 60 * 1000 });
}
