import { z } from "zod";
import weddingPages from "@/data/wedding-pages.json";

export const categories = [
  { id: "pens", ar: "أقلام مخصصة", he: "עטים ממותגים", mockup: "pen" },
  { id: "gifts", ar: "هدايا شخصية", he: "מתנות אישיות", mockup: "gift" },
  { id: "school", ar: "تصاميم المدارس", he: "עיצובים לבתי ספר", mockup: "notebook" },
  { id: "signs", ar: "لافتات وبنرات", he: "שלטים ובאנרים", mockup: "sign" },
  { id: "weddings", ar: "تفاصيل الأعراس", he: "עיצובי חתונה", mockup: "invitation" },
  { id: "invitations", ar: "كتالوج كروت الأعراس", he: "קטלוג הזמנות לחתונה", mockup: "invitation" },
] as const;
export const groups = [
  { id: "all", ar: "جميع النماذج", he: "כל הדגמים" },
  { id: "groom", ar: "العريس", he: "חתן" },
  { id: "bride", ar: "العروس", he: "כלה" },
  { id: "shared", ar: "مشترك", he: "משותף" },
] as const;
export type Locale = "ar" | "he";
export type Category = typeof categories[number]["id"];
export function safeImage(value: string) {
  if (!value) return true;
  if (/^\/(images|catalog|api\/media)\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes("..")) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
export const productSchema = z.object({
  titleAr: z.string().trim().min(1, "اكتب اسم المنتج").max(120),
  titleHe: z.string().trim().max(120).default(""),
  descriptionAr: z.string().trim().max(2000).default(""),
  descriptionHe: z.string().trim().max(2000).default(""),
  category: z.enum(["pens", "gifts", "school", "signs", "weddings", "invitations"]),
  weddingGroup: z.enum(["all", "groom", "bride", "shared"]).default("all"),
  image: z.string().max(2048).refine(safeImage, "استخدم صورة مرفوعة أو رابط HTTPS مباشر").default(""),
  mockup: z.enum(["pen", "gift", "notebook", "sign", "invitation"]).default("pen"),
  demo: z.boolean().default(false),
  visible: z.boolean().default(true),
}).refine(item => Boolean(item.image) || item.demo, { message: "ارفع صورة للمنتج أو اختر نموذجًا توضيحيًا", path: ["image"] });
export type ProductInput = z.infer<typeof productSchema>;
export type Product = ProductInput & { id: string; updatedAt: string; deleted?: boolean; code?: string };
export const LOGO = "/images/al-wafaa-logo.jpeg";
export const PHONE = "052-6269162";
export function whatsapp(text = "مرحبًا مطبعة الوفاء، عندي استفسار عن التصميم والطباعة.") {
  return `https://wa.me/972526269162?text=${encodeURIComponent(text)}`;
}
export function titleOf(item: Product, locale: Locale) { return locale === "he" ? item.titleHe || item.titleAr : item.titleAr; }
export function descriptionOf(item: Product, locale: Locale) { return locale === "he" ? item.descriptionHe || item.descriptionAr : item.descriptionAr; }

const examples: [Category, string, string, ProductInput["mockup"]][] = [
  ["pens", "قلم باسمك", "עט עם השם שלך", "pen"],
  ["pens", "قلم بهوية مشروعك", "עט עם מיתוג העסק", "pen"],
  ["pens", "أقلام تخرّج", "עטים לסיום לימודים", "pen"],
  ["gifts", "بوكس هدية مخصص", "מארז מתנה אישי", "gift"],
  ["school", "دفتر باسم الطالب", "מחברת עם שם התלמיד", "notebook"],
  ["signs", "لافتة بهوية مشروعك", "שלט עם מיתוג העסק", "sign"],
  ["weddings", "بطاقة ترحيب بالضيوف", "כרטיס ברכה לאורחים", "invitation"],
];
export const seedProducts: Product[] = [
  ...examples.map(([category, titleAr, titleHe, mockup], index) => ({
    id: `demo-${index + 1}`, titleAr, titleHe, category, mockup,
    descriptionAr: "نموذج توضيحي للفكرة، وليس صورة منتج جاهز. نخصص الاسم والألوان والتفاصيل حسب طلبك؛ تواصل معنا لتأكيد الخامات والتوفر.",
    descriptionHe: "הדמיה להמחשת הרעיון, לא צילום מוצר מוכן. השם והצבעים ניתנים להתאמה; פנו אלינו לאישור החומרים והזמינות.",
    image: "", weddingGroup: "all" as const, demo: true, visible: true, updatedAt: "2026-09-01T00:00:00.000Z",
  })),
  ...weddingPages.map(page => ({
    id: `wedding-${page.page}`, code: `MODEL ${page.code}`,
    titleAr: page.titleAr, titleHe: page.titleHe,
    category: "invitations" as const, weddingGroup: page.group as ProductInput["weddingGroup"],
    descriptionAr: "من كتالوج المطبعة الأصلي. الصفحة قد تتضمن وجهَي البطاقة أو أكثر من نموذج. الأسماء والمواعيد توضيحية؛ أي أسعار مطبوعة قديمة وتُؤكّد عند الطلب.",
    descriptionHe: "מתוך הקטלוג המקורי. עמוד עשוי לכלול שני צדדים או כמה דגמים. שמות ותאריכים להמחשה; מחירים מודפסים ישנים ויש לאשרם בעת ההזמנה.",
    image: `/catalog/weddings/page-${String(page.page).padStart(2,"0")}.jpg`,
    mockup: "invitation" as const, demo: false, visible: true, updatedAt: "2026-09-03T00:00:00.000Z",
  })),
];
