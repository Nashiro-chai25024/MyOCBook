/**
 * 既存キャラクターの詳細・編集ページ。
 * 初期状態は閲覧モードで開き、右下の編集ボタンから編集モードへ切り替えます。
 */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import AppHeader from "@/components/AppHeader";
import CharacterDetailView from "@/components/CharacterDetailView";
import CharacterEditor from "@/components/CharacterEditor";
import {
  getServerCharactersSnapshot,
  getServerWorldsSnapshot,
  loadCharacters,
  loadWorlds,
  subscribeData,
} from "@/lib/storage";

const emptySubscribe = () => () => {};

export default function CharacterDetailPage() {
  const params = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const characters = useSyncExternalStore(
    subscribeData,
    loadCharacters,
    getServerCharactersSnapshot
  );
  const worlds = useSyncExternalStore(
    subscribeData,
    loadWorlds,
    getServerWorldsSnapshot
  );
  const isLoaded = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const target = characters.find((c) => c.id === params.id) ?? null;
  const world = target?.worldId
    ? worlds.find((w) => w.id === target.worldId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        title={isEditing ? "キャラ編集モード" : "キャラ詳細"}
        backHref="/characters"
        backLabel="一覧へ"
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        {!isLoaded ? (
          <p className="text-sm text-foreground-muted">読み込み中...</p>
        ) : !target ? (
          <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center">
            <p className="mb-4 text-sm text-foreground-muted">
              キャラクターが見つかりませんでした
            </p>
            <Link
              href="/characters"
              className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              キャラ一覧へ戻る
            </Link>
          </div>
        ) : isEditing ? (
          <CharacterEditor
            key={target.id}
            initialCharacter={target}
            onDone={() => setIsEditing(false)}
          />
        ) : (
          <CharacterDetailView
            character={target}
            world={world}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </main>
    </div>
  );
}
