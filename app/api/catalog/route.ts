import { allProducts } from "@/lib/server/catalog";
import { json, failure } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() { try { return json({ items: await allProducts() }); } catch (error) { return failure(error); } }
