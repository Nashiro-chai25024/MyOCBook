/**
 * 辞書モードのトップ画面。
 * 各辞書（花・石・星・アイデア）へのカードと、今後の追加予定枠を表示します。
 */
import Link from "next/link";
import AppHeader from "@/components/AppHeader";

const DICTIONARY_ITEMS = [
  { id: "flower", label: "花", href: "/dictionary/flower" },
  { id: "stone", label: "石", href: "/dictionary/stone" },
  { id: "constellation", label: "星", href: "/dictionary/constellation" },
  { id: "color", label: "色", href: "/dictionary/color" },
  { id: "idea", label: "アイデア", href: "/dictionary/idea" },
] as const;

export default function DictionaryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader title="辞書モード" backHref="/" backLabel="ホーム" />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {DICTIONARY_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex aspect-square items-center justify-center rounded-2xl border border-border-subtle bg-surface p-4 text-center text-lg font-bold text-foreground shadow-xs transition hover:border-foreground/50 hover:bg-surface-muted"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border-subtle bg-surface/60">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full text-border-subtle"
              aria-hidden="true"
            >
              <line
                x1="10"
                y1="10"
                x2="90"
                y2="90"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <span className="text-sm font-medium tracking-wide text-foreground-muted">
            coming soon...
          </span>
        </div>
      </main>
    </div>
  );
}
