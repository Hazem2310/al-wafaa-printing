import { randomUUID } from "node:crypto";
import { productSchema } from "@/lib/catalog";
import { requireAdmin } from "@/lib/server/auth";
import { allProducts, saveProduct } from "@/lib/server/catalog";
import { ApiError, failure, json, readBody, sameOrigin } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() { try { await requireAdmin(); return json({ items: await allProducts(true) }); } catch (error) { return failure(error); } }
export async function POST(request: Request) {
  try {
    sameOrigin(request); await requireAdmin();
    const parsed = productSchema.safeParse(await readBody(request));
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0].message);
    const item = { ...parsed.data, id: randomUUID(), updatedAt: new Date().toISOString() };
    await saveProduct(item); return json({ item }, 201);
  } catch (error) { return failure(error); }
}
