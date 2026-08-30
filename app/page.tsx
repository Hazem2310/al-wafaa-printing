"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ChevronLeft,
  Gift,
  Heart,
  MapPin,
  Menu,
  PenTool,
  Phone,
  Printer,
  School,
  Sparkles,
  X,
} from "lucide-react";

type Locale = "ar" | "he";

const content = {
  ar: {
    language: "עברית",
    languageLabel: "التبديل إلى العبرية",
    brand: "مطبعة الوفاء",
    brandSub: "בית דפוס אל-ופאא",
    nav: [
      { label: "الخدمات", href: "#services" },
      { label: "أعمالنا", href: "#gallery" },
      { label: "عن المطبعة", href: "#about" },
      { label: "تواصل", href: "#contact" },
    ],
    hero: {
      eyebrow: "نطبع الفكرة، ونصنع لها أثرًا",
      title: "كل مناسبة تستحق أن تُطبع بشكل لا يُنسى.",
      text: "تصميم، طباعة، وهدايا مميزة بتفاصيل راقية تترك انطباعًا من أول نظرة.",
      primary: "تواصل معنا الآن",
      secondary: "اكتشف أعمالنا",
      note: "تصميم وطباعة لكل مناسبة",
      featureOne: "تفاصيل فاخرة",
      featureTwo: "تنفيذ بحب",
    },
    services: {
      eyebrow: "مجالاتنا",
      title: "تصاميم تُشبه فكرتك",
      text: "من أول لمسة إلى آخر تفصيل، نصمّم ونطبع كل ما تحتاجه لمناسبتك أو مشروعك.",
      action: "اكتشف القسم",
      items: {
        school: { title: "تصاميم المدارس", description: "دفاتر، شهادات، ملصقات وكل ما يميّز طلابك." },
        gifts: { title: "تصاميم الهدايا", description: "هدايا شخصية مرتبة تُحفظ في الذاكرة." },
        pens: { title: "أقلام مخصصة", description: "أقلام مطبوعة بهوية مشروعك أو مناسبتك." },
        signs: { title: "تصاميم اللافتات", description: "لافتات واضحة وفخمة تخلي اسمك ظاهر." },
        weddings: { title: "تصاميم الأعراس", description: "تفاصيل ناعمة تليق بأجمل يوم." },
        invitations: { title: "كروت الأعراس", description: "دعوات فخمة تبقى ذكرى خاصة." },
      },
    },
    gallery: {
      eyebrow: "من الواقع",
      title: "كل تفصيل عندنا له حكاية",
      text: "لمسات من أعمال مطبعة الوفاء — من الفكرة إلى القطعة الجاهزة بين يديك.",
      labels: ["هوية وهدايا", "تفاصيل المطبعة", "طباعة بتوقيعك"],
    },
    about: {
      eyebrow: "لماذا الوفاء؟",
      title: "نحوّل فكرتك إلى قطعة تترك أثرًا.",
      text: "مطبعة الوفاء تجمع بين التصميم الدقيق، جودة الطباعة، والذوق في تنسيق الهدايا، حتى تحصل على نتيجة تفتخر بها.",
      points: ["تصميم خاص حسب فكرتك", "طباعة بجودة واهتمام بالتفاصيل", "هدايا مميزة بتنسيق أنيق"],
    },
    contact: {
      eyebrow: "لنبدأ فكرتك",
      title: "قولوا لنا المناسبة، والباقي علينا.",
      text: "زورونا في كفركنا، مقابل البريد، أو اتصلوا بنا مباشرة.",
      call: "اتصل الآن",
      location: "كفركنا – مقابل البريد",
      phoneLabel: "للتواصل",
    },
    footer: "مطبعة الوفاء — حيث تتحول الفكرة إلى أثر.",
    mobileCall: "اتصل الآن",
  },
  he: {
    language: "العربية",
    languageLabel: "מעבר לערבית",
    brand: "דפוס אל-ופאא",
    brandSub: "مطبعة الوفاء",
    nav: [
      { label: "שירותים", href: "#services" },
      { label: "עבודות", href: "#gallery" },
      { label: "אודות", href: "#about" },
      { label: "יצירת קשר", href: "#contact" },
    ],
    hero: {
      eyebrow: "מדפיסים רעיון, יוצרים לו נוכחות",
      title: "לכל אירוע מגיע עיצוב שאי אפשר לשכוח.",
      text: "עיצוב, הדפסה ומתנות אישיות עם פרטים מדויקים שעושים רושם מהרגע הראשון.",
      primary: "דברו איתנו עכשיו",
      secondary: "לגלריית העבודות",
      note: "עיצוב והדפסה לכל אירוע",
      featureOne: "פרטים יוקרתיים",
      featureTwo: "ביצוע באהבה",
    },
    services: {
      eyebrow: "התחומים שלנו",
      title: "עיצובים שנראים בדיוק כמו הרעיון שלך",
      text: "מהמגע הראשון ועד לפרט האחרון, אנחנו מעצבים ומדפיסים כל מה שצריך לאירוע או לעסק שלך.",
      action: "לגלות את התחום",
      items: {
        school: { title: "עיצובים לבתי ספר", description: "מחברות, תעודות, מדבקות וכל מה שמייחד את התלמידים." },
        gifts: { title: "מתנות מעוצבות", description: "מתנות אישיות ומסודרות שנשארות בזיכרון." },
        pens: { title: "עטים ממותגים", description: "עטים מודפסים עם המיתוג של העסק או האירוע שלך." },
        signs: { title: "עיצובי שילוט", description: "שלטים ברורים ויוקרתיים שמבליטים את השם שלך." },
        weddings: { title: "עיצובי חתונה", description: "פרטים עדינים שמתאימים ליום הכי יפה." },
        invitations: { title: "הזמנות לחתונה", description: "הזמנות יוקרתיות שנשארות כמזכרת." },
      },
    },
    gallery: {
      eyebrow: "מהשטח",
      title: "לכל פרט אצלנו יש סיפור",
      text: "נגיעות מעבודות דפוס אל-ופאא — מהרעיון ועד למוצר המוכן בידיים שלך.",
      labels: ["מיתוג ומתנות", "פרטים מבית הדפוס", "הדפסה עם חתימה שלך"],
    },
    about: {
      eyebrow: "למה אל-ופאא?",
      title: "הופכים את הרעיון שלך לפריט שמשאיר חותם.",
      text: "דפוס אל-ופאא משלב עיצוב מדויק, איכות הדפסה וטעם טוב באריזת מתנות, כדי שתקבלו תוצאה שאפשר להתגאות בה.",
      points: ["עיצוב אישי לפי הרעיון שלך", "הדפסה איכותית ותשומת לב לפרטים", "מתנות מיוחדות באריזה אלגנטית"],
    },
    contact: {
      eyebrow: "בואו נתחיל רעיון",
      title: "ספרו לנו על האירוע, ואנחנו נדאג לשאר.",
      text: "בקרו אותנו בכפר כנא, מול הדואר, או התקשרו אלינו ישירות.",
      call: "התקשרו עכשיו",
      location: "כפר כנא – מול הדואר",
      phoneLabel: "ליצירת קשר",
    },
    footer: "דפוס אל-ופאא — הרעיון שלכם, חותם שנשאר.",
    mobileCall: "התקשרו עכשיו",
  },
} as const;

const serviceIcons = [School, Gift, PenTool, Printer, Heart, Sparkles];

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ar");
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = content[locale];
  const services = [
    { ...copy.services.items.school, icon: serviceIcons[0], image: "/images/category-school-3d.png", className: "school-card" },
    { ...copy.services.items.gifts, icon: serviceIcons[1], image: "/images/category-gifts-3d.png", className: "gifts-card" },
    { ...copy.services.items.pens, icon: serviceIcons[2], image: "/images/category-gifts-3d.png", className: "pens-card" },
    { ...copy.services.items.signs, icon: serviceIcons[3], image: "/images/al-wafaa-studio.jpeg", className: "signs-card" },
    { ...copy.services.items.weddings, icon: serviceIcons[4], image: "/images/category-wedding-3d.png", className: "weddings-card" },
    { ...copy.services.items.invitations, icon: serviceIcons[5], image: "/images/category-wedding-3d.png", className: "invitations-card" },
  ];

  const toggleLocale = () => setLocale((current) => (current === "ar" ? "he" : "ar"));
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="site-shell" dir="rtl" lang={locale === "ar" ? "ar" : "he"}>
      <div className="grain" aria-hidden="true" />

      <header className="site-header">
        <a href="#top" className="brand-lockup" aria-label={copy.brand}>
          <span className="brand-logo">
            <img src="/images/al-wafaa-logo-source.jpeg" alt="شعار مطبعة الوفاء" />
          </span>
          <span className="brand-copy">
            <strong>{copy.brand}</strong>
            <small>{copy.brandSub}</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label={locale === "ar" ? "التنقل الرئيسي" : "ניווט ראשי"}>
          {copy.nav.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="language-switch" type="button" onClick={toggleLocale} aria-label={copy.languageLabel}>
            <span className="language-dot" />
            {copy.language}
          </button>
          <a className="header-phone" href="tel:+972526269162">
            <Phone size={15} />
            <span>052-6269162</span>
          </a>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? (locale === "ar" ? "إغلاق القائمة" : "סגירת התפריט") : locale === "ar" ? "فتح القائمة" : "פתיחת התפריט"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      <div className={"mobile-menu" + (menuOpen ? " is-open" : "")}>
        {copy.nav.map((item) => (
          <a key={item.href} href={item.href} onClick={closeMenu}>
            {item.label}
            <ChevronLeft size={17} />
          </a>
        ))}
        <a className="mobile-menu-call" href="tel:+972526269162" onClick={closeMenu}>
          <Phone size={17} />
          052-6269162
        </a>
      </div>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={15} />
            <span>{copy.hero.eyebrow}</span>
          </div>
          <h1>{copy.hero.title}</h1>
          <p>{copy.hero.text}</p>
          <div className="hero-actions">
            <a href="tel:+972526269162" className="button button-gold"><Phone size={17} />{copy.hero.primary}</a>
            <a href="#gallery" className="button button-ghost"><ArrowDownLeft size={18} />{copy.hero.secondary}</a>
          </div>
          <div className="hero-signature">
            <span className="signature-line" />
            <span>{copy.hero.note}</span>
          </div>
        </div>

        <div className="hero-art" aria-label={copy.hero.note}>
          <div className="gold-orb gold-orb-one" aria-hidden="true" />
          <div className="gold-orb gold-orb-two" aria-hidden="true" />
          <div className="hero-art-card">
            <div className="hero-photo-wrap">
              <img src="/images/al-wafaa-poster.jpeg" alt="أعمال مطبعة الوفاء" />
              <div className="hero-photo-shine" />
            </div>
            <div className="hero-photo-caption"><span className="caption-mark">W</span><span>{copy.hero.note}</span></div>
          </div>
          <div className="floating-note floating-note-top"><span className="mini-icon"><Sparkles size={15} /></span><span>{copy.hero.featureOne}</span></div>
          <div className="floating-note floating-note-bottom"><span className="mini-icon"><Heart size={15} /></span><span>{copy.hero.featureTwo}</span></div>
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{copy.services.eyebrow}</span>
            <h2>{copy.services.title}</h2>
          </div>
          <p>{copy.services.text}</p>
        </div>
        <div className="services-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className={"service-card " + service.className} key={service.title}>
                <img src={service.image} alt="" aria-hidden="true" />
                <div className="service-overlay" />
                <div className="service-icon"><Icon size={19} strokeWidth={1.8} /></div>
                <div className="service-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <a href="#contact">{copy.services.action}<ChevronLeft size={17} /></a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="gallery-section" id="gallery">
        <div className="gallery-intro">
          <span className="section-kicker">{copy.gallery.eyebrow}</span>
          <h2>{copy.gallery.title}</h2>
          <p>{copy.gallery.text}</p>
          <div className="gallery-scroll-cue"><span /><span /><span /></div>
        </div>
        <div className="gallery-stack">
          {[
            { image: "/images/al-wafaa-poster.jpeg", label: copy.gallery.labels[0], className: "gallery-main" },
            { image: "/images/al-wafaa-studio.jpeg", label: copy.gallery.labels[1], className: "gallery-tall" },
            { image: "/images/al-wafaa-logo-source.jpeg", label: copy.gallery.labels[2], className: "gallery-logo" },
          ].map((item) => (
            <figure className={"gallery-card " + item.className} key={item.image}>
              <img src={item.image} alt={item.label} />
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-badge">
          <div className="badge-ring"><span>W</span></div>
          <span>{copy.brand}</span>
        </div>
        <div className="about-copy">
          <span className="section-kicker">{copy.about.eyebrow}</span>
          <h2>{copy.about.title}</h2>
          <p>{copy.about.text}</p>
        </div>
        <ul className="about-list">
          {copy.about.points.map((point, index) => (
            <li key={point}><span>0{index + 1}</span><p>{point}</p></li>
          ))}
        </ul>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-glow" aria-hidden="true" />
        <div className="contact-content">
          <span className="section-kicker">{copy.contact.eyebrow}</span>
          <h2>{copy.contact.title}</h2>
          <p>{copy.contact.text}</p>
          <a href="tel:+972526269162" className="button button-light"><Phone size={18} />{copy.contact.call}</a>
        </div>
        <div className="contact-details">
          <a href="tel:+972526269162" className="contact-detail">
            <span className="contact-detail-icon"><Phone size={19} /></span>
            <span><small>{copy.contact.phoneLabel}</small><strong dir="ltr">052-6269162</strong></span>
          </a>
          <div className="contact-detail">
            <span className="contact-detail-icon"><MapPin size={19} /></span>
            <span><small>{locale === "ar" ? "موقعنا" : "המיקום שלנו"}</small><strong>{copy.contact.location}</strong></span>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <a href="#top" className="footer-brand"><span className="footer-brand-mark">W</span><span>{copy.brand}</span></a>
        <span>{copy.footer}</span>
        <a href="tel:+972526269162" dir="ltr">052-6269162</a>
      </footer>

      <a className="mobile-call-bar" href="tel:+972526269162"><Phone size={18} />{copy.mobileCall}</a>
    </main>
  );
}
