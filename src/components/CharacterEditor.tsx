/**
 * キャラクター（OC）編集モードのノート風フォームコンポーネント。
 * 名前・所属世界・誕生日｜性別・モチーフ（カラー含む）・自由追加できる設定項目を扱います。
 */
"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import DictionaryPanel from "@/components/DictionaryPanel";
import { useNavigationGuard } from "@/components/NavigationGuardContext";
import { findColorNameByHex, type CategoryKey } from "@/data/dictionaries";
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
  getServerUserSettingsSnapshot,
  loadUserSettings,
  subscribeUserSettings,
} from "@/lib/userSettings";
import {
  SETTING_LIMITS,
  type CharacterCard,
  type CharacterCardInput,
  type CustomField,
} from "@/types/setting";

interface CharacterEditorProps {
  /** 編集対象データ（新規作成時は null） */
  initialCharacter: CharacterCard | null;
  /** 新規作成時に初期選択する所属世界ID */
  defaultWorldId?: string;
  /** 保存・キャンセル時に一覧遷移の代わりに行うコールバック */
  onDone?: () => void;
}

type BirthdayMode = "ymd" | "free";
type ColorTarget = { group: "main" | "sub"; index: number };

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
  defaultWorldId = "",
  onDone,
}: CharacterEditorProps) {
  const router = useRouter();
  const { registerGuard } = useNavigationGuard();
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

  const initialBirthday = parseBirthday(initialCharacter?.birthday ?? "");

  const [name, setName] = useState<string>(initialCharacter?.name ?? "");
  const [nameKana, setNameKana] = useState<string>(
    initialCharacter?.nameKana ?? ""
  );
  const [worldId, setWorldId] = useState<string>(
    initialCharacter?.worldId ?? defaultWorldId
  );
  const [birthdayMode, setBirthdayMode] = useState<BirthdayMode>(
    initialBirthday.mode
  );
  const [birthYear, setBirthYear] = useState<string>(initialBirthday.year);
  const [birthMonth, setBirthMonth] = useState<string>(initialBirthday.month);
  const [birthDay, setBirthDay] = useState<string>(initialBirthday.day);
  const [birthFree, setBirthFree] = useState<string>(initialBirthday.free);
  const [age, setAge] = useState<string>(initialCharacter?.age ?? "");
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
  const [dictOpen, setDictOpen] = useState<boolean>(false);
  const [dictCategory, setDictCategory] = useState<CategoryKey>("flower");
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
        name: initialCharacter?.name ?? "",
        nameKana: initialCharacter?.nameKana ?? "",
        worldId: initialCharacter?.worldId ?? defaultWorldId,
        birthday: parseBirthday(initialCharacter?.birthday ?? ""),
        age: initialCharacter?.age ?? "",
        gender: initialCharacter?.gender ?? "",
        motif: initialCharacter?.motif ?? "",
        mainColors: initialCharacter?.mainColors.length
          ? initialCharacter.mainColors
          : [DEFAULT_MAIN_COLOR],
        subColors: initialCharacter?.subColors ?? [],
        customFields: initialCharacter?.customFields ?? [],
      }),
    [initialCharacter, defaultWorldId]
  );

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        name,
        nameKana,
        worldId,
        birthday: {
          mode: birthdayMode,
          year: birthYear,
          month: birthMonth,
          day: birthDay,
          free: birthFree,
        },
        age,
        gender,
        motif,
        mainColors,
        subColors,
        customFields,
      }),
    [
      name,
      nameKana,
      worldId,
      birthdayMode,
      birthYear,
      birthMonth,
      birthDay,
      birthFree,
      age,
      gender,
      motif,
      mainColors,
      subColors,
      customFields,
    ]
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

  const handleOpenCategoryDictionary = (category: CategoryKey) => {
    setDictCategory(category);
    setDictOpen(true);
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

  const handleSelectMotifFromDict = (text: string) => {
    setMotif((prev) => {
      const current = prev.trim();
      const next = current ? `${current} / ${text}` : text;
      return next.slice(0, SETTING_LIMITS.MOTIF_MAX);
    });
  };

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

  const saveCharacter = (): boolean => {
    const input: CharacterCardInput = {
      name,
      nameKana,
      worldId: worldId || null,
      birthday: currentBirthday,
      age,
      gender,
      motif,
      mainColors,
      subColors,
      customFields,
    };
    const error = validateCharacterInput(input);
    if (error) {
      setErrorMessage(error);
      return false;
    }
    if (initialCharacter) {
      updateCharacterCard(initialCharacter.id, input);
    } else {
      createCharacterCard(input);
    }
    return true;
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
    if (!saveCharacter()) return;
    registerGuard(null);
    if (onDone) {
      onDone();
    } else {
      router.push("/characters");
    }
  };

  const handleCancelClick = () => {
    const target = onDone ? "__CANCEL_DONE__" : "/characters";
    if (isDirty) {
      setPendingNavHref(target);
      return;
    }
    proceedNavigation(target);
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
          dictOpen
            ? `flex min-h-0 flex-1 gap-3 ${splitDirectionClass}`
            : "block"
        }
      >
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className={`rounded-xl border border-border-subtle bg-surface shadow-sm ${
            dictOpen
              ? "min-h-0 flex-1 overflow-y-auto lg:w-1/2"
              : "w-full"
          }`}
        >
      {/* 名前・ふりがな */}
      <div className="space-y-3 border-b border-border-subtle px-4 py-3.5 sm:px-6">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="oc-field-title"
              className="text-xs font-semibold text-foreground-muted"
            >
              名前 <span className="text-danger">*</span>
            </label>
            <span className="text-[11px] text-foreground-muted">
              {name.length} / {SETTING_LIMITS.NAME_MAX}
            </span>
          </div>
          <input
            id="oc-field-title"
            name="oc-field-title"
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

        <div className="border-t border-border-subtle/60 pt-2.5">
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="oc-field-kana"
              className="text-xs font-semibold text-foreground-muted"
            >
              ふりがな
            </label>
            <span className="text-[11px] text-foreground-muted">
              {nameKana.length} / {SETTING_LIMITS.NAME_KANA_MAX}
            </span>
          </div>
          <input
            id="oc-field-kana"
            name="oc-field-kana"
            type="text"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            maxLength={SETTING_LIMITS.NAME_KANA_MAX}
            value={nameKana}
            onChange={(e) => setNameKana(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none"
          />
        </div>
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

      {/* 誕生日 ｜ 年齢 ｜ 性別 */}
      <div className="grid grid-cols-1 border-b border-border-subtle sm:grid-cols-3">
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
            <div className="flex flex-wrap items-center gap-1 text-sm text-foreground">
              <input
                type="text"
                aria-label="誕生年"
                autoComplete="off"
                data-lpignore="true"
                maxLength={10}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="w-12 border-b border-border-subtle bg-transparent py-0.5 text-center text-sm text-foreground outline-none focus:border-foreground"
              />
              <span className="text-xs text-foreground-muted">年</span>
              <input
                type="text"
                aria-label="誕生月"
                autoComplete="off"
                data-lpignore="true"
                maxLength={6}
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                className="w-10 border-b border-border-subtle bg-transparent py-0.5 text-center text-sm text-foreground outline-none focus:border-foreground"
              />
              <span className="text-xs text-foreground-muted">月</span>
              <input
                type="text"
                aria-label="誕生日"
                autoComplete="off"
                data-lpignore="true"
                maxLength={6}
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                className="w-10 border-b border-border-subtle bg-transparent py-0.5 text-center text-sm text-foreground outline-none focus:border-foreground"
              />
              <span className="text-xs text-foreground-muted">日</span>
            </div>
          ) : (
            <input
              type="text"
              aria-label="誕生日（自由記述）"
              autoComplete="off"
              data-lpignore="true"
              maxLength={SETTING_LIMITS.BIRTHDAY_MAX}
              value={birthFree}
              onChange={(e) => setBirthFree(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          )}
        </div>

        {/* 年齢 */}
        <div className="border-b border-border-subtle px-4 py-3.5 sm:border-r sm:border-b-0 sm:px-6">
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="oc-field-age"
              className="text-xs font-semibold text-foreground-muted"
            >
              年齢
            </label>
            <span className="text-[11px] text-foreground-muted">
              {age.length} / {SETTING_LIMITS.AGE_MAX}
            </span>
          </div>
          <input
            id="oc-field-age"
            name="oc-field-age"
            type="text"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            maxLength={SETTING_LIMITS.AGE_MAX}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none"
          />
        </div>

        {/* 性別（ワンタップ + 自由記述） */}
        <div className="px-4 py-3.5 sm:px-6">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label
              htmlFor="oc-field-gender"
              className="text-xs font-semibold text-foreground-muted"
            >
              性別
            </label>
            <div className="flex items-center gap-1">
              {(["女性", "男性"] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setGender((prev) => (prev === preset ? "" : preset))
                  }
                  className={`rounded border px-2 py-0.5 text-[11px] transition ${
                    gender === preset
                      ? "border-accent bg-accent font-semibold text-accent-foreground"
                      : "border-border-subtle bg-surface-muted/60 text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <input
            id="oc-field-gender"
            name="oc-field-gender"
            type="text"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            maxLength={SETTING_LIMITS.GENDER_MAX}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none"
          />
        </div>
      </div>

      {/* モチーフ（テキスト・カラー） */}
      <div className="border-b border-border-subtle px-4 py-3.5 sm:px-6">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <label
              htmlFor="oc-field-motif"
              className="text-xs font-semibold text-foreground-muted"
            >
              モチーフ
            </label>
            {(
              [
                { key: "flower", label: "花" },
                { key: "stone", label: "石" },
                { key: "constellation", label: "星" },
                { key: "idea", label: "アイデア" },
              ] as const
            ).map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => handleOpenCategoryDictionary(btn.key)}
                className="rounded border border-border-subtle bg-surface-muted/60 px-2 py-0.5 text-[11px] text-foreground-muted transition hover:bg-surface-muted hover:text-foreground"
              >
                {btn.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-foreground-muted">
            {motif.length} / {SETTING_LIMITS.MOTIF_MAX}
          </span>
        </div>
        <input
          id="oc-field-motif"
          name="oc-field-motif"
          type="text"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          maxLength={SETTING_LIMITS.MOTIF_MAX}
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          className="mb-3 w-full bg-transparent text-sm text-foreground outline-none"
        />

        {/* カラー設定（メイン1〜2色 / サブ0〜2色） */}
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
                <span className="text-[11px] text-foreground-muted">未設定</span>
              ) : (
                <div className="space-y-2">
                  {group.colors.map((color, index) => {
                    const safeColor = toSafePickerColor(color, group.fallback);
                    const matchedColorName = userSettings.showColorName
                      ? findColorNameByHex(color)
                      : null;
                    return (
                      <div key={`${group.title}-${index}`} className="space-y-1">
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
              onSelectMotif={handleSelectMotifFromDict}
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
          aria-labelledby="unsaved-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingNavHref(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-6 shadow-2xl">
            <h2
              id="unsaved-modal-title"
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
                  if (!saveCharacter()) {
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
          aria-labelledby="delete-field-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingDeleteField(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-6 shadow-2xl">
            <h2
              id="delete-field-modal-title"
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
