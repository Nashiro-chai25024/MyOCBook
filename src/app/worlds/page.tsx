/**
 * 世界一覧画面。
 * 登録済みの世界を一覧表示し、タップで世界詳細（/worlds/[id]）へ、
 * 右下の「＋」ボタンから新規作成（/worlds/new）へ移動します。
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

export default function WorldsPage() {
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
      <AppHeader title="世界一覧" backHref="/" backLabel="ホーム" />

      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 sm:px-6">
        <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle bg-surface-muted px-4 py-2.5 text-xs font-bold text-foreground sm:px-6">
            登録済みの世界
          </div>
          {!isLoaded ? (
            <p className="px-4 py-6 text-xs text-foreground-muted sm:px-6">
              読み込み中...
            </p>
          ) : worlds.length === 0 ? (
            <div className="px-4 py-8 text-center sm:px-6">
              <p className="mb-4 text-sm text-foreground-muted">
                まだ登録されていません
              </p>
              <Link
                href="/worlds/new"
                className="inline-block rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
              >
                世界を作成
              </Link>
            </div>
          ) : (
            worlds.map((world) => {
              const memberCount = characters.filter(
                (c) => c.worldId === world.id
              ).length;
              const colors = [
                ...(world.mainColors ?? []),
                ...(world.subColors ?? []),
              ];
              return (
                <Link
                  key={world.id}
                  href={`/worlds/${world.id}`}
                  className="flex w-full items-center justify-between gap-3 border-b border-border-subtle px-4 py-3.5 text-left transition last:border-b-0 hover:bg-surface-muted/50 sm:px-6"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {colors.length > 0 && (
                      <div className="flex shrink-0 items-center gap-1">
                        {colors.slice(0, 3).map((color, i) => (
                          <span
                            key={`wc-${i}`}
                            className="h-3.5 w-3.5 rounded-full border border-black/15"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {world.name}
                      </p>
                      {world.summary && (
                        <p className="truncate text-xs text-foreground-muted">
                          {world.summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-foreground-muted">
                    <span>{memberCount}人</span>
                    <span>→</span>
                  </div>
                </Link>
              );
            })
          )}
        </section>
      </main>

      {/* 右下フローティング ＋ ボタン */}
      <Link
        href="/worlds/new"
        aria-label="新しい世界を作成"
        className="fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-medium text-accent-foreground shadow-lg transition hover:scale-105 active:scale-95"
      >
        ＋
      </Link>
    </div>
  );
}
