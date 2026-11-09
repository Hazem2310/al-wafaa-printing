export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store, max-age=0", "Netlify-CDN-Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) throw new ApiError(403, "طلب غير مسموح");
  let parsed: URL;
  try { parsed = new URL(origin); } catch { throw new ApiError(403, "طلب غير مسموح"); }
  if (!/^https?:$/.test(parsed.protocol) || (parsed.origin !== new URL(request.url).origin && parsed.host !== request.headers.get("host"))) throw new ApiError(403, "طلب غير مسموح");
}
export async function limitedBody(request: Request, max: number) {
  if (Number(request.headers.get("content-length") || 0) > max) throw new ApiError(413, "الملف أو البيانات أكبر من الحد المسموح");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "الطلب فارغ");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > max) { await reader.cancel(); throw new ApiError(413, "الملف أكبر من الحد المسموح"); } chunks.push(value); }
  return Buffer.concat(chunks);
}
export async function readBody(request: Request) {
  try { return JSON.parse((await limitedBody(request, 16384)).toString()); }
  catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(400, "بيانات غير صالحة"); }
}
export function failure(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  if (error instanceof Error && /NOT_CONFIGURED/.test(error.message)) return json({ error: "أكمل إعداد الخادم أولًا. اتبع ملف START-HERE-AR.md المرفق." }, 503);
  console.error("Catalog API error", error instanceof Error ? error.message : "Unknown error");
  return json({ error: "لم يتم حفظ التغيير. تعذر الاتصال بالتخزين، حاول مرة أخرى." }, 503);
}
