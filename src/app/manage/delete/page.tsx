/**
 * データの削除専用ページ（メニュー画面 → データの削除）。
 * 登録済みのキャラクター・世界を選択し、大きめの確認ポップアップから安全に削除します。
 */
"use client";

import { useState, useSyncExternalStore } from "react";
import AppHeader from "@/components/AppHeader";
import ConfirmDeleteModal, {
  type DeleteTarget,
} from "@/components/ConfirmDeleteModal";
import {
  deleteCharacterCard,
  deleteWorldCard,
  getServerCharactersSnapshot,
  getServerWorldsSnapshot,
  loadCharacters,
  loadWorlds,
  subscribeData,
} from "@/lib/storage";

type DeleteTab = "character" | "world";

const emptySubscribe = () => () => {};

export default function DeleteManagePage() {
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

  const [tab, setTab] = useState<DeleteTab>("character");
  const [target, setTarget] = useState<DeleteTarget | null>(null);

  const getWorldName = (worldId: string | null) => {
    if (!worldId) return "未設定";
    return worlds.find((w) => w.id === worldId)?.name ?? "未設定";
  };

  const handleConfirmCharacter = (id: string) => {
    deleteCharacterCard(id);
    setTarget(null);
  };

  const handleConfirmWorld = (id: string, deleteCharacters: boolean) => {
    deleteWorldCard(id, deleteCharacters);
    setTarget(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader title="データの削除" backHref="/" backLabel="ホーム" />

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
        <p className="text-xs text-foreground-muted">
          削除したい対象を選択してください。誤操作を防ぐため、削除前に確認画面が表示されます。
        </p>

        {/* タブ切替 */}
        <div className="inline-flex rounded-xl border border-border-subtle bg-surface p-1">
          <button
            type="button"
            onClick={() => setTab("character")}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
              tab === "character"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            キャラクター（{isLoaded ? characters.length : 0}）
          </button>
          <button
            type="button"
            onClick={() => setTab("world")}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
              tab === "world"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            世界（{isLoaded ? worlds.length : 0}）
          </button>
        </div>

        {/* 一覧 */}
        <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
          {!isLoaded ? (
            <p className="px-4 py-6 text-xs text-foreground-muted sm:px-6">
              読み込み中...
            </p>
          ) : tab === "character" ? (
            characters.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-foreground-muted">
                削除できるキャラクターはありません
              </p>
            ) : (
              characters.map((char) => (
                <div
                  key={char.id}
                  className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3.5 last:border-b-0 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
                      style={{
                        backgroundColor: char.mainColors[0] ?? "#888888",
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {char.name}
                      </p>
                      <p className="truncate text-xs text-foreground-muted">
                        所属世界：{getWorldName(char.worldId)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setTarget({
                        type: "character",
                        id: char.id,
                        name: char.name,
                      })
                    }
                    className="shrink-0 rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10"
                  >
                    削除
                  </button>
                </div>
              ))
            )
          ) : worlds.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-foreground-muted">
              削除できる世界はありません
            </p>
          ) : (
            worlds.map((world) => {
              const memberCount = characters.filter(
                (c) => c.worldId === world.id
              ).length;
              return (
                <div
                  key={world.id}
                  className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3.5 last:border-b-0 sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {world.name}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      所属キャラクター：{memberCount}人
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setTarget({
                        type: "world",
                        id: world.id,
                        name: world.name,
                        memberCount,
                      })
                    }
                    className="shrink-0 rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10"
                  >
                    削除
                  </button>
                </div>
              );
            })
          )}
        </section>
      </main>

      <ConfirmDeleteModal
        target={target}
        onCancel={() => setTarget(null)}
        onConfirmCharacter={handleConfirmCharacter}
        onConfirmWorld={handleConfirmWorld}
      />
    </div>
  );
}
