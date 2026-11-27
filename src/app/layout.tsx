/**
 * アプリ全体のルートレイアウト。
 * 日本語設定・メタデータ・目に優しいベース配色を適用します。
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeSync from "@/components/ThemeSync";
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
  title: "MyOCBook",
  description: "一次創作の発想の引き出しを増やし、設定をコンパクトに記録・整理できる設定帳アプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
