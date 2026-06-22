import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TheCnia - คัดสรรสเปกคอมพิวเตอร์และอุปกรณ์ไอที",
  description: "บริการแนะนำการจัดสเปกคอมพิวเตอร์ ตามงบประมาณ อัปเดตราคาล่าสุด พร้อมแหล่งซื้ออุปกรณ์",
  // ✅ ใส่ Google Verification ไว้ตรงนี้ครับ
  verification: {
    google: "L8Wq7ylhGygHqz6Yw8JVLMtENLbFRsckin_dUN03JKo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th" // เปลี่ยนเป็น th เพื่อรองรับภาษาไทย
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}