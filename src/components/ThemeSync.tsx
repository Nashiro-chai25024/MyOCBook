/**
 * ユーザー設定のテーマ（システム / ホワイト / ダーク）を <html> 要素の data-theme に同期します。
 */
"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getServerUserSettingsSnapshot,
  loadUserSettings,
  subscribeUserSettings,
} from "@/lib/userSettings";

export default function ThemeSync() {
  const settings = useSyncExternalStore(
    subscribeUserSettings,
    loadUserSettings,
    getServerUserSettingsSnapshot
  );

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "light" || settings.theme === "dark") {
      root.dataset.theme = settings.theme;
    } else {
      delete root.dataset.theme;
    }
  }, [settings.theme]);

  return null;
}
