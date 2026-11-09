import { readBytes } from "@/lib/server/storage";
import { failure } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null,{status:404});
  try { const bytes = await readBytes(`media/${id}`); if (!bytes) return new Response(null,{status:404}); return new Response(Buffer.from(bytes),{headers:{"Content-Type":"image/webp","Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}}); } catch(error) { return failure(error); }
}
