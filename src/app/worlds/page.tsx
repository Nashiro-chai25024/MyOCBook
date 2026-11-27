/**
 * 世界一覧画面。
 * 登録済みの世界観を一覧表示し、右下の「＋」ボタンからモーダルで新規作成・編集・削除を行います。
 */
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import AppHeader from "@/components/AppHeader";
import {
  createWorldCard,
  getServerWorldsSnapshot,
  loadWorlds,
  subscribeData,
  updateWorldCard,
  validateWorldInput,
} from "@/lib/storage";
import { SETTING_LIMITS, type WorldCard } from "@/types/setting";

const emptySubscribe = () => () => {};

export default function WorldsPage() {
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

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setSummary("");
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (world: WorldCard) => {
    setEditingId(world.id);
    setName(world.name);
    setSummary(world.summary);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateWorldInput({ name, summary });
    if (error) {
      setErrorMessage(error);
      return;
    }
    if (editingId) {
      updateWorldCard(editingId, { name, summary });
    } else {
      createWorldCard({ name, summary });
    }
    setModalOpen(false);
  };

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
              <p className="text-sm text-foreground-muted">
                まだ登録されていません
              </p>
            </div>
          ) : (
            worlds.map((world) => (
              <button
                key={world.id}
                type="button"
                onClick={() => openEditModal(world)}
                className="flex w-full items-center justify-between gap-3 border-b border-border-subtle px-4 py-3.5 text-left transition last:border-b-0 hover:bg-surface-muted/50 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {world.name}
                  </p>
                  {world.summary && (
                    <p className="truncate text-xs text-foreground-muted">
                      {world.summary}
                    </p>
                  )}
                </div>
                <span className="text-xs text-foreground-muted">→</span>
              </button>
            ))
          )}
        </section>
      </main>

      {/* 右下フローティング ＋ ボタン */}
      <button
        type="button"
        onClick={openCreateModal}
        aria-label="新しい世界を作成"
        className="fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-medium text-accent-foreground shadow-lg transition hover:scale-105 active:scale-95"
      >
        ＋
      </button>

      {/* 世界作成・編集モーダル */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="world-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-border-subtle bg-surface p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
              <h2
                id="world-modal-title"
                className="text-base font-bold text-foreground"
              >
                {editingId ? "世界を編集" : "新しい世界"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="閉じる"
                className="rounded-lg px-2 py-1 text-sm text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="oc-world-title"
                    className="text-xs font-semibold text-foreground-muted"
                  >
                    世界名 <span className="text-danger">*</span>
                  </label>
                  <span className="text-[11px] text-foreground-muted">
                    {name.length} / {SETTING_LIMITS.NAME_MAX}
                  </span>
                </div>
                <input
                  id="oc-world-title"
                  name="oc-world-title"
                  type="text"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  maxLength={SETTING_LIMITS.NAME_MAX}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full rounded-lg border border-border-subtle bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="world-summary"
                    className="text-xs font-semibold text-foreground-muted"
                  >
                    概要メモ
                  </label>
                  <span className="text-[11px] text-foreground-muted">
                    {summary.length} / {SETTING_LIMITS.SUMMARY_MAX}
                  </span>
                </div>
                <input
                  id="world-summary"
                  type="text"
                  maxLength={SETTING_LIMITS.SUMMARY_MAX}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
                />
              </div>

              {errorMessage && (
                <p className="text-xs font-medium text-danger">{errorMessage}</p>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-border-subtle pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-border-subtle px-3.5 py-1.5 text-xs text-foreground-muted hover:bg-surface-muted"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground hover:opacity-90"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
