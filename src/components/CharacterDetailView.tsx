/**
 * キャラクター（OC）の閲覧専用ビューコンポーネント。
 * ノート風の横罫線レイアウトで設定を表示し、右下の編集ボタンから編集モードへ切り替えます。
 */
"use client";

import type { CharacterCard, WorldCard } from "@/types/setting";

interface CharacterDetailViewProps {
  character: CharacterCard;
  world: WorldCard | null;
  onEdit: () => void;
}

export default function CharacterDetailView({
  character,
  world,
  onEdit,
}: CharacterDetailViewProps) {
  return (
    <>
      <article className="mx-auto max-w-3xl rounded-xl border border-border-subtle bg-surface shadow-sm">
        {/* 名前・ふりがな */}
        <div className="border-b border-border-subtle px-4 py-4 sm:px-6">
          <span className="mb-1 block text-xs font-semibold text-foreground-muted">
            名前
          </span>
          {character.nameKana && (
            <p className="text-xs text-foreground-muted">{character.nameKana}</p>
          )}
          <h2 className="text-lg font-bold text-foreground">
            {character.name}
          </h2>
        </div>

        {/* 所属世界 */}
        <div className="border-b border-border-subtle px-4 py-3.5 sm:px-6">
          <span className="mb-1 block text-xs font-semibold text-foreground-muted">
            所属世界
          </span>
          <p className="text-sm text-foreground">
            {world ? world.name : "未設定"}
          </p>
        </div>

        {/* 誕生日 ｜ 年齢 ｜ 性別 */}
        <div className="grid grid-cols-1 border-b border-border-subtle sm:grid-cols-3">
          <div className="border-b border-border-subtle px-4 py-3.5 sm:border-r sm:border-b-0 sm:px-6">
            <span className="mb-1 block text-xs font-semibold text-foreground-muted">
              誕生日
            </span>
            <p className="text-sm text-foreground">
              {character.birthday || "—"}
            </p>
          </div>
          <div className="border-b border-border-subtle px-4 py-3.5 sm:border-r sm:border-b-0 sm:px-6">
            <span className="mb-1 block text-xs font-semibold text-foreground-muted">
              年齢
            </span>
            <p className="text-sm text-foreground">
              {character.age || "—"}
            </p>
          </div>
          <div className="px-4 py-3.5 sm:px-6">
            <span className="mb-1 block text-xs font-semibold text-foreground-muted">
              性別
            </span>
            <p className="text-sm text-foreground">{character.gender || "—"}</p>
          </div>
        </div>

        {/* モチーフ・カラー */}
        <div className="border-b border-border-subtle px-4 py-3.5 last:border-b-0 sm:px-6">
          <span className="mb-1 block text-xs font-semibold text-foreground-muted">
            モチーフ
          </span>
          {character.motif && (
            <p className="mb-3 text-sm text-foreground">{character.motif}</p>
          )}

          <div className="grid gap-3 rounded-lg bg-surface-muted/60 p-3 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-foreground-muted">
                メインカラー
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {character.mainColors.map((color, index) => (
                  <div key={`main-${index}`} className="flex items-center gap-1.5">
                    <span
                      className="h-6 w-6 rounded-md border border-black/15 shadow-xs"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-mono text-xs uppercase text-foreground-muted">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-foreground-muted">
                サブカラー
              </span>
              {character.subColors.length === 0 ? (
                <span className="text-xs text-foreground-muted">未設定</span>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  {character.subColors.map((color, index) => (
                    <div
                      key={`sub-${index}`}
                      className="flex items-center gap-1.5"
                    >
                      <span
                        className="h-6 w-6 rounded-md border border-black/15 shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-mono text-xs uppercase text-foreground-muted">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 追加された設定項目 */}
        {character.customFields.map((field) => (
          <div
            key={field.id}
            className="border-b border-border-subtle px-4 py-3.5 last:border-b-0 sm:px-6"
          >
            <span className="mb-1 block text-xs font-semibold text-foreground-muted">
              {field.label || "設定"}
            </span>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {field.value || "—"}
            </p>
          </div>
        ))}
      </article>

      {/* 右下フローティング 編集ボタン */}
      <button
        type="button"
        onClick={onEdit}
        aria-label="編集モードへ切り替え"
        className="fixed right-5 bottom-5 z-40 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg transition hover:scale-105 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        <span>編集</span>
      </button>
    </>
  );
}
