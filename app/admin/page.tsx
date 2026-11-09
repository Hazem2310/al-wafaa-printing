"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, ImagePlus, LogOut, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { categories, groups, type Product, type ProductInput } from "@/lib/catalog";
import { ProductArt } from "@/components/product-art";

const empty: ProductInput = { titleAr: "", titleHe: "", descriptionAr: "", descriptionHe: "", category: "pens", weddingGroup: "all", image: "", mockup: "pen", demo: false, visible: true };
async function api(url: string, options: RequestInit = {}) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "لم يتم حفظ العملية");
  return data;
}
export default function AdminPage() {
  const [auth, setAuth] = useState<{ authenticated: boolean; configured: boolean } | null>(null);
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductInput>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [hasLegacy, setHasLegacy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const load = async () => { const data = await api("/api/admin/catalog"); setItems(data.items); };
  useEffect(() => {
    void api("/api/auth").then(async state => { setAuth(state); if (state.authenticated) await load(); }).catch(e => setError(e.message));
    try { setHasLegacy(Array.isArray(JSON.parse(localStorage.getItem("al-wafaa-catalog") || "null")) && JSON.parse(localStorage.getItem("al-wafaa-catalog") || "[]").length > 0); } catch { /* Ignore malformed old browser data. */ }
  }, []);
  const login = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("/api/auth", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({password}) }); setPassword(""); setAuth({authenticated:true,configured:true}); await load(); } catch(e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const logout = async () => { try { await api("/api/auth", {method:"DELETE"}); setAuth({authenticated:false,configured:true}); setItems([]); setForm(empty); setEditing(null); } catch(e) { setError((e as Error).message); } };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (!form.image && !form.demo) throw new Error("ارفع صورة للمنتج، أو فعّل خيار النموذج التوضيحي.");
      const data = await api(editing ? `/api/admin/catalog/${editing}` : "/api/admin/catalog", { method:editing?"PUT":"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      setItems(current => [data.item, ...current.filter(item => item.id !== data.item.id)]);
      setMessage(form.visible ? "تم الحفظ على السيرفر. المنتج منشور في قسمه ويظهر للزوار." : "تم الحفظ كمسودة مخفية؛ لن يظهر للزوار حتى تنشره.");
      setForm(empty); setEditing(null); formRef.current?.reset();
    } catch(e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const upload = async (file?: File) => {
    if (!file) return; setUploading(true); setError(""); setMessage("");
    try { if (file.size > 3*1024*1024) throw new Error("الصورة أكبر من 3 MB. اختر صورة أصغر."); const body = new FormData(); body.append("file",file); const data = await api("/api/admin/upload", {method:"POST",body}); setForm(current => ({...current,image:data.url,demo:false})); setMessage("تم رفع الصورة. اضغط حفظ لنشر المنتج."); } catch(e) { setError((e as Error).message); } finally { setUploading(false); }
  };
  const remove = async (item: Product) => {
    if (!window.confirm(`حذف «${item.titleAr}» من الموقع؟`)) return;
    setBusy(true); setError(""); try { await api(`/api/admin/catalog/${item.id}`, {method:"DELETE"}); setItems(current=>current.filter(i=>i.id!==item.id)); if (editing === item.id) {setEditing(null); setForm(empty);} setMessage("تم حذف العنصر من المعرض. الصورة المرفوعة تبقى محفوظة احتياطيًا."); } catch(e) {setError((e as Error).message);} finally {setBusy(false);}
  };
  const edit = (item: Product) => { setEditing(item.id); setForm({...item}); setMessage(""); setError(""); formRef.current?.scrollIntoView({behavior:"smooth",block:"start"}); };
  const importLegacy = async () => {
    setBusy(true); setError(""); let count=0;
    try {
      const old = JSON.parse(localStorage.getItem("al-wafaa-catalog") || "[]");
      const imported: string[] = JSON.parse(localStorage.getItem("al-wafaa-imported") || "[]");
      for (const [index,item] of old.entries()) {
        const id = String(item.id || index); if (imported.includes(id)) continue;
        const category = categories.find(cat => cat.ar === item.category || (cat.id==="gifts" && item.category==="هدايا بتصميم شخصي") || (cat.id==="invitations" && item.category==="كروت الأعراس") || (cat.id==="weddings" && item.category==="تصاميم الأعراس")) || categories[0];
        await api("/api/admin/catalog", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...empty,titleAr:String(item.title||"منتج مستورد"),descriptionAr:String(item.description||""),category:category.id,mockup:category.mockup,image:String(item.image||""),demo:!item.image})});
        imported.push(id); localStorage.setItem("al-wafaa-imported",JSON.stringify(imported)); count++;
      }
      await load(); setHasLegacy(false); setMessage(`تم نشر ${count} من إضافاتك القديمة على السيرفر. لم تُحذف النسخة المحلية.`);
    } catch(e) {setError(`تم استيراد ${count}. ${(e as Error).message} يمكن إعادة المحاولة دون تكرار العناصر الناجحة.`);} finally {setBusy(false);}
  };
  return <main className="admin-shell" dir="rtl" lang="ar">
    <header className="admin-header"><a href="/"><Brand/></a><div className="header-actions"><a className="admin-back" href="/catalog"><ArrowRight size={17}/>المعرض</a>{auth?.authenticated && <button className="quiet-button" onClick={logout}><LogOut size={17}/>خروج</button>}</div></header>
    <section className="admin-intro"><div><span className="section-kicker">AL-WAFAA / STUDIO MANAGER</span><h1>شغلك الجديد،<br/>صار قدّام الكل.</h1><p>أضف صورك، عدّل النماذج واختر القسم. النشر يحفظ على السيرفر، وليس داخل متصفحك.</p></div><div className="admin-colors"><i/><i/><i/></div></section>
    {error && <div className="admin-alert error" role="alert">{error}</div>}{message && <div className="admin-alert success" role="status">{message}<a href={`/catalog?category=${filter === "all" ? "all" : filter}`} target="_blank" rel="noreferrer">شاهد المعرض ↗</a></div>}
    {!auth ? <p className="loading-state">جاري التحقق…</p> : !auth.authenticated ? <section className="admin-panel login-panel"><Brand text={false}/><h2>دخول الإدارة</h2>{!auth.configured ? <div className="setup-hint"><p>الإدارة مغلقة حتى تضبط كلمة مرور خاصة بك.</p><p>على جهازك: شغّل <code>npm run setup</code> ثم أعد تشغيل الموقع.</p><p>على Netlify: أضف <code>ADMIN_PASSWORD</code> و<code>ADMIN_SESSION_SECRET</code> و<code>CATALOG_STORAGE=netlify</code> في إعدادات البيئة ثم أعد النشر. التفاصيل في <code>START-HERE-AR.md</code>.</p></div> : <form onSubmit={login}><label>كلمة المرور<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="admin-save" disabled={busy}>{busy?"جاري الدخول…":"دخول آمن"}</button></form>}</section> : <>
      {hasLegacy && <div className="legacy-banner"><div><strong>في إضافات محفوظة بالنسخة القديمة على هذا المتصفح.</strong><p>انقلها للسيرفر حتى يشوفها الجميع؛ الصور ذات الروابط غير الصالحة تحتاج تعديلًا.</p></div><button className="button button-primary" disabled={busy} onClick={importLegacy}>استيراد إضافاتي القديمة</button></div>}
      <div className="admin-layout"><section className="admin-panel"><div className="panel-title"><ImagePlus size={22}/><div><h2>{editing?"تعديل النموذج":"أضف منتجًا أو نموذجًا"}</h2><p>الاسم العربي والصورة مطلوبان، أو اختر نموذجًا توضيحيًا.</p></div></div><form ref={formRef} onSubmit={save}>
        <label>اسم المنتج بالعربية *<input required maxLength={120} value={form.titleAr} onChange={e=>setForm({...form,titleAr:e.target.value})} placeholder="مثال: قلم تخرج بالاسم"/></label><label>الاسم بالعبرية<input maxLength={120} value={form.titleHe} onChange={e=>setForm({...form,titleHe:e.target.value})} placeholder="עט לסיום לימודים"/></label>
        <div className="form-row"><label>القسم<select value={form.category} onChange={e=>{const cat=categories.find(c=>c.id===e.target.value)!;setForm({...form,category:cat.id,mockup:cat.mockup});}}>{categories.map(cat=><option value={cat.id} key={cat.id}>{cat.ar}</option>)}</select></label>{form.category==="invitations" && <label>التصنيف<select value={form.weddingGroup} onChange={e=>setForm({...form,weddingGroup:e.target.value as ProductInput["weddingGroup"]})}>{groups.map(g=><option key={g.id} value={g.id}>{g.id==="all"?"عام / متعدد":g.ar}</option>)}</select></label>}</div>
        <label>الوصف بالعربية<textarea maxLength={2000} rows={3} value={form.descriptionAr} onChange={e=>setForm({...form,descriptionAr:e.target.value})}/></label><label>الوصف بالعبرية<textarea maxLength={2000} rows={2} value={form.descriptionHe} onChange={e=>setForm({...form,descriptionHe:e.target.value})}/></label>
        <label className="upload-field"><Upload size={21}/><strong>{uploading?"جاري رفع الصورة…":"اختر صورة من جهازك أو تلفونك"}</strong><small>JPG · PNG · WebP / حتى 3 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading||busy} onChange={e=>void upload(e.target.files?.[0])}/></label>
        <label>أو رابط صورة HTTPS مباشر<input dir="ltr" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="https://..."/></label>
        {form.image && <div className="admin-image-preview"><ProductArt key={form.image} item={{...form,id:"preview",updatedAt:""}}/><button type="button" className="quiet-button" onClick={()=>setForm({...form,image:""})}><X size={16}/>إزالة الصورة من النموذج</button></div>}
        <label className="checkbox-label"><input type="checkbox" checked={form.demo} onChange={e=>setForm({...form,demo:e.target.checked})}/>نموذج توضيحي (ليس صورة منتج حقيقية)</label><label className="checkbox-label"><input type="checkbox" checked={form.visible} onChange={e=>setForm({...form,visible:e.target.checked})}/>منشور ويظهر للزوار</label>
        <button className="admin-save" disabled={busy||uploading}>{editing?<Save size={18}/>:<Plus size={18}/>} {busy?"جاري الحفظ…":editing?"حفظ التعديل":"حفظ ونشر النموذج"}</button>{editing && <button type="button" className="quiet-button" onClick={()=>{setEditing(null);setForm(empty);}}>إلغاء التعديل</button>}
      </form></section>
      <section className="admin-panel"><div className="panel-title"><span className="item-count">{items.length}</span><div><h2>المعرض وكتالوج الأعراس</h2><p>تقدر تعدّل النماذج الأصلية، تخفيها أو تحذفها.</p></div></div><label className="admin-filter">عرض القسم<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">جميع الأقسام</option>{categories.map(cat=><option value={cat.id} key={cat.id}>{cat.ar}</option>)}</select></label><div className="admin-items">{items.filter(item=>filter==="all"||item.category===filter).map(item=><article key={item.id}><div className="admin-thumb"><ProductArt item={item}/></div><div><span>{categories.find(cat=>cat.id===item.category)?.ar} · {item.visible?"منشور":"مخفي"}</span><strong>{item.titleAr}</strong><p>{item.descriptionAr}</p></div><div className="row-actions"><button type="button" disabled={busy} onClick={()=>edit(item)} aria-label={`تعديل ${item.titleAr}`}><Pencil size={16}/></button><button type="button" disabled={busy} onClick={()=>void remove(item)} aria-label={`حذف ${item.titleAr}`}><Trash2 size={16}/></button></div></article>)}</div></section></div>
    </>}
    <p className="admin-note">كل زوار النسخة المنشورة يقرؤون نفس المعرض. البيانات المحلية أثناء التطوير مستقلة عن بيانات الموقع المنشور. النماذج بدون ترجمة عبرية تظهر باسمها العربي.</p>
  </main>;
}
