import { getStore } from "@netlify/blobs";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Never fall back to an ephemeral filesystem in production.
export function storageMode() {
  const configured = process.env.CATALOG_STORAGE;
  if (configured === "local" && !process.env.NETLIFY && !process.env.SITE_ID) return "local";
  if (configured === "netlify" || process.env.NETLIFY || process.env.SITE_ID) return "netlify";
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") return "local";
  throw new Error("STORAGE_NOT_CONFIGURED");
}
function blobStore() {
  // Deploy previews use an isolated namespace; production changes survive redeploys.
  const branch = process.env.CONTEXT;
  const name = branch && branch !== "production" ? `al-wafaa-${branch}` : "al-wafaa-catalog";
  return getStore({ name, consistency: "strong" });
}
function localPath(key: string) {
  if (!/^[a-zA-Z0-9_/-]+$/.test(key) || key.includes("..")) throw new Error("INVALID_KEY");
  const namespace = process.env.CATALOG_LOCAL_NAMESPACE || "main";
  if (!/^[a-zA-Z0-9_-]+$/.test(namespace)) throw new Error("INVALID_NAMESPACE");
  return path.join(process.cwd(), ".wafaa-data", namespace, key);
}
export async function readBytes(key: string): Promise<Uint8Array | null> {
  if (storageMode() === "netlify") {
    const result = await blobStore().get(key, { type: "arrayBuffer" });
    return result ? new Uint8Array(result) : null;
  }
  try { return await readFile(localPath(key)); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}
export async function writeBytes(key: string, bytes: Uint8Array) {
  if (storageMode() === "netlify") { await blobStore().set(key, new Blob([Buffer.from(bytes)])); return; }
  const file = localPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}-${randomUUID()}`;
  await writeFile(temp, bytes, { mode: 0o600 });
  await rename(temp, file);
}
export async function readJSON<T>(key: string): Promise<T | null> {
  const bytes = await readBytes(key);
  return bytes ? JSON.parse(new TextDecoder().decode(bytes)) as T : null;
}
export async function writeJSON(key: string, value: unknown) { await writeBytes(key, new TextEncoder().encode(JSON.stringify(value))); }
export async function listKeys(prefix: string) {
  if (storageMode() === "netlify") return (await blobStore().list({ prefix: `${prefix}/` })).blobs.map(blob => blob.key);
  try { return (await readdir(localPath(prefix))).filter(name => /^[a-zA-Z0-9_-]+$/.test(name)).map(name => `${prefix}/${name}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
}
