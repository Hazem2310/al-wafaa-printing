"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ImagePlus, Plus, Save, Trash2 } from "lucide-react";

type CatalogItem = { id: string; title: string; description: string; category: string; image: string };
const CATALOG_KEY = "al-wafaa-catalog";
const initialForm = { title: "", description: "", category: "أقلام مخصصة", image: "" };

export default function AdminPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(CATALOG_KEY) || "[]")); } catch { setItems([]); }
  }, []);

  const persist = (next: CatalogItem[]) => {
    setItems(next);
    localStorage.setItem(CATALOG_KEY, JSON.stringify(next));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const addItem = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    persist([{ id: crypto.randomUUID(), ...form }, ...items]);
    setForm(initialForm);
  };

  return <main className="admin-shell" dir="rtl" lang="ar">
    <header className="admin-header"><a href="/" className="admin-back"><ArrowRight size={18}/> الرجوع للموقع</a><div className="admin-brand"><span>W</span><strong>إدارة مطبعة الوفاء</strong></div></header>
    <section className="admin-intro"><div><span>لوحة الإدارة</span><h1>أضف شغلك الجديد بنفسك.</h1><p>أقلام، هدايا، كروت، لافتات أو أي تصميم جديد. أضف الاسم، الوصف ورابط الصورة وسيظهر في قسم «أعمال ومنتجات جديدة».</p></div><div className="admin-colors"><i/><i/><i/></div></section>
    <div className="admin-layout"><section className="admin-panel"><div className="panel-title"><ImagePlus size={21}/><div><h2>إضافة منتج أو عمل</h2><p>الحقول التي عليها نجمة مطلوبة.</p></div></div><form onSubmit={addItem}><label>اسم المنتج أو التصميم *<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="مثال: أقلام تخرج مطبوعة" required/></label><label>القسم<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>أقلام مخصصة</option><option>هدايا بتصميم شخصي</option><option>كروت الأعراس</option><option>تصاميم المدارس</option><option>لافتات وبنرات</option><option>تصاميم الأعراس</option><option>عمل جديد</option></select></label><label>وصف قصير<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="اكتب تفاصيل بسيطة عن التصميم..." rows={4}/></label><label>رابط الصورة<input value={form.image} onChange={e=>setForm({...form,image:e.target.value})} type="url" placeholder="https://..."/></label><button className="admin-save" type="submit"><Plus size={18}/>أضف للموقع</button>{saved && <span className="saved-note"><Save size={15}/>تم الحفظ على هذا الجهاز</span>}</form></section>
      <section className="admin-panel"><div className="panel-title"><div className="item-count">{items.length}</div><div><h2>المنتجات المضافة</h2><p>يمكنك حذف أي عنصر من هنا.</p></div></div><div className="admin-items">{items.length === 0 ? <div className="empty-state">لسا ما أضفت منتجات. ابدأ من النموذج.</div> : items.map(item=><article key={item.id}><div className="admin-thumb">{item.image ? <img src={item.image} alt=""/> : <ImagePlus size={19}/>}</div><div><span>{item.category}</span><strong>{item.title}</strong><p>{item.description || "بدون وصف"}</p></div><button type="button" onClick={()=>persist(items.filter(current=>current.id!==item.id))} aria-label="حذف"><Trash2 size={17}/></button></article>)}</div></section></div>
    <p className="admin-note">مهم: هذه النسخة تحفظ الإضافات في نفس المتصفح والجهاز. حتى تظهر للجميع على الموقع بعد النشر، نربط اللوحة لاحقًا بقاعدة بيانات مع تسجيل دخول آمن.</p>
  </main>;
}
