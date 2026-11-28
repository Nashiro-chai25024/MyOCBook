/**
 * 既存の世界観詳細・編集ページ。
 * 初期状態は閲覧モードで開き、右下の編集ボタンから世界編集モードへ切り替えます。
 */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import AppHeader from "@/components/AppHeader";
import WorldDetailView from "@/components/WorldDetailView";
import WorldEditor from "@/components/WorldEditor";
import {
  getServerCharactersSnapshot,
  getServerWorldsSnapshot,
  loadCharacters,
  loadWorlds,
  subscribeData,
} from "@/lib/storage";

const emptySubscribe = () => () => {};

export default function WorldDetailPage() {
  const params = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState<boolean>(false);

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

  const target = worlds.find((w) => w.id === params.id) ?? null;
  const members = target
    ? characters.filter((c) => c.worldId === target.id)
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        title={isEditing ? "世界編集モード" : "世界詳細"}
        backHref="/worlds"
        backLabel="一覧へ"
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        {!isLoaded ? (
          <p className="text-sm text-foreground-muted">読み込み中...</p>
        ) : !target ? (
          <div className="mx-auto max-w-3xl rounded-xl border border-border-subtle bg-surface p-8 text-center">
            <p className="mb-4 text-sm text-foreground-muted">
              世界が見つかりませんでした
            </p>
            <Link
              href="/worlds"
              className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              世界一覧へ戻る
            </Link>
          </div>
        ) : isEditing ? (
          <WorldEditor
            key={target.id}
            initialWorld={target}
            onDone={() => setIsEditing(false)}
          />
        ) : (
          <WorldDetailView
            world={target}
            members={members}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </main>
    </div>
  );
}
