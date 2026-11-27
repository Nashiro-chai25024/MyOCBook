/**
 * 削除確認用の大きめポップアップモーダルコンポーネント。
 * キャラクター削除・世界削除（所属キャラクターを残すか一緒に削除するかの選択付き）に対応します。
 */
"use client";

import { useEffect } from "react";

export type DeleteTarget =
  | { type: "character"; id: string; name: string }
  | { type: "world"; id: string; name: string; memberCount: number };

interface ConfirmDeleteModalProps {
  target: DeleteTarget | null;
  onCancel: () => void;
  onConfirmCharacter: (id: string) => void;
  onConfirmWorld: (id: string, deleteCharacters: boolean) => void;
}

export default function ConfirmDeleteModal({
  target,
  onCancel,
  onConfirmCharacter,
  onConfirmWorld,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!target) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [target, onCancel]);

  if (!target) return null;

  const isWorldWithMembers =
    target.type === "world" && target.memberCount > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-6 shadow-2xl">
        <h2
          id="confirm-delete-title"
          className="mb-3 text-base font-bold text-foreground sm:text-lg"
        >
          削除の確認
        </h2>

        {isWorldWithMembers ? (
          <>
            <p className="mb-2 text-sm leading-relaxed text-foreground">
              「<span className="font-bold">{target.name}</span>」という世界を削除します。
            </p>
            <p className="mb-6 text-sm leading-relaxed text-foreground-muted">
              この世界に所属しているキャラクター（{target.memberCount}人）は残しますか？
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onConfirmWorld(target.id, false)}
                className="w-full rounded-xl border border-border-subtle bg-surface-muted/70 px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-surface-muted"
              >
                残す（キャラクターの所属は「未設定」になります）
              </button>
              <button
                type="button"
                onClick={() => onConfirmWorld(target.id, true)}
                className="w-full rounded-xl bg-danger px-4 py-3 text-left text-sm font-semibold text-white transition hover:opacity-90"
              >
                キャラクターも世界と一緒に削除する
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="mt-1 w-full rounded-xl border border-border-subtle px-4 py-2.5 text-center text-sm text-foreground-muted transition hover:bg-surface-muted hover:text-foreground"
              >
                キャンセル
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm leading-relaxed text-foreground">
              「<span className="font-bold">{target.name}</span>」を本当に削除しますか？
              <span className="mt-1 block text-xs text-foreground-muted">
                削除したデータは元に戻せません。
              </span>
            </p>

            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-border-subtle px-5 py-2.5 text-sm text-foreground-muted transition hover:bg-surface-muted hover:text-foreground"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  if (target.type === "character") {
                    onConfirmCharacter(target.id);
                  } else {
                    onConfirmWorld(target.id, false);
                  }
                }}
                className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                削除する
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
