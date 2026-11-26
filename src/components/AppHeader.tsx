/**
 * 全ページ共通のヘッダーコンポーネント。
 * 左側にホームへのリンク（MyOCBook）と戻るボタン（家アイコン付き）、右側に画面タイトルを表示します。
 */
import Link from "next/link";

interface AppHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
}

export default function AppHeader({
  title,
  backHref,
  backLabel,
}: AppHeaderProps) {
  const isHomeBack = backHref === "/";

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
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
        <h1 className="text-sm font-semibold text-foreground sm:text-base">
          {title}
        </h1>
      </div>
    </header>
  );
}
