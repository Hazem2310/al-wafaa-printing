import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/server/auth";
import { ApiError, failure, json, limitedBody, sameOrigin } from "@/lib/server/http";
import { writeBytes } from "@/lib/server/storage";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request); await requireAdmin();
    const bytes = await limitedBody(request, 3 * 1024 * 1024 + 8192);
    const form = await new Response(bytes, { headers: { "content-type": request.headers.get("content-type") || "" } }).formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 3 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new ApiError(400, "اختر JPG أو PNG أو WebP بحجم أقل من 3 MB");
    const buffer = Buffer.from(await file.arrayBuffer());
    let converted: Buffer;
    try {
      const input = sharp(buffer, { limitInputPixels: 32000000 });
      const metadata = await input.metadata();
      if (!["jpeg","png","webp"].includes(metadata.format || "")) throw new Error("Invalid format");
      converted = await input.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
    } catch { throw new ApiError(400, "تعذر قراءة الصورة. اختر صورة أخرى صالحة."); }
    const id = randomUUID(); await writeBytes(`media/${id}`, converted);
    return json({ url: `/api/media/${id}` }, 201);
  } catch (error) { return failure(error); }
}
