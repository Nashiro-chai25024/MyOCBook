/**
 * 世界観の閲覧専用ビューコンポーネント。
 * ノート風の横罫線レイアウトで世界設定と所属キャラクター一覧を表示し、
 * 右下の編集ボタンから編集モードへ切り替えます。
 */
"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { findColorNameByHex } from "@/data/dictionaries";
import {
  getServerUserSettingsSnapshot,
  loadUserSettings,
  subscribeUserSettings,
} from "@/lib/userSettings";
import type { CharacterCard, WorldCard } from "@/types/setting";

interface WorldDetailViewProps {
  world: WorldCard;
  members: CharacterCard[];
  onEdit: () => void;
}

export default function WorldDetailView({
  world,
  members,
  onEdit,
}: WorldDetailViewProps) {
  const userSettings = useSyncExternalStore(
    subscribeUserSettings,
    loadUserSettings,
    getServerUserSettingsSnapshot
  );

  const mainColors = world.mainColors ?? [];
  const subColors = world.subColors ?? [];
  const customFields = world.customFields ?? [];

  return (
    <>
      <article className="mx-auto max-w-3xl rounded-xl border border-border-subtle bg-surface shadow-sm">
        {/* 世界名 */}
        <div className="border-b border-border-subtle px-4 py-4 sm:px-6">
          <span className="mb-1 block text-xs font-semibold text-foreground-muted">
            世界名
          </span>
          <h2 className="text-lg font-bold text-foreground">{world.name}</h2>
        </div>

        {/* 概要 */}
        <div className="border-b border-border-subtle px-4 py-3.5 sm:px-6">
          <span className="mb-1 block text-xs font-semibold text-foreground-muted">
            概要
          </span>
          <p className="text-sm text-foreground">{world.summary || "—"}</p>
        </div>

        {/* カラー設定 */}
        {(mainColors.length > 0 || subColors.length > 0) && (
          <div className="border-b border-border-subtle px-4 py-3.5 sm:px-6">
            <span className="mb-2 block text-xs font-semibold text-foreground-muted">
              イメージカラー
            </span>
            <div className="grid gap-3 rounded-lg bg-surface-muted/60 p-3 sm:grid-cols-2">
              {[
                { title: "メインカラー", colors: mainColors },
                { title: "サブカラー", colors: subColors },
              ].map((group) => (
                <div key={group.title}>
                  <span className="mb-1.5 block text-xs font-medium text-foreground-muted">
                    {group.title}
                  </span>
                  {group.colors.length === 0 ? (
                    <span className="text-xs text-foreground-muted">未設定</span>
                  ) : (
                    <div className="flex flex-wrap items-start gap-3">
                      {group.colors.map((color, index) => {
                        const colorName = userSettings.showColorName
                          ? findColorNameByHex(color)
                          : null;
                        return (
                          <div
                            key={`${group.title}-${index}`}
                            className="space-y-0.5"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-6 w-6 rounded-md border border-black/15 shadow-xs"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-mono text-xs uppercase text-foreground-muted">
                                {color}
                              </span>
                            </div>
                            {colorName && (
                              <p className="text-[11px] text-foreground-muted">
                                {colorName}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 追加された設定項目 */}
        {customFields.map((field) => (
          <div
            key={field.id}
            className="border-b border-border-subtle px-4 py-3.5 sm:px-6"
          >
            <span className="mb-1 block text-xs font-semibold text-foreground-muted">
              {field.label || "設定"}
            </span>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {field.value || "—"}
            </p>
          </div>
        ))}

        {/* 所属キャラクター */}
        <div className="px-4 py-4 sm:px-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground-muted">
              所属キャラクター（{members.length}人）
            </span>
            <Link
              href={`/characters/new?worldId=${world.id}`}
              className="rounded-lg border border-border-subtle bg-surface-muted/60 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted"
            >
              + この世界でキャラを新規作成
            </Link>
          </div>

          {members.length === 0 ? (
            <p className="text-xs text-foreground-muted">
              この世界に所属しているキャラクターはまだいません
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {members.map((char) => (
                <Link
                  key={char.id}
                  href={`/characters/${char.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-background/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted"
                >
                  <span
                    className="h-3 w-3 rounded-full border border-black/15"
                    style={{ backgroundColor: char.mainColors[0] ?? "#888888" }}
                  />
                  <span>{char.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
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
