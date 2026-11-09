import { productSchema } from "@/lib/catalog";
import { requireAdmin } from "@/lib/server/auth";
import { findProduct, saveProduct } from "@/lib/server/catalog";
import { ApiError, failure, json, readBody, sameOrigin } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
async function target(context: Context) { const { id } = await context.params; if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) throw new ApiError(400,"رقم غير صالح"); const item = await findProduct(id); if (!item || item.deleted) throw new ApiError(404,"العنصر غير موجود"); return item; }
export async function PUT(request: Request, context: Context) {
  try { sameOrigin(request); await requireAdmin(); const old = await target(context); const parsed = productSchema.safeParse(await readBody(request)); if (!parsed.success) throw new ApiError(400, parsed.error.issues[0].message); const item = { ...old, ...parsed.data, updatedAt: new Date().toISOString() }; await saveProduct(item); return json({ item }); } catch (error) { return failure(error); }
}
export async function DELETE(request: Request, context: Context) {
  try { sameOrigin(request); await requireAdmin(); const old = await target(context); await saveProduct({ ...old, deleted: true, updatedAt: new Date().toISOString() }); return json({ ok: true }); } catch (error) { return failure(error); }
}
