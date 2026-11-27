/**
 * カテゴリ別の辞書ページ（辞書 - 花 / 石 / 星 / 色 / アイデア）。
 * 共通の DictionaryPanel を画面いっぱいに表示します。
 */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import DictionaryPanel from "@/components/DictionaryPanel";
import {
  DICTIONARY_CONFIG,
  isCategoryKey,
  type CategoryKey,
} from "@/data/dictionaries";

export default function DictionaryCategoryPage() {
  const params = useParams<{ category: string }>();

  const categoryKey: CategoryKey | null = isCategoryKey(params.category)
    ? params.category
    : null;
  const config = categoryKey ? DICTIONARY_CONFIG[categoryKey] : null;

  if (!config || !categoryKey) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader title="辞書モード" backHref="/dictionary" backLabel="辞書一覧" />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center">
            <p className="mb-4 text-sm text-foreground-muted">
              指定された辞書が見つかりませんでした
            </p>
            <Link
              href="/dictionary"
              className="inline-block rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground"
            >
              辞書一覧へ戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        title={config.title}
        backHref="/dictionary"
        backLabel="辞書一覧"
      />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <DictionaryPanel category={categoryKey} />
      </main>
    </div>
  );
}
