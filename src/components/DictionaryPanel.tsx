/**
 * 辞書表示・検索・絞り込み用の共通パネルコンポーネント。
 * 単独の辞書ページ（/dictionary/[category]）と、キャラ編集中の2分割パネルの両方で利用します。
 */
"use client";

import { useMemo, useState } from "react";
import {
  DICTIONARY_CONFIG,
  type CategoryKey,
  type DictionaryRow,
} from "@/data/dictionaries";
import {
  buildBirthFlowerSearchUrl,
  buildHanakomonSearchUrl,
  buildKeywordSearchUrl,
} from "@/lib/externalSearch";

interface DictionaryPanelProps {
  /** 初期表示または固定表示するカテゴリ */
  category: CategoryKey;
  /** 2分割パネル内でカテゴリタブ切り替えを許可するか */
  allowCategorySwitch?: boolean;
  /** カテゴリ変更時コールバック */
  onCategoryChange?: (next: CategoryKey) => void;
  /** 色選択時にカラーコードを返すコールバック（編集中連携用） */
  onSelectColor?: (hex: string, colorName: string) => void;
  /** モチーフテキストを返すコールバック（編集中連携用） */
  onSelectMotif?: (text: string) => void;
  /** 2分割パネル向けのコンパクト表示 */
  compact?: boolean;
}

const CATEGORY_TABS: { key: CategoryKey; label: string }[] = [
  { key: "flower", label: "花" },
  { key: "stone", label: "石" },
  { key: "constellation", label: "星" },
  { key: "color", label: "色" },
  { key: "idea", label: "アイデア" },
];

export default function DictionaryPanel({
  category,
  allowCategorySwitch = false,
  onCategoryChange,
  onSelectColor,
  onSelectMotif,
  compact = false,
}: DictionaryPanelProps) {
  const [query, setQuery] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [searchMonth, setSearchMonth] = useState<string>("");
  const [searchDay, setSearchDay] = useState<string>("");

  const config = DICTIONARY_CONFIG[category];
  const filters = config.filters ?? [];

  const handleCategorySelect = (next: CategoryKey) => {
    setSelectedGroup("all");
    setQuery("");
    onCategoryChange?.(next);
  };

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return config.rows.filter((row) => {
      if (selectedGroup !== "all" && row.group !== selectedGroup) {
        return false;
      }
      if (!q) return true;
      return (
        row.col1.toLowerCase().includes(q) ||
        row.col2.toLowerCase().includes(q) ||
        row.col3.toLowerCase().includes(q)
      );
    });
  }, [config.rows, query, selectedGroup]);

  const handleRowAction = (row: DictionaryRow) => {
    if (category === "color" && onSelectColor && row.colorHex) {
      onSelectColor(row.colorHex, row.col1);
      return;
    }
    if (onSelectMotif) {
      onSelectMotif(row.col1);
    }
  };

  const hasInteractiveAction =
    (category === "color" && Boolean(onSelectColor)) || Boolean(onSelectMotif);

  return (
    <div className="space-y-3">
      {hasInteractiveAction && (
        <p className="text-[11px] text-foreground-muted">
          行をタップすると編集中のキャラクターへ反映されます
        </p>
      )}
      {/* カテゴリ切替タブ（2分割パネル時） */}
      {allowCategorySwitch && (
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleCategorySelect(tab.key)}
              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                category === tab.key
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border-subtle bg-surface text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 🔍 検索バー ＋ 外部検索リンク */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex w-full items-center gap-2 rounded-full border border-border-subtle bg-surface px-3.5 py-1.5 shadow-xs sm:max-w-xs">
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
              href={buildKeywordSearchUrl(
                query,
                config.title.replace("辞書 - ", "")
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-surface-muted"
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

      {/* グループ絞り込みタグ（星・色など） */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedGroup("all")}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
              selectedGroup === "all"
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border-subtle bg-surface text-foreground-muted hover:text-foreground"
            }`}
          >
            すべて
          </button>
          {filters.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setSelectedGroup(group)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                selectedGroup === group
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border-subtle bg-surface text-foreground-muted hover:text-foreground"
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      )}

      {/* 花カテゴリ用：日付からの誕生花・花個紋 外部検索バー */}
      {category === "flower" && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border-subtle bg-surface px-3.5 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
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
              className="w-9 border-b border-border-subtle bg-transparent py-0.5 text-center text-sm text-foreground outline-none focus:border-foreground"
            />
            <span className="text-foreground-muted">月</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              aria-label="日"
              value={searchDay}
              onChange={(e) => setSearchDay(e.target.value)}
              className="w-9 border-b border-border-subtle bg-transparent py-0.5 text-center text-sm text-foreground outline-none focus:border-foreground"
            />
            <span className="text-foreground-muted">日</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <a
              href={buildBirthFlowerSearchUrl(searchMonth, searchDay)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-muted/60 px-2.5 py-1 font-medium text-foreground transition hover:bg-surface-muted"
            >
              <span>誕生花を検索</span>
              <span aria-hidden="true">↗</span>
            </a>
            <a
              href={buildHanakomonSearchUrl(searchMonth, searchDay)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-muted/60 px-2.5 py-1 font-medium text-foreground transition hover:bg-surface-muted"
            >
              <span>花個紋を検索</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      )}

      {/* 広い表エリア */}
      <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-muted font-bold text-foreground">
              <th
                className={`border-r border-border-subtle ${
                  compact ? "px-2.5 py-2" : "w-1/3 px-3 py-3 sm:px-5"
                }`}
              >
                {config.headers[0]}
              </th>
              <th
                className={`border-r border-border-subtle ${
                  compact ? "px-2.5 py-2" : "w-1/4 px-3 py-3 sm:px-5"
                }`}
              >
                {config.headers[1]}
              </th>
              <th className={compact ? "px-2.5 py-2" : "px-3 py-3 sm:px-5"}>
                {config.headers[2]}
              </th>
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
                  onClick={
                    hasInteractiveAction ? () => handleRowAction(row) : undefined
                  }
                  className={`border-b border-border-subtle last:border-b-0 ${
                    hasInteractiveAction
                      ? "cursor-pointer transition hover:bg-surface-muted/70"
                      : "hover:bg-surface-muted/40"
                  }`}
                >
                  <td
                    className={`border-r border-border-subtle font-medium text-foreground ${
                      compact ? "px-2.5 py-2" : "px-3 py-3 sm:px-5"
                    }`}
                  >
                    {row.col1}
                  </td>
                  <td
                    className={`border-r border-border-subtle text-foreground-muted ${
                      compact ? "px-2.5 py-2" : "px-3 py-3 sm:px-5"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {row.colorHex && (
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
                          style={{ backgroundColor: row.colorHex }}
                        />
                      )}
                      <span className="font-mono text-xs">{row.col2}</span>
                    </span>
                  </td>
                  <td
                    className={`text-foreground ${
                      compact ? "px-2.5 py-2" : "px-3 py-3 sm:px-5"
                    }`}
                  >
                    {row.col3}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
