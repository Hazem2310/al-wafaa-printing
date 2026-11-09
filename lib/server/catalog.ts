import { seedProducts, type Product } from "@/lib/catalog";
import { listKeys, readJSON, writeJSON } from "./storage";

export async function allProducts(admin = false) {
  const merged = new Map(seedProducts.map(item => [item.id, item]));
  const keys = await listKeys("products");
  const records = await Promise.all(keys.map(key => readJSON<Product>(key)));
  for (const record of records) if (record) merged.set(record.id, record);
  return [...merged.values()].filter(item => !item.deleted && (admin || item.visible))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function findProduct(id: string) {
  return await readJSON<Product>(`products/${id}`) || seedProducts.find(item => item.id === id) || null;
}
export async function saveProduct(item: Product) { await writeJSON(`products/${item.id}`, item); }
