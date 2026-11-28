/**
 * 世界観編集モードのノート風フォームコンポーネント。
 * 世界名・概要・カラー（色辞書連携）・自由追加設定・既存キャラからの所属選択・2分割辞書・未保存離脱防止に対応します。
 */
"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import DictionaryPanel from "@/components/DictionaryPanel";
import { useNavigationGuard } from "@/components/NavigationGuardContext";
import { findColorNameByHex, type CategoryKey } from "@/data/dictionaries";
import {
  assignCharactersToWorld,
  createId,
  createWorldCard,
  getServerCharactersSnapshot,
  getServerWorldsSnapshot,
  isValidHexColor,
  loadCharacters,
  loadWorlds,
  subscribeData,
  updateWorldCard,
  validateWorldInput,
} from "@/lib/storage";
import {
  getServerUserSettingsSnapshot,
  loadUserSettings,
  subscribeUserSettings,
} from "@/lib/userSettings";
import {
  SETTING_LIMITS,
  type CustomField,
  type WorldCard,
  type WorldCardInput,
} from "@/types/setting";

interface WorldEditorProps {
  /** 編集対象データ（新規作成時は null） */
  initialWorld: WorldCard | null;
  /** 保存・キャンセル時に一覧遷移の代わりに行うコールバック */
  onDone?: () => void;
}

type ColorTarget = { group: "main" | "sub"; index: number };

const DEFAULT_MAIN_COLOR = "#5c6b73";
const DEFAULT_SUB_COLOR = "#9db4c0";

function toSafePickerColor(color: string, fallback: string): string {
  return isValidHexColor(color) ? color : fallback;
}

export default function WorldEditor({
  initialWorld,
  onDone,
}: WorldEditorProps) {
  const router = useRouter();
  const { registerGuard, requestNavigation } = useNavigationGuard();

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
  const userSettings = useSyncExternalStore(
    subscribeUserSettings,
    loadUserSettings,
    getServerUserSettingsSnapshot
  );

  const initialMemberIds = useMemo(
    () =>
      initialWorld
        ? characters
            .filter((c) => c.worldId === initialWorld.id)
            .map((c) => c.id)
        : [],
    [characters, initialWorld]
  );

  const [name, setName] = useState<string>(initialWorld?.name ?? "");
  const [summary, setSummary] = useState<string>(initialWorld?.summary ?? "");
  const [mainColors, setMainColors] = useState<string[]>(
    initialWorld?.mainColors?.length
      ? initialWorld.mainColors
      : [DEFAULT_MAIN_COLOR]
  );
  const [subColors, setSubColors] = useState<string[]>(
    initialWorld?.subColors ?? []
  );
  const [customFields, setCustomFields] = useState<CustomField[]>(
    initialWorld?.customFields ?? []
  );
  const [selectedCharacterIds, setSelectedCharacterIds] =
    useState<string[]>(initialMemberIds);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dictOpen, setDictOpen] = useState<boolean>(false);
  const [dictCategory, setDictCategory] = useState<CategoryKey>("color");
  const [colorTarget, setColorTarget] = useState<ColorTarget>({
    group: "main",
    index: 0,
  });
  const [pendingNavHref, setPendingNavHref] = useState<string | null>(null);
  const [pendingDeleteField, setPendingDeleteField] =
    useState<CustomField | null>(null);

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        name: initialWorld?.name ?? "",
        summary: initialWorld?.summary ?? "",
        mainColors: initialWorld?.mainColors?.length
          ? initialWorld.mainColors
          : [DEFAULT_MAIN_COLOR],
        subColors: initialWorld?.subColors ?? [],
        customFields: initialWorld?.customFields ?? [],
        selectedCharacterIds: initialMemberIds,
      }),
    [initialWorld, initialMemberIds]
  );

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        name,
        summary,
        mainColors,
        subColors,
        customFields,
        selectedCharacterIds,
      }),
    [name, summary, mainColors, subColors, customFields, selectedCharacterIds]
  );

  const isDirty = currentSnapshot !== initialSnapshot;

  useEffect(() => {
    registerGuard((targetHref) => {
      if (!isDirty) return false;
      setPendingNavHref(targetHref);
      return true;
    });
    return () => registerGuard(null);
  }, [isDirty, registerGuard]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleMainColorChange = (index: number, color: string) => {
    setMainColors((prev) => prev.map((c, i) => (i === index ? color : c)));
  };

  const handleAddMainColor = () => {
    if (mainColors.length >= SETTING_LIMITS.MAIN_COLORS_MAX) return;
    setMainColors((prev) => [...prev, "#7b8794"]);
  };

  const handleRemoveMainColor = (index: number) => {
    if (mainColors.length <= SETTING_LIMITS.MAIN_COLORS_MIN) return;
    setMainColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubColorChange = (index: number, color: string) => {
    setSubColors((prev) => prev.map((c, i) => (i === index ? color : c)));
  };

  const handleAddSubColor = () => {
    if (subColors.length >= SETTING_LIMITS.SUB_COLORS_MAX) return;
    setSubColors((prev) => [...prev, DEFAULT_SUB_COLOR]);
  };

  const handleRemoveSubColor = (index: number) => {
    setSubColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenColorDictionary = (
    group: "main" | "sub",
    index: number
  ) => {
    setColorTarget({ group, index });
    setDictCategory("color");
    setDictOpen(true);
  };

  const handleSelectColorFromDict = (hex: string) => {
    if (colorTarget.group === "main") {
      setMainColors((prev) => {
        if (colorTarget.index < prev.length) {
          return prev.map((c, i) => (i === colorTarget.index ? hex : c));
        }
        return prev.length < SETTING_LIMITS.MAIN_COLORS_MAX
          ? [...prev, hex]
          : prev;
      });
      return;
    }
    setSubColors((prev) => {
      if (colorTarget.index < prev.length) {
        return prev.map((c, i) => (i === colorTarget.index ? hex : c));
      }
      return prev.length < SETTING_LIMITS.SUB_COLORS_MAX ? [...prev, hex] : prev;
    });
  };

  const handleToggleCharacter = (charId: string) => {
    setSelectedCharacterIds((prev) =>
      prev.includes(charId)
        ? prev.filter((id) => id !== charId)
        : [...prev, charId]
    );
  };

  const handleAddCustomField = () => {
    if (customFields.length >= SETTING_LIMITS.CUSTOM_FIELDS_MAX) return;
    setCustomFields((prev) => [...prev, { id: createId(), label: "", value: "" }]);
  };

  const handleFieldChange = (
    id: string,
    key: "label" | "value",
    text: string
  ) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: text } : f))
    );
  };

  const handleRequestRemoveField = (field: CustomField) => {
    const hasContent =
      field.label.trim().length > 0 || field.value.trim().length > 0;
    if (hasContent) {
      setPendingDeleteField(field);
      return;
    }
    setCustomFields((prev) => prev.filter((f) => f.id !== field.id));
  };

  const handleConfirmRemoveField = () => {
    if (!pendingDeleteField) return;
    setCustomFields((prev) =>
      prev.filter((f) => f.id !== pendingDeleteField.id)
    );
    setPendingDeleteField(null);
  };

  const saveWorld = (): string | null => {
    const input: WorldCardInput = {
      name,
      summary,
      mainColors,
      subColors,
      customFields,
    };
    const error = validateWorldInput(input);
    if (error) {
      setErrorMessage(error);
      return null;
    }
    if (initialWorld) {
      updateWorldCard(initialWorld.id, input);
      assignCharactersToWorld(initialWorld.id, selectedCharacterIds);
      return initialWorld.id;
    }
    const created = createWorldCard(input);
    assignCharactersToWorld(created.id, selectedCharacterIds);
    return created.id;
  };

  const proceedNavigation = (target: string) => {
    if (target === "__CANCEL_DONE__") {
      onDone?.();
    } else {
      router.push(target);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savedId = saveWorld();
    if (!savedId) return;
    registerGuard(null);
    if (onDone) {
      onDone();
    } else {
      router.push(`/worlds/${savedId}`);
    }
  };

  const handleCancelClick = () => {
    const target = onDone ? "__CANCEL_DONE__" : "/worlds";
    if (isDirty) {
      setPendingNavHref(target);
      return;
    }
    proceedNavigation(target);
  };

  const getOtherWorldName = (worldId: string | null) => {
    if (!worldId || worldId === initialWorld?.id) return null;
    return worlds.find((w) => w.id === worldId)?.name ?? null;
  };

  const splitDirectionClass = [
    userSettings.mobileDictionarySide === "top"
      ? "flex-col-reverse"
      : "flex-col",
    userSettings.pcDictionarySide === "left"
      ? "lg:flex-row-reverse"
      : "lg:flex-row",
  ].join(" ");

  return (
    <div
      className={
        dictOpen
          ? "flex h-[calc(100dvh-5.5rem)] flex-col gap-3 overflow-hidden"
          : "mx-auto max-w-3xl space-y-4"
      }
    >
      {/* 辞書パネル切り替えバー */}
      <div className="flex shrink-0 items-center justify-end">
        <button
          type="button"
          onClick={() => setDictOpen((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
            dictOpen
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border-subtle bg-surface text-foreground hover:bg-surface-muted"
          }`}
        >
          <span>{dictOpen ? "辞書を閉じる" : "辞書を開く"}</span>
        </button>
      </div>

      <div
        className={
          dictOpen ? `flex min-h-0 flex-1 gap-3 ${splitDirectionClass}` : "block"
        }
      >
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className={`rounded-xl border border-border-subtle bg-surface shadow-sm ${
            dictOpen ? "min-h-0 flex-1 overflow-y-auto lg:w-1/2" : "w-full"
          }`}
        >
          {/* 世界名 */}
          <div className="border-b border-border-subtle px-4 py-3.5 sm:px-6">
            <div className="mb-1 flex items-center justify-between">
              <label
                htmlFor="oc-world-name-field"
                className="text-xs font-semibold text-foreground-muted"
              >
                世界名 <span className="text-danger">*</span>
              </label>
              <span className="text-[11px] text-foreground-muted">
                {name.length} / {SETTING_LIMITS.NAME_MAX}
              </span>
            </div>
            <input
              id="oc-world-name-field"
              name="oc-world-name-field"
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
              className="w-full bg-transparent text-base font-medium text-foreground outline-none"
            />
          </div>

          {/* 概要 */}
          <div className="border-b border-border-subtle px-4 py-3.5 sm:px-6">
            <div className="mb-1 flex items-center justify-between">
              <label
                htmlFor="oc-world-summary-field"
                className="text-xs font-semibold text-foreground-muted"
              >
                概要
              </label>
              <span className="text-[11px] text-foreground-muted">
                {summary.length} / {SETTING_LIMITS.SUMMARY_MAX}
              </span>
            </div>
            <input
              id="oc-world-summary-field"
              name="oc-world-summary-field"
              type="text"
              autoComplete="off"
              data-lpignore="true"
              maxLength={SETTING_LIMITS.SUMMARY_MAX}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>

          {/* イメージカラー（メイン1〜2色 / サブ0〜2色） */}
          <div className="border-b border-border-subtle px-4 py-3.5 sm:px-6">
            <span className="mb-2 block text-xs font-semibold text-foreground-muted">
              イメージカラー
            </span>
            <div className="grid gap-3 rounded-lg bg-surface-muted/60 p-3 sm:grid-cols-2">
              {(
                [
                  {
                    key: "main" as const,
                    title: "メインカラー",
                    colors: mainColors,
                    max: SETTING_LIMITS.MAIN_COLORS_MAX,
                    min: SETTING_LIMITS.MAIN_COLORS_MIN,
                    fallback: DEFAULT_MAIN_COLOR,
                    onAdd: handleAddMainColor,
                    onChange: handleMainColorChange,
                    onRemove: handleRemoveMainColor,
                  },
                  {
                    key: "sub" as const,
                    title: "サブカラー",
                    colors: subColors,
                    max: SETTING_LIMITS.SUB_COLORS_MAX,
                    min: 0,
                    fallback: DEFAULT_SUB_COLOR,
                    onAdd: handleAddSubColor,
                    onChange: handleSubColorChange,
                    onRemove: handleRemoveSubColor,
                  },
                ] as const
              ).map((group) => (
                <div key={group.title}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground-muted">
                      {group.title}
                    </span>
                    {group.colors.length < group.max && (
                      <button
                        type="button"
                        onClick={group.onAdd}
                        className="rounded border border-border-subtle bg-surface px-2 py-0.5 text-[11px] text-foreground hover:bg-surface-muted"
                      >
                        + 追加
                      </button>
                    )}
                  </div>
                  {group.colors.length === 0 ? (
                    <span className="text-[11px] text-foreground-muted">
                      未設定
                    </span>
                  ) : (
                    <div className="space-y-2">
                      {group.colors.map((color, index) => {
                        const safeColor = toSafePickerColor(
                          color,
                          group.fallback
                        );
                        const matchedColorName = userSettings.showColorName
                          ? findColorNameByHex(color)
                          : null;
                        return (
                          <div
                            key={`${group.title}-${index}`}
                            className="space-y-1"
                          >
                            <div className="flex flex-wrap items-center gap-1.5">
                              <label
                                className="relative flex h-8 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border-subtle shadow-xs"
                                style={{ backgroundColor: safeColor }}
                                title="クリックして色を選択"
                              >
                                <input
                                  type="color"
                                  value={safeColor}
                                  aria-label={`${group.title}${index + 1}`}
                                  onChange={(e) =>
                                    group.onChange(index, e.target.value)
                                  }
                                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                              </label>
                              <input
                                type="text"
                                value={color}
                                autoComplete="off"
                                data-lpignore="true"
                                maxLength={7}
                                aria-label={`${group.title}${index + 1}コード`}
                                onChange={(e) =>
                                  group.onChange(index, e.target.value)
                                }
                                className="w-20 rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-xs uppercase text-foreground outline-none focus:border-foreground"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenColorDictionary(group.key, index)
                                }
                                className="rounded border border-border-subtle bg-surface px-2 py-1 text-[11px] text-foreground-muted transition hover:bg-surface-muted hover:text-foreground"
                              >
                                辞書
                              </button>
                              {group.colors.length > group.min && (
                                <button
                                  type="button"
                                  onClick={() => group.onRemove(index)}
                                  className="text-xs text-foreground-muted hover:text-danger"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            {matchedColorName && (
                              <p className="text-[11px] text-foreground-muted">
                                {matchedColorName}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 所属キャラクターの選択 */}
          <div className="border-b border-border-subtle px-4 py-3.5 sm:px-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground-muted">
                所属キャラクター（{selectedCharacterIds.length}人選択中）
              </span>
              {initialWorld && (
                <button
                  type="button"
                  onClick={() =>
                    requestNavigation(
                      `/characters/new?worldId=${initialWorld.id}`
                    )
                  }
                  className="rounded-lg border border-border-subtle bg-surface-muted/60 px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:bg-surface-muted"
                >
                  + キャラを新規作成
                </button>
              )}
            </div>

            {characters.length === 0 ? (
              <p className="text-xs text-foreground-muted">
                登録されているキャラクターがまだいません
              </p>
            ) : (
              <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-lg border border-border-subtle bg-background/40 p-2.5">
                {characters.map((char) => {
                  const checked = selectedCharacterIds.includes(char.id);
                  const otherWorld = getOtherWorldName(char.worldId);
                  return (
                    <label
                      key={char.id}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition hover:bg-surface-muted/60"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleCharacter(char.id)}
                          className="h-4 w-4 accent-accent"
                        />
                        <span
                          className="h-3 w-3 shrink-0 rounded-full border border-black/15"
                          style={{
                            backgroundColor: char.mainColors[0] ?? "#888888",
                          }}
                        />
                        <span className="font-medium text-foreground">
                          {char.name}
                        </span>
                      </div>
                      {otherWorld && (
                        <span className="truncate text-[11px] text-foreground-muted">
                          現在：{otherWorld}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ⊕ 設定の追加 ボタン */}
          <div className="border-b border-border-subtle px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={handleAddCustomField}
              disabled={customFields.length >= SETTING_LIMITS.CUSTOM_FIELDS_MAX}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:opacity-75 disabled:opacity-40"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-foreground text-xs">
                ＋
              </span>
              設定の追加
            </button>
          </div>

          {/* 追加された設定項目リスト */}
          {customFields.map((field) => (
            <div
              key={field.id}
              className="border-b border-border-subtle px-4 py-3.5 sm:px-6"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <input
                  type="text"
                  autoComplete="off"
                  data-lpignore="true"
                  maxLength={SETTING_LIMITS.FIELD_LABEL_MAX}
                  value={field.label}
                  onChange={(e) =>
                    handleFieldChange(field.id, "label", e.target.value)
                  }
                  aria-label="項目名"
                  placeholder="項目名"
                  className="flex-1 bg-transparent text-xs font-semibold text-foreground-muted outline-none focus:text-foreground"
                />
                <span className="text-[11px] text-foreground-muted">
                  {field.value.length} / {SETTING_LIMITS.FIELD_VALUE_MAX}
                </span>
                <button
                  type="button"
                  onClick={() => handleRequestRemoveField(field)}
                  className="text-xs text-foreground-muted hover:text-danger"
                >
                  削除
                </button>
              </div>
              <textarea
                rows={2}
                maxLength={SETTING_LIMITS.FIELD_VALUE_MAX}
                value={field.value}
                onChange={(e) =>
                  handleFieldChange(field.id, "value", e.target.value)
                }
                aria-label="設定内容"
                className="w-full resize-y bg-transparent text-sm text-foreground outline-none"
              />
            </div>
          ))}

          {errorMessage && (
            <div className="border-b border-border-subtle bg-danger/10 px-4 py-2.5 text-xs font-medium text-danger sm:px-6">
              {errorMessage}
            </div>
          )}

          {/* フッターアクション */}
          <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={handleCancelClick}
              className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-foreground-muted transition hover:bg-surface-muted hover:text-foreground"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              保存
            </button>
          </div>
        </form>

        {/* 2分割時の辞書パネル */}
        {dictOpen && (
          <aside className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border-subtle bg-surface p-4 shadow-sm lg:w-1/2">
            <div className="mb-3 flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="text-xs font-bold text-foreground">
                辞書パネル
              </span>
              <button
                type="button"
                onClick={() => setDictOpen(false)}
                className="text-xs text-foreground-muted hover:text-foreground"
              >
                ✕ 閉じる
              </button>
            </div>

            {dictCategory === "color" && (
              <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-lg bg-surface-muted/60 p-2 text-[11px]">
                <span className="font-semibold text-foreground-muted">
                  反映先：
                </span>
                {[
                  { group: "main" as const, index: 0, label: "メイン1" },
                  { group: "main" as const, index: 1, label: "メイン2" },
                  { group: "sub" as const, index: 0, label: "サブ1" },
                  { group: "sub" as const, index: 1, label: "サブ2" },
                ].map((slot) => {
                  const isActive =
                    colorTarget.group === slot.group &&
                    colorTarget.index === slot.index;
                  return (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() =>
                        setColorTarget({ group: slot.group, index: slot.index })
                      }
                      className={`rounded border px-2 py-0.5 transition ${
                        isActive
                          ? "border-accent bg-accent font-semibold text-accent-foreground"
                          : "border-border-subtle bg-surface text-foreground-muted hover:text-foreground"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            )}

            <DictionaryPanel
              category={dictCategory}
              allowCategorySwitch
              onCategoryChange={setDictCategory}
              onSelectColor={(hex) => handleSelectColorFromDict(hex)}
              compact
            />
          </aside>
        )}
      </div>

      {/* 未保存離脱確認ポップアップ */}
      {pendingNavHref && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="world-unsaved-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingNavHref(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-6 shadow-2xl">
            <h2
              id="world-unsaved-modal-title"
              className="mb-2 text-base font-bold text-foreground sm:text-lg"
            >
              編集中の内容を保存しますか？
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-foreground-muted">
              このまま移動すると、保存されていない変更内容は失われます。
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const target = pendingNavHref;
                  if (!saveWorld()) {
                    setPendingNavHref(null);
                    return;
                  }
                  registerGuard(null);
                  setPendingNavHref(null);
                  proceedNavigation(target);
                }}
                className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
              >
                保存して移動
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = pendingNavHref;
                  registerGuard(null);
                  setPendingNavHref(null);
                  proceedNavigation(target);
                }}
                className="w-full rounded-xl border border-border-subtle bg-surface-muted/60 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-surface-muted"
              >
                保存せずに移動
              </button>
              <button
                type="button"
                onClick={() => setPendingNavHref(null)}
                className="w-full rounded-xl border border-border-subtle px-4 py-2.5 text-sm text-foreground-muted transition hover:bg-surface-muted hover:text-foreground"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* カスタム項目削除確認ポップアップ */}
      {pendingDeleteField && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="world-delete-field-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingDeleteField(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-6 shadow-2xl">
            <h2
              id="world-delete-field-modal-title"
              className="mb-2 text-base font-bold text-foreground sm:text-lg"
            >
              項目の削除確認
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-foreground">
              「
              <span className="font-bold">
                {pendingDeleteField.label.trim() || "無題の項目"}
              </span>
              」を削除してもよろしいですか？
            </p>
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingDeleteField(null)}
                className="rounded-xl border border-border-subtle px-5 py-2.5 text-sm text-foreground-muted transition hover:bg-surface-muted hover:text-foreground"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveField}
                className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
