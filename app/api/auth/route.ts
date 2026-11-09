import { cookies } from "next/headers";
import { authenticated, checkPassword, configured, COOKIE, limitLogin, sessionToken } from "@/lib/server/auth";
import { failure, json, readBody, sameOrigin, ApiError } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() { return json({ authenticated: await authenticated(), configured: configured() }); }
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const body = await readBody(request);
    if (typeof body.password !== "string" || body.password.length > 256) throw new ApiError(400, "كلمة مرور غير صالحة");
    await limitLogin(request);
    if (!checkPassword(body.password)) throw new ApiError(401, "كلمة المرور غير صحيحة");
    (await cookies()).set(COOKIE, sessionToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production" && process.env.CATALOG_STORAGE !== "local", sameSite: "strict", path: "/", maxAge: 28800 });
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
export async function DELETE(request: Request) {
  try { sameOrigin(request); (await cookies()).delete(COOKIE); return json({ ok: true }); } catch (error) { return failure(error); }
}
