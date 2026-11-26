/**
 * MyOCBook のホーム画面。
 * 世界一覧・キャラ一覧・辞書一覧へのクイックアクセスを提供します。
 */
"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import AppHeader from "@/components/AppHeader";
import {
  getServerCharactersSnapshot,
  getServerWorldsSnapshot,
  loadCharacters,
  loadWorlds,
  subscribeData,
} from "@/lib/storage";

const emptySubscribe = () => () => {};

const DICTIONARY_CARDS = [
  { id: "flower", title: "花・花言葉", href: "/dictionary/flower" },
  { id: "stone", title: "石・誕生石", href: "/dictionary/stone" },
  { id: "constellation", title: "星座・星", href: "/dictionary/constellation" },
  { id: "color", title: "色・カラー", href: "/dictionary/color" },
  { id: "idea", title: "他言語・アイデア", href: "/dictionary/idea" },
] as const;

export default function HomePage() {
  const worlds = useSyncExternalStore(
    subscribeData,
    loadWorlds,
    getServerWorldsSnapshot
  );
  const characters = useSyncExternalStore(
    subscribeData,
    loadCharacters,
    getServerCharactersSnapshot
  );
  const isLoaded = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader title="ホーム画面" />

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        {/* 世界一覧セクション */}
        <section className="border-b border-border-subtle pb-6">
          <div className="mb-4">
            <Link
              href="/worlds"
              className="inline-flex items-center gap-2 text-base font-bold text-foreground transition hover:opacity-75"
            >
              <span>✦</span>
              <span>世界一覧</span>
              <span className="text-foreground-muted">→</span>
            </Link>
          </div>

          {!isLoaded ? (
            <p className="text-xs text-foreground-muted">読み込み中...</p>
          ) : worlds.length === 0 ? (
            <p className="text-xs text-foreground-muted">
              世界はまだ登録されていません
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {worlds.slice(0, 8).map((world) => (
                <Link
                  key={world.id}
                  href="/worlds"
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-border-subtle bg-surface p-2 text-center text-xs font-medium text-foreground shadow-xs transition hover:border-foreground/50 hover:bg-surface-muted"
                >
                  <span className="line-clamp-2 break-all">{world.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* キャラ一覧セクション */}
        <section className="border-b border-border-subtle pb-6">
          <div className="mb-4">
            <Link
              href="/characters"
              className="inline-flex items-center gap-2 text-base font-bold text-foreground transition hover:opacity-75"
            >
              <span>✦</span>
              <span>キャラ一覧</span>
              <span className="text-foreground-muted">→</span>
            </Link>
          </div>

          {!isLoaded ? (
            <p className="text-xs text-foreground-muted">読み込み中...</p>
          ) : characters.length === 0 ? (
            <p className="text-xs text-foreground-muted">
              キャラクターはまだ登録されていません
            </p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {characters.slice(0, 8).map((char) => (
                <Link
                  key={char.id}
                  href={`/characters/${char.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted"
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
        </section>

        {/* 辞書一覧セクション */}
        <section>
          <div className="mb-4">
            <Link
              href="/dictionary"
              className="inline-flex items-center gap-2 text-base font-bold text-foreground transition hover:opacity-75"
            >
              <span>✦</span>
              <span>辞書一覧</span>
              <span className="text-foreground-muted">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {DICTIONARY_CARDS.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className="flex min-h-24 items-center justify-center rounded-xl border border-border-subtle bg-surface p-3 text-center text-sm font-semibold text-foreground shadow-xs transition hover:border-foreground/50 hover:bg-surface-muted"
              >
                {card.title}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
