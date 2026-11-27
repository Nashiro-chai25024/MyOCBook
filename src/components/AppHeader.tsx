/**
 * 全ページ共通のヘッダーコンポーネント。
 * 左側にホームへのリンク（MyOCBook）と戻るボタン（家アイコン付き）、
 * 右側に画面タイトルとメニューボタン（≡）を表示します。
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface AppHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
}

const NAV_ITEMS = [
  { label: "ホーム画面", href: "/" },
  { label: "世界一覧", href: "/worlds" },
  { label: "キャラ一覧", href: "/characters" },
  { label: "辞書モード", href: "/dictionary" },
] as const;

export default function AppHeader({
  title,
  backHref,
  backLabel,
}: AppHeaderProps) {
  const isHomeBack = backHref === "/";
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-foreground transition hover:opacity-75"
            >
              MyOCBook
            </Link>
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-2.5 py-1 text-xs text-foreground-muted transition hover:bg-surface-muted hover:text-foreground"
              >
                {isHomeBack && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
                  </svg>
                )}
                <span>{backLabel ?? "戻る"}</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-foreground sm:text-base">
              {title}
            </h1>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="メニューを開く"
              className="rounded-lg border border-border-subtle p-1.5 text-foreground transition hover:bg-surface-muted"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* スライドメニュー */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-label="メニュー"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMenuOpen(false);
          }}
        >
          <nav className="flex h-full w-64 flex-col border-l border-border-subtle bg-surface p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between border-b border-border-subtle pb-3">
              <span className="text-sm font-bold text-foreground">メニュー</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="メニューを閉じる"
                className="rounded-lg px-2 py-1 text-sm text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 border-t border-border-subtle pt-4">
              <p className="mb-2 px-3 text-[11px] font-semibold text-foreground-muted">
                管理・設定
              </p>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
              >
                設定
              </Link>
              <Link
                href="/manage/delete"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/10"
              >
                データの削除
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
