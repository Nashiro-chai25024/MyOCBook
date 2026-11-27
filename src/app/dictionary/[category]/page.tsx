/**
 * カテゴリ別の辞書ページ（辞書 - 花 / 石 / 星 / 色 / アイデア）。
 * 検索バーと広い表（テーブル）形式に加えて、諸説ある情報を外部検索できるリンクを備えます。
 */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { DICTIONARY_CONFIG, isCategoryKey, type CategoryKey } from "@/data/dictionaries";
import {
  buildBirthFlowerSearchUrl,
  buildHanakomonSearchUrl,
  buildKeywordSearchUrl,
} from "@/lib/externalSearch";

export default function DictionaryCategoryPage() {
  const params = useParams<{ category: string }>();
  const [query, setQuery] = useState<string>("");
  const [searchMonth, setSearchMonth] = useState<string>("");
  const [searchDay, setSearchDay] = useState<string>("");

  const categoryKey: CategoryKey | null = isCategoryKey(params.category)
    ? params.category
    : null;
  const config = categoryKey ? DICTIONARY_CONFIG[categoryKey] : null;

  const filteredRows = useMemo(() => {
    if (!config) return [];
    const q = query.trim().toLowerCase();
    if (!q) return config.rows;
    return config.rows.filter(
      (row) =>
        row.col1.toLowerCase().includes(q) ||
        row.col2.toLowerCase().includes(q) ||
        row.col3.toLowerCase().includes(q)
    );
  }, [config, query]);

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

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:px-6">
        {/* 🔍 検索バー ＋ 外部検索リンク */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2 shadow-xs sm:max-w-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-foreground-muted"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="検索"
              placeholder="検索"
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {query.trim() && (
              <a
                href={buildKeywordSearchUrl(query, config.title.replace("辞書 - ", ""))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted"
              >
                <span>「{query.trim()}」を外部検索</span>
                <span aria-hidden="true">↗</span>
              </a>
            )}
            <span className="text-xs text-foreground-muted">
              {filteredRows.length} 件
            </span>
          </div>
        </div>

        {/* 花カテゴリ用：日付からの誕生花・花個紋 外部検索バー */}
        {categoryKey === "flower" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground-muted">
                日付から外部で調べる：
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                aria-label="月"
                value={searchMonth}
                onChange={(e) => setSearchMonth(e.target.value)}
                className="w-10 border-b border-border-subtle bg-transparent py-0.5 text-center text-sm text-foreground outline-none focus:border-foreground"
              />
              <span className="text-foreground-muted">月</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                aria-label="日"
                value={searchDay}
                onChange={(e) => setSearchDay(e.target.value)}
                className="w-10 border-b border-border-subtle bg-transparent py-0.5 text-center text-sm text-foreground outline-none focus:border-foreground"
              />
              <span className="text-foreground-muted">日</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={buildBirthFlowerSearchUrl(searchMonth, searchDay)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-muted/60 px-3 py-1.5 font-medium text-foreground transition hover:bg-surface-muted"
              >
                <span>誕生花を検索</span>
                <span aria-hidden="true">↗</span>
              </a>
              <a
                href={buildHanakomonSearchUrl(searchMonth, searchDay)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-muted/60 px-3 py-1.5 font-medium text-foreground transition hover:bg-surface-muted"
              >
                <span>花個紋を検索</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        )}

        {/* 広い表エリア */}
        <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-muted text-xs font-bold text-foreground sm:text-sm">
                <th className="w-1/3 border-r border-border-subtle px-3 py-3 sm:px-5">
                  {config.headers[0]}
                </th>
                <th className="w-1/4 border-r border-border-subtle px-3 py-3 sm:px-5">
                  {config.headers[1]}
                </th>
                <th className="px-3 py-3 sm:px-5">{config.headers[2]}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-xs text-foreground-muted"
                  >
                    該当する項目がありません
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr
                    key={`${row.col1}-${index}`}
                    className="border-b border-border-subtle last:border-b-0 hover:bg-surface-muted/40"
                  >
                    <td className="border-r border-border-subtle px-3 py-3 font-medium text-foreground sm:px-5">
                      {row.col1}
                    </td>
                    <td className="border-r border-border-subtle px-3 py-3 text-foreground-muted sm:px-5">
                      <span className="inline-flex items-center gap-2">
                        {row.colorHex && (
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
                            style={{ backgroundColor: row.colorHex }}
                          />
                        )}
                        <span>{row.col2}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-foreground sm:px-5">
                      {row.col3}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
