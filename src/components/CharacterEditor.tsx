/**
 * キャラクター（OC）編集モードのノート風フォームコンポーネント。
 * 名前・所属世界・誕生日｜性別・モチーフ（カラー含む）・自由追加できる設定項目を扱います。
 */
"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  createCharacterCard,
  createId,
  getServerWorldsSnapshot,
  isValidHexColor,
  loadWorlds,
  subscribeData,
  updateCharacterCard,
  validateCharacterInput,
} from "@/lib/storage";
import {
  SETTING_LIMITS,
  type CharacterCard,
  type CharacterCardInput,
  type CustomField,
} from "@/types/setting";

interface CharacterEditorProps {
  /** 編集対象データ（新規作成時は null） */
  initialCharacter: CharacterCard | null;
  /** 保存・キャンセル時に一覧遷移の代わりに行うコールバック */
  onDone?: () => void;
}

type BirthdayMode = "ymd" | "free";

const DEFAULT_MAIN_COLOR = "#5c6b73";
const DEFAULT_SUB_COLOR = "#9db4c0";

/** 保存済みの誕生日文字列から初期表示モードと各値を復元します */
function parseBirthday(raw: string): {
  mode: BirthdayMode;
  year: string;
  month: string;
  day: string;
  free: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { mode: "ymd", year: "", month: "", day: "", free: "" };
  }
  const match = trimmed.match(/^(?:(.+?)年)?(?:(.+?)月)?(?:(.+?)日)?$/);
  if (match && (match[1] || match[2] || match[3])) {
    return {
      mode: "ymd",
      year: match[1] ?? "",
      month: match[2] ?? "",
      day: match[3] ?? "",
      free: trimmed,
    };
  }
  return { mode: "free", year: "", month: "", day: "", free: trimmed };
}

/** 誕生日モードと入力値から保存用の文字列を組み立てます */
function formatBirthday(
  mode: BirthdayMode,
  year: string,
  month: string,
  day: string,
  free: string
): string {
  if (mode === "free") return free.trim();
  const y = year.trim();
  const m = month.trim();
  const d = day.trim();
  return `${y ? `${y}年` : ""}${m ? `${m}月` : ""}${d ? `${d}日` : ""}`;
}

/** 16進コード入力用に、色見本として安全な値を返します */
function toSafePickerColor(color: string, fallback: string): string {
  return isValidHexColor(color) ? color : fallback;
}

export default function CharacterEditor({
  initialCharacter,
  onDone,
}: CharacterEditorProps) {
  const router = useRouter();
  const worlds = useSyncExternalStore(
    subscribeData,
    loadWorlds,
    getServerWorldsSnapshot
  );

  const initialBirthday = parseBirthday(initialCharacter?.birthday ?? "");

  const [name, setName] = useState<string>(initialCharacter?.name ?? "");
  const [worldId, setWorldId] = useState<string>(
    initialCharacter?.worldId ?? ""
  );
  const [birthdayMode, setBirthdayMode] = useState<BirthdayMode>(
    initialBirthday.mode
  );
  const [birthYear, setBirthYear] = useState<string>(initialBirthday.year);
  const [birthMonth, setBirthMonth] = useState<string>(initialBirthday.month);
  const [birthDay, setBirthDay] = useState<string>(initialBirthday.day);
  const [birthFree, setBirthFree] = useState<string>(initialBirthday.free);
  const [gender, setGender] = useState<string>(initialCharacter?.gender ?? "");
  const [motif, setMotif] = useState<string>(initialCharacter?.motif ?? "");
  const [mainColors, setMainColors] = useState<string[]>(
    initialCharacter?.mainColors.length
      ? initialCharacter.mainColors
      : [DEFAULT_MAIN_COLOR]
  );
  const [subColors, setSubColors] = useState<string[]>(
    initialCharacter?.subColors ?? []
  );
  const [customFields, setCustomFields] = useState<CustomField[]>(
    initialCharacter?.customFields ?? []
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentBirthday = formatBirthday(
    birthdayMode,
    birthYear,
    birthMonth,
    birthDay,
    birthFree
  );

  const handleSwitchBirthdayMode = (nextMode: BirthdayMode) => {
    if (nextMode === birthdayMode) return;
    if (nextMode === "free" && !birthFree.trim()) {
      setBirthFree(currentBirthday);
    }
    setBirthdayMode(nextMode);
  };

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

  const handleRemoveField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: CharacterCardInput = {
      name,
      worldId: worldId || null,
      birthday: currentBirthday,
      gender,
      motif,
      mainColors,
      subColors,
      customFields,
    };
    const error = validateCharacterInput(input);
    if (error) {
      setErrorMessage(error);
      return;
    }
    if (initialCharacter) {
      updateCharacterCard(initialCharacter.id, input);
    } else {
      createCharacterCard(input);
    }
    if (onDone) {
      onDone();
    } else {
      router.push("/characters");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border-subtle bg-surface shadow-sm"
    >
      {/* 名前 */}
      <div className="border-b border-border-subtle px-4 py-3.5 sm:px-6">
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor="char-name"
            className="text-xs font-semibold text-foreground-muted"
          >
            名前 <span className="text-danger">*</span>
          </label>
          <span className="text-[11px] text-foreground-muted">
            {name.length} / {SETTING_LIMITS.NAME_MAX}
          </span>
        </div>
        <input
          id="char-name"
          type="text"
          maxLength={SETTING_LIMITS.NAME_MAX}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          className="w-full bg-transparent text-base font-medium text-foreground outline-none"
        />
      </div>

      {/* 所属世界 */}
      <div className="border-b border-border-subtle px-4 py-3.5 sm:px-6">
        <label
          htmlFor="char-world"
          className="mb-1 block text-xs font-semibold text-foreground-muted"
        >
          所属世界
        </label>
        <select
          id="char-world"
          value={worldId}
          onChange={(e) => setWorldId(e.target.value)}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        >
          <option value="" className="bg-surface text-foreground">
            未設定
          </option>
          {worlds.map((world) => (
            <option
              key={world.id}
              value={world.id}
              className="bg-surface text-foreground"
            >
              {world.name}
            </option>
          ))}
        </select>
      </div>

      {/* 誕生日 ｜ 性別 */}
      <div className="grid grid-cols-1 border-b border-border-subtle sm:grid-cols-2">
        <div className="border-b border-border-subtle px-4 py-3.5 sm:border-r sm:border-b-0 sm:px-6">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground-muted">
              誕生日
            </span>
            <div className="inline-flex rounded-md border border-border-subtle bg-surface-muted/70 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleSwitchBirthdayMode("ymd")}
                className={`rounded px-2 py-0.5 transition ${
                  birthdayMode === "ymd"
                    ? "bg-surface font-semibold text-foreground shadow-xs"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                年月日
              </button>
              <button
                type="button"
                onClick={() => handleSwitchBirthdayMode("free")}
                className={`rounded px-2 py-0.5 transition ${
                  birthdayMode === "free"
                    ? "bg-surface font-semibold text-foreground shadow-xs"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                自由記述
              </button>
            </div>
          </div>

          {birthdayMode === "ymd" ? (
            <div className="flex flex-wrap items-center gap-1.5 text-sm text-foreground">
              <input
                type="text"
                aria-label="誕生年"
                maxLength={10}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="w-16 border-b border-border-subtle bg-transparent py-0.5 text-center text-sm text-foreground outline-none focus:border-foreground"
              />
              <span className="text-xs text-foreground-muted">年</span>
              <input
                type="text"
                aria-label="誕生月"
                maxLength={6}
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                className="w-12 border-b border-border-subtle bg-transparent py-0.5 text-center text-sm text-foreground outline-none focus:border-foreground"
              />
              <span className="text-xs text-foreground-muted">月</span>
              <input
                type="text"
                aria-label="誕生日"
                maxLength={6}
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                className="w-12 border-b border-border-subtle bg-transparent py-0.5 text-center text-sm text-foreground outline-none focus:border-foreground"
              />
              <span className="text-xs text-foreground-muted">日</span>
            </div>
          ) : (
            <input
              type="text"
              aria-label="誕生日（自由記述）"
              maxLength={SETTING_LIMITS.BIRTHDAY_MAX}
              value={birthFree}
              onChange={(e) => setBirthFree(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          )}
        </div>
        <div className="px-4 py-3.5 sm:px-6">
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="char-gender"
              className="text-xs font-semibold text-foreground-muted"
            >
              性別
            </label>
            <span className="text-[11px] text-foreground-muted">
              {gender.length} / {SETTING_LIMITS.GENDER_MAX}
            </span>
          </div>
          <input
            id="char-gender"
            type="text"
            maxLength={SETTING_LIMITS.GENDER_MAX}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none"
          />
        </div>
      </div>

      {/* モチーフ（テキスト・カラー） */}
      <div className="border-b border-border-subtle px-4 py-3.5 sm:px-6">
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor="char-motif"
            className="text-xs font-semibold text-foreground-muted"
          >
            モチーフ
          </label>
          <span className="text-[11px] text-foreground-muted">
            {motif.length} / {SETTING_LIMITS.MOTIF_MAX}
          </span>
        </div>
        <input
          id="char-motif"
          type="text"
          maxLength={SETTING_LIMITS.MOTIF_MAX}
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          className="mb-3 w-full bg-transparent text-sm text-foreground outline-none"
        />

        {/* カラー設定（メイン1〜2色 / サブ0〜2色） */}
        <div className="grid gap-3 rounded-lg bg-surface-muted/60 p-3 sm:grid-cols-2">
          {[
            {
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
              title: "サブカラー",
              colors: subColors,
              max: SETTING_LIMITS.SUB_COLORS_MAX,
              min: 0,
              fallback: DEFAULT_SUB_COLOR,
              onAdd: handleAddSubColor,
              onChange: handleSubColorChange,
              onRemove: handleRemoveSubColor,
            },
          ].map((group) => (
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
                <span className="text-[11px] text-foreground-muted">未設定</span>
              ) : (
                <div className="space-y-2">
                  {group.colors.map((color, index) => {
                    const safeColor = toSafePickerColor(color, group.fallback);
                    return (
                      <div
                        key={`${group.title}-${index}`}
                        className="flex items-center gap-2"
                      >
                        <label
                          className="relative flex h-8 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border-subtle shadow-xs"
                          style={{ backgroundColor: safeColor }}
                          title="クリックして色を選択"
                        >
                          <input
                            type="color"
                            value={safeColor}
                            aria-label={`${group.title}${index + 1}`}
                            onChange={(e) => group.onChange(index, e.target.value)}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </label>
                        <input
                          type="text"
                          value={color}
                          maxLength={7}
                          aria-label={`${group.title}${index + 1}コード`}
                          onChange={(e) => group.onChange(index, e.target.value)}
                          className="w-20 rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-xs uppercase text-foreground outline-none focus:border-foreground"
                        />
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
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
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
              onClick={() => handleRemoveField(field.id)}
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
          onClick={() => (onDone ? onDone() : router.push("/characters"))}
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
  );
}
