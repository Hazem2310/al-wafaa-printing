import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مطبعة الوفاء | דפוס אל-ופאא",
  description: "تصميم وطباعة وهدايا مميزة في كفركنا | עיצוב, הדפסה ומתנות בכפר כנא.",
  icons: {
    icon: "/images/al-wafaa-logo.jpeg",
    shortcut: "/images/al-wafaa-logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
