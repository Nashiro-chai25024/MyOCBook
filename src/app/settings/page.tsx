/**
 * 設定画面（メニュー → 設定）。
 * 編集中に辞書を2分割で開く位置（PC：左右、スマホ：上下）を設定できます。
 */
"use client";

import { useSyncExternalStore } from "react";
import AppHeader from "@/components/AppHeader";
import {
  getServerUserSettingsSnapshot,
  loadUserSettings,
  subscribeUserSettings,
  updateUserSettings,
  type MobileDictionarySide,
  type PcDictionarySide,
  type ThemeMode,
} from "@/lib/userSettings";

export default function SettingsPage() {
  const settings = useSyncExternalStore(
    subscribeUserSettings,
    loadUserSettings,
    getServerUserSettingsSnapshot
  );

  const handlePcChange = (side: PcDictionarySide) => {
    updateUserSettings({ pcDictionarySide: side });
  };

  const handleMobileChange = (side: MobileDictionarySide) => {
    updateUserSettings({ mobileDictionarySide: side });
  };

  const handleThemeChange = (theme: ThemeMode) => {
    updateUserSettings({ theme });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader title="設定" backHref="/" backLabel="ホーム" />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        {/* 外観テーマ設定 */}
        <section className="rounded-xl border border-border-subtle bg-surface p-5 shadow-xs">
          <h2 className="mb-1 text-sm font-bold text-foreground">
            外観テーマ
          </h2>
          <p className="mb-4 text-xs text-foreground-muted">
            アプリ全体の配色（ホワイトモード／ダークモード）を切り替えます。
          </p>
          <div className="inline-flex flex-wrap rounded-xl border border-border-subtle bg-surface-muted/70 p-1">
            {(
              [
                { value: "system", label: "システム" },
                { value: "light", label: "ホワイトモード" },
                { value: "dark", label: "ダークモード" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleThemeChange(option.value)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  settings.theme === option.value
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* 色名の表示設定 */}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface p-5 shadow-xs">
          <div>
            <h2 className="mb-1 text-sm font-bold text-foreground">
              選択した色の名前表示
            </h2>
            <p className="text-xs text-foreground-muted">
              カラーコードが色辞書と一致するとき、色の下に名前を表示します。
            </p>
          </div>
          <div className="inline-flex rounded-xl border border-border-subtle bg-surface-muted/70 p-1">
            {[
              { value: true, label: "オン" },
              { value: false, label: "オフ" },
            ].map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() =>
                  updateUserSettings({ showColorName: option.value })
                }
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  settings.showColorName === option.value
                    ? "bg-accent text-accent-foreground shadow-xs"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border-subtle bg-surface p-5 shadow-xs">
          <h2 className="mb-1 text-sm font-bold text-foreground">
            編集中の辞書表示位置（2分割）
          </h2>
          <p className="mb-5 text-xs text-foreground-muted">
            キャラクター編集中に辞書を開いたとき、辞書パネルをどちら側に表示するか設定します。
          </p>

          <div className="space-y-5">
            {/* PC画面 */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  PC画面（横分割）
                </p>
                <p className="text-xs text-foreground-muted">
                  広い画面で左右に分けて表示します
                </p>
              </div>
              <div className="inline-flex rounded-xl border border-border-subtle bg-surface-muted/70 p-1">
                {(
                  [
                    { value: "left", label: "左に辞書" },
                    { value: "right", label: "右に辞書" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePcChange(option.value)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                      settings.pcDictionarySide === option.value
                        ? "bg-accent text-accent-foreground shadow-xs"
                        : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* スマホ画面 */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  スマホ画面（縦分割）
                </p>
                <p className="text-xs text-foreground-muted">
                  縦長の画面で上下に分けて表示します
                </p>
              </div>
              <div className="inline-flex rounded-xl border border-border-subtle bg-surface-muted/70 p-1">
                {(
                  [
                    { value: "top", label: "上に辞書" },
                    { value: "bottom", label: "下に辞書" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleMobileChange(option.value)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                      settings.mobileDictionarySide === option.value
                        ? "bg-accent text-accent-foreground shadow-xs"
                        : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
