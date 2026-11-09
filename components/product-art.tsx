"use client";
import { useState } from "react";
import { LOGO, type Product } from "@/lib/catalog";

export function ProductArt({ item, large = false }: { item: Product; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (item.image && !failed) return <img className={`product-photo${large ? " large" : ""}`} src={item.image} alt={item.titleAr} loading="lazy" onError={() => setFailed(true)} />;
  if (item.image && failed) return <div className="image-error">تعذر تحميل الصورة / לא ניתן לטעון את התמונה</div>;
  return <div className={`product-art art-${item.mockup} variant-${item.id.charCodeAt(item.id.length - 1) % 3}`} aria-label="نموذج توضيحي للتصميم">
    <div className="art-grid" />
    {item.mockup === "pen" ? <div className="pen-set">{[0,1,2].map(n => <div className={`pen pen-${n}`} key={n}><i/><span>{n === 1 ? "الوفاء" : "YOUR NAME"}</span><b/></div>)}</div> :
      item.mockup === "gift" ? <div className="gift-box"><div className="gift-lid"/><div className="ribbon vertical"/><div className="ribbon horizontal"/><span className="gift-seal"><img src={LOGO} alt=""/></span></div> :
      item.mockup === "notebook" ? <div className="notebook"><div className="spiral"/><span>كل فكرة<br/>تبدأ هنا.</span><img src={LOGO} alt=""/></div> :
      item.mockup === "sign" ? <div className="demo-sign"><img src={LOGO} alt=""/><strong>مطبعة الوفاء</strong><span>تصميم · طباعة · إهداء</span></div> :
      <div className="demo-invitation"><span>WITH LOVE</span><strong>أهلاً بكم<br/>في حكايتنا</strong><i/><small>تفاصيل على ذوقكم</small></div>}
    <span className="mockup-caption">تصوّر توضيحي · DEMO</span>
  </div>;
}
