/**
 * カテゴリ別の辞書ページ（辞書 - 花 / 石 / 星 / アイデア）。
 * 上部の検索バーと、参照エリアを広く取った表（テーブル）形式で表示します。
 */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";

type CategoryKey = "flower" | "stone" | "constellation" | "color" | "idea";

interface DictionaryRow {
  col1: string;
  col2: string;
  col3: string;
  colorHex?: string;
}

interface CategoryConfig {
  title: string;
  headers: [string, string, string];
  rows: DictionaryRow[];
}

const DICTIONARY_CONFIG: Record<CategoryKey, CategoryConfig> = {
  flower: {
    title: "辞書 - 花",
    headers: ["花の名前", "色", "花言葉"],
    rows: [
      { col1: "スノードロップ", col2: "白", col3: "希望 / 慰め", colorHex: "#f5f5f5" },
      { col1: "サクラ", col2: "淡紅", col3: "精神美 / 優美な女性", colorHex: "#f4c2c2" },
      { col1: "アネモネ", col2: "赤・紫・白", col3: "はかない恋 / 期待", colorHex: "#c94a5a" },
      { col1: "ヒマワリ", col2: "黄", col3: "憧れ / 情熱", colorHex: "#e6b422" },
      { col1: "リンドウ", col2: "青紫", col3: "勝利 / 正義", colorHex: "#3e5199" },
      { col1: "ツバキ", col2: "赤・白", col3: "控えめな優しさ / 誇り", colorHex: "#b7282e" },
    ],
  },
  stone: {
    title: "辞書 - 石",
    headers: ["石の名前", "月", "意味"],
    rows: [
      { col1: "ガーネット", col2: "1月", col3: "真実 / 友愛 / 忠実", colorHex: "#7b1c26" },
      { col1: "アメジスト", col2: "2月", col3: "誠実 / 心の平和", colorHex: "#7a4988" },
      { col1: "アクアマリン", col2: "3月", col3: "沈着 / 勇敢 / 聡明", colorHex: "#7ec8e3" },
      { col1: "ダイヤモンド", col2: "4月", col3: "清浄無垢 / 永遠の絆", colorHex: "#e8ecef" },
      { col1: "エメラルド", col2: "5月", col3: "幸運 / 幸福 / 希望", colorHex: "#2e8b57" },
      { col1: "サファイア", col2: "9月", col3: "慈愛 / 誠実 / 徳望", colorHex: "#1d4e89" },
    ],
  },
  constellation: {
    title: "辞書 - 星",
    headers: ["星座・星", "時期", "キーワード"],
    rows: [
      { col1: "おひつじ座", col2: "3/21 - 4/19", col3: "開拓 / 行動力 / 直感" },
      { col1: "おうし座", col2: "4/20 - 5/20", col3: "安定 / 感覚 / 忍耐" },
      { col1: "ふたご座", col2: "5/21 - 6/21", col3: "知性 / 二面性 / 好奇心" },
      { col1: "さそり座", col2: "10/24 - 11/22", col3: "探求 / 情念 / 集中" },
      { col1: "シリウス", col2: "冬", col3: "おおいぬ座 / 全天で最も明るい恒星" },
      { col1: "ベガ", col2: "夏", col3: "こと座 / 織姫星" },
    ],
  },
  color: {
    title: "辞書 - 色",
    headers: ["色の名前", "コード", "イメージ・分類"],
    rows: [
      { col1: "浅葱色（あさぎいろ）", col2: "#00a3af", col3: "和名 / 澄んだ青緑", colorHex: "#00a3af" },
      { col1: "緋色（ひいろ）", col2: "#d3381c", col3: "和名 / 鮮やかな赤", colorHex: "#d3381c" },
      { col1: "藤色（ふじいろ）", col2: "#bbbcde", col3: "和名 / 淡い青紫", colorHex: "#bbbcde" },
      { col1: "Cerulean / セルリアン", col2: "#007ba7", col3: "英名 / 深い空色", colorHex: "#007ba7" },
      { col1: "Crimson / クリムゾン", col2: "#dc143c", col3: "英名 / 深紅", colorHex: "#dc143c" },
    ],
  },
  idea: {
    title: "辞書 - アイデア",
    headers: ["分類", "名称・数字", "読み・意味"],
    rows: [
      { col1: "ラテン語（数）", col2: "1 / 2 / 3", col3: "unus / duo / tres" },
      { col1: "ドイツ語（数）", col2: "1 / 2 / 3", col3: "eins / zwei / drei" },
      { col1: "フランス語（数）", col2: "1 / 2 / 3", col3: "un / deux / trois" },
      { col1: "古語（数）", col2: "1 / 2 / 3", col3: "ひと / ふた / み" },
    ],
  },
};

function isCategoryKey(value: string): value is CategoryKey {
  return (
    value === "flower" ||
    value === "stone" ||
    value === "constellation" ||
    value === "color" ||
    value === "idea"
  );
}

export default function DictionaryCategoryPage() {
  const params = useParams<{ category: string }>();
  const [query, setQuery] = useState<string>("");

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

  if (!config) {
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
        {/* 🔍 検索バー */}
        <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2 shadow-xs sm:max-w-sm">
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
                            className="h-3 w-3 shrink-0 rounded-full border border-black/15"
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
