/**
 * ユーザーごとの表示設定（編集中に辞書パネルを開く位置など）を localStorage で管理します。
 */

export type PcDictionarySide = "left" | "right";
export type MobileDictionarySide = "top" | "bottom";
export type ThemeMode = "system" | "light" | "dark";

export interface UserSettings {
  pcDictionarySide: PcDictionarySide;
  mobileDictionarySide: MobileDictionarySide;
  theme: ThemeMode;
}

const SETTINGS_KEY = "myocbook_user_settings_v1";
const SETTINGS_EVENT = "myocbook-user-settings-changed";

const DEFAULT_SETTINGS: UserSettings = {
  pcDictionarySide: "right",
  mobileDictionarySide: "bottom",
  theme: "system",
};

let cachedRaw: string | null = null;
let cachedSettings: UserSettings = DEFAULT_SETTINGS;

/** ユーザー設定を読み込みます（useSyncExternalStore 対応） */
export function loadUserSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedSettings = DEFAULT_SETTINGS;
      return DEFAULT_SETTINGS;
    }
    if (raw === cachedRaw) return cachedSettings;
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    const normalized: UserSettings = {
      pcDictionarySide: parsed.pcDictionarySide === "left" ? "left" : "right",
      mobileDictionarySide:
        parsed.mobileDictionarySide === "top" ? "top" : "bottom",
      theme:
        parsed.theme === "light" || parsed.theme === "dark"
          ? parsed.theme
          : "system",
    };
    cachedRaw = raw;
    cachedSettings = normalized;
    return normalized;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getServerUserSettingsSnapshot(): UserSettings {
  return DEFAULT_SETTINGS;
}

export function subscribeUserSettings(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handleStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === SETTINGS_KEY) {
      onStoreChange();
    }
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(SETTINGS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SETTINGS_EVENT, onStoreChange);
  };
}

/** ユーザー設定を保存して購読中コンポーネントへ通知します */
export function updateUserSettings(patch: Partial<UserSettings>): void {
  if (typeof window === "undefined") return;
  const next: UserSettings = {
    ...loadUserSettings(),
    ...patch,
  };
  const serialized = JSON.stringify(next);
  window.localStorage.setItem(SETTINGS_KEY, serialized);
  cachedRaw = serialized;
  cachedSettings = next;
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}
