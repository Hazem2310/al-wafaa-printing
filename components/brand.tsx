import { LOGO } from "@/lib/catalog";
export function Brand({ text = true }: { text?: boolean }) {
  return <span className="brand-lockup"><span className="logo-crop"><img src={LOGO} alt="شعار مطبعة الوفاء" /></span>{text && <span className="brand-copy"><strong>مطبعة الوفاء</strong><small>דפוס אל-ופאא</small></span>}</span>;
}
