import { Suspense } from "react";
import { CatalogGallery } from "@/components/catalog-gallery";
export const metadata = { title: "معرض النماذج وكتالوج الأعراس | مطبعة الوفاء", description: "تصفح الأقلام والهدايا وكتالوج دعوات الأعراس الأصلي، مع صور وتفاصيل كل نموذج." };
export default function CatalogPage() { return <Suspense fallback={<p className="loading-state">جاري تحميل المعرض…</p>}><CatalogGallery/></Suspense>; }
