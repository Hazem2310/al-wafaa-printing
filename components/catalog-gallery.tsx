"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpLeft, Search, X, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { categories, groups, seedProducts, titleOf, descriptionOf, whatsapp, type Product, type Locale } from "@/lib/catalog";
import { Brand } from "./brand";
import { ProductArt } from "./product-art";

export function CatalogGallery() {
  const params = useSearchParams();
  const [locale, setLocale] = useState<Locale>(params.get("lang") === "he" ? "he" : "ar");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Product[]>(seedProducts);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Product | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const refresh = useCallback(async () => {
    try { const response = await fetch("/api/catalog", { cache: "no-store" }); if (!response.ok) throw new Error(); const data = await response.json(); setItems(data.items); setError(false); } catch { setError(true); } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void refresh(); const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    const visible = () => { if (!document.hidden) void refresh(); };
    window.addEventListener("focus", visible); document.addEventListener("visibilitychange", visible);
    return () => { clearInterval(timer); window.removeEventListener("focus", visible); document.removeEventListener("visibilitychange", visible); };
  }, [refresh]);
  const changeCategory = (id: string) => { setCategory(id); setGroup("all"); setQuery(""); window.history.replaceState(null, "", `/catalog?category=${id}&lang=${locale}`); };
  const filtered = items.filter(item => (category === "all" || item.category === category) && (group === "all" || item.weddingGroup === group) && `${item.titleAr} ${item.titleHe} ${item.code || ""}`.toLowerCase().includes(query.toLowerCase()));
  const selectedCategory = categories.find(item => item.id === category);
  const open = (item: Product) => { setActive(item); dialog.current?.showModal(); };
  const close = () => dialog.current?.close();
  const navigate = (step: number) => { if (!active || !filtered.length) return; const index = filtered.findIndex(item => item.id === active.id); setActive(filtered[(index + step + filtered.length) % filtered.length]); };
  const he = locale === "he";
  return <main className="gallery-shell" dir="rtl" lang={locale}>
    <header className="site-header"><a href="/" aria-label={he ? "דף הבית" : "الرئيسية"}><Brand/></a><div className="header-actions"><a href="/" className="back-home">{he ? "לדף הבית" : "الرئيسية"}</a><button className="language-switch" onClick={() => setLocale(he ? "ar" : "he")}>{he ? "العربية" : "עברית"}</button></div></header>
    <section className="gallery-intro"><span className="section-kicker">THE PRINT COLLECTION</span><h1>{selectedCategory ? selectedCategory[locale] : he ? "רעיון קטן. אפשרויות גדולות." : "تفرّج. اختار. خلّيها على ذوقك."}</h1><p>{he ? "פתחו דגם לצפייה בתמונה ובפרטים, ורק אחר כך שלחו לנו את הבחירה." : "افتح أي نموذج وشاهد الصورة والتفاصيل بحجم أكبر، وبعدها ابعث لنا اختيارك."}</p><a href={whatsapp(he ? "שלום, יש לי עיצוב משלי להדפסה." : "مرحبًا، عندي تصميم خاص وبدي أبعثه للطباعة.")} className="text-link">{he ? "שלחו עיצוב משלכם" : "عندك تصميمك الخاص؟ ابعثه إلنا"}<ArrowUpLeft size={17}/></a></section>
    <section className="gallery-browser" aria-label={he ? "גלריית דגמים" : "معرض النماذج"}>
      <div className="catalog-tabs"><button aria-pressed={category === "all"} onClick={() => changeCategory("all")}>{he ? "הכל" : "الكل"}</button>{categories.map(cat => <button key={cat.id} aria-pressed={category === cat.id} onClick={() => changeCategory(cat.id)}>{cat[locale]}<small>{items.filter(item => item.category === cat.id).length}</small></button>)}</div>
      <div className="gallery-toolbar"><label className="search-box"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={he ? "חיפוש שם או מספר דגם" : "ابحث باسم أو رقم النموذج"}/></label><span aria-live="polite">{filtered.length} {he ? "תצוגות" : "معاينة"}{loading ? "…" : ""}</span></div>
      {category === "invitations" && <><div className="group-tabs">{groups.map(g => <button key={g.id} aria-pressed={group === g.id} onClick={() => setGroup(g.id)}>{g[locale]}</button>)}</div><p className="catalog-notice">{he ? "הקטלוג המקורי: 46 דגמים ב־36 עמודי עיצוב. חלק מהעמודים כוללים כמה דגמים. מחירים מודפסים היסטוריים ואינם הצעת מחיר עדכנית." : "الكتالوج الأصلي: 46 نموذجًا ضمن 36 صفحة تصميم. بعض الصفحات تجمع أكثر من نموذج. الأسعار الظاهرة بالصور قديمة وليست عرض سعر حاليًا."}</p></>}
      {error && <div className="inline-error" role="status">{he ? "לא הצלחנו לרענן את הקטלוג. מוצגת התצוגה האחרונה הזמינה." : "تعذّر تحديث المعرض من السيرفر. المعروض هو آخر محتوى متاح، وليس تأكيدًا لآخر إضافات الأدمن."}<button onClick={() => void refresh()}>{he ? "נסו שוב" : "حاول مجددًا"}</button></div>}
      <div className="product-grid">{filtered.map(item => <article className="product-card" key={item.id}><button className="product-open" onClick={() => open(item)} aria-label={`${he ? "צפייה" : "شاهد"} ${titleOf(item, locale)}`}><ProductArt item={item}/><span className="zoom-hint">{he ? "לצפייה בפרטים" : "شاهد التفاصيل"}<ArrowUpLeft size={17}/></span></button><div className="product-summary"><small>{categories.find(cat => cat.id === item.category)?.[locale]}{item.demo ? he ? " · הדמיה" : " · توضيحي" : ""}</small><button onClick={() => open(item)}><h2>{titleOf(item, locale)}</h2><ArrowUpLeft size={19}/></button></div></article>)}</div>
      {!filtered.length && <div className="empty-state">{he ? "אין דגמים התואמים לחיפוש. נסו קטגוריה אחרת." : "ما في نماذج مطابقة حاليًا. جرّب قسمًا آخر أو غيّر البحث."}</div>}
    </section>
    <footer><Brand/><span>{he ? "הדמיות להתאמה אישית, לפי זמינות." : "نماذج قابلة للتخصيص حسب الطلب والتوفر."}</span><a href="/admin">{he ? "ניהול" : "الإدارة"}</a></footer>
    <dialog ref={dialog} className="product-dialog" onClose={() => setActive(null)} onClick={e => { if (e.target === dialog.current) close(); }} onKeyDown={e => { if (e.key === "ArrowLeft") navigate(1); if (e.key === "ArrowRight") navigate(-1); }} aria-labelledby="product-dialog-title">
      {active && <div className="dialog-layout"><button className="dialog-close" onClick={close} aria-label={he ? "סגירה" : "إغلاق"}><X/></button><div className="dialog-image"><ProductArt item={active} large/><div className="dialog-arrows"><button onClick={() => navigate(-1)} aria-label={he ? "הקודם" : "السابق"}><ChevronRight/></button><button onClick={() => navigate(1)} aria-label={he ? "הבא" : "التالي"}><ChevronLeft/></button></div></div><div className="dialog-info"><Brand text={false}/><span className="section-kicker">{categories.find(cat => cat.id === active.category)?.[locale]}</span><h2 id="product-dialog-title">{titleOf(active, locale)}</h2><p>{descriptionOf(active, locale)}</p>{active.code && <code>{active.code}</code>}<a className="button button-primary" href={whatsapp(`${he ? "שלום, אני מעוניין בדגם" : "مرحبًا، مهتم بالنموذج"}: ${titleOf(active, locale)} (${active.code || active.id})`)} target="_blank" rel="noreferrer"><MessageCircle size={18}/>{he ? "שאלו על הדגם הזה" : "استفسر عن هذا النموذج"}</a>{active.image && <a className="text-link" href={active.image} target="_blank" rel="noreferrer">{he ? "פתיחת התמונה בגודל מלא" : "افتح الصورة بحجمها الكامل"}<ArrowUpLeft size={16}/></a>}</div></div>}
    </dialog>
  </main>;
}
