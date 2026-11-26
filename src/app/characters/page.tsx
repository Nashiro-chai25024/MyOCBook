/**
 * キャラ一覧画面。
 * 世界名ごとのグレー見出し帯の下に、所属するキャラクターを一覧表示します。
 */
"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import AppHeader from "@/components/AppHeader";
import {
  getServerCharactersSnapshot,
  getServerWorldsSnapshot,
  loadCharacters,
  loadWorlds,
  subscribeData,
} from "@/lib/storage";
import type { CharacterCard } from "@/types/setting";

const emptySubscribe = () => () => {};

interface CharacterGroup {
  worldId: string | null;
  worldName: string;
  items: CharacterCard[];
}

export default function CharactersPage() {
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

  const groups = useMemo<CharacterGroup[]>(() => {
    const result: CharacterGroup[] = [];
    for (const world of worlds) {
      const items = characters.filter((c) => c.worldId === world.id);
      result.push({
        worldId: world.id,
        worldName: world.name,
        items,
      });
    }
    const unassigned = characters.filter(
      (c) => !c.worldId || !worlds.some((w) => w.id === c.worldId)
    );
    if (unassigned.length > 0 || result.length === 0) {
      result.push({
        worldId: null,
        worldName: "未設定",
        items: unassigned,
      });
    }
    return result;
  }, [worlds, characters]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader title="キャラ一覧" backHref="/" backLabel="ホーム" />

      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 sm:px-6">
        {!isLoaded ? (
          <p className="text-sm text-foreground-muted">読み込み中...</p>
        ) : characters.length === 0 && worlds.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center">
            <p className="mb-4 text-sm text-foreground-muted">
              キャラクターがまだ登録されていません
            </p>
            <Link
              href="/characters/new"
              className="inline-block rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              キャラクターを作成
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
            {groups.map((group) => (
              <div key={group.worldId ?? "unassigned"}>
                {/* 世界名（グレー見出し帯） */}
                <div className="border-b border-border-subtle bg-surface-muted px-4 py-2.5 text-sm font-bold text-foreground sm:px-6">
                  {group.worldName}
                </div>

                {/* 所属キャラ行 */}
                {group.items.length === 0 ? (
                  <div className="border-b border-border-subtle px-4 py-3 text-xs text-foreground-muted last:border-b-0 sm:px-6">
                    キャラクターなし
                  </div>
                ) : (
                  group.items.map((char) => (
                    <Link
                      key={char.id}
                      href={`/characters/${char.id}`}
                      className="flex items-center justify-between border-b border-border-subtle px-4 py-3 text-sm transition hover:bg-surface-muted/50 sm:px-6"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {char.mainColors.map((color, i) => (
                            <span
                              key={`m-${i}`}
                              className="h-3.5 w-3.5 rounded-full border border-black/15"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                          {char.subColors.map((color, i) => (
                            <span
                              key={`s-${i}`}
                              className="h-2.5 w-2.5 rounded-full border border-black/15"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-foreground">
                          {char.name}
                        </span>
                      </div>
                      <span className="text-xs text-foreground-muted">→</span>
                    </Link>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 新規作成 ＋ ボタン */}
      <Link
        href="/characters/new"
        aria-label="キャラクターを新規作成"
        className="fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-medium text-accent-foreground shadow-lg transition hover:scale-105 active:scale-95"
      >
        ＋
      </Link>
    </div>
  );
}
