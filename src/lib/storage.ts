/**
 * ローカル保存（localStorage）とバリデーション処理。
 * 世界観とキャラクターのデータを管理し、useSyncExternalStore 用の購読機能を提供します。
 */
import {
  SETTING_LIMITS,
  type CharacterCard,
  type CharacterCardInput,
  type CustomField,
  type WorldCard,
  type WorldCardInput,
} from "@/types/setting";

const WORLDS_KEY = "myocbook_worlds_v1";
const CHARACTERS_KEY = "myocbook_characters_v1";
const DATA_EVENT = "myocbook-data-changed";

const EMPTY_WORLDS: WorldCard[] = [];
const EMPTY_CHARACTERS: CharacterCard[] = [];

let cachedWorldsRaw: string | null = null;
let cachedWorlds: WorldCard[] = EMPTY_WORLDS;

let cachedCharactersRaw: string | null = null;
let cachedCharacters: CharacterCard[] = EMPTY_CHARACTERS;

/** ユニークIDを生成します */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 16進カラーコード（#RRGGBB）の形式を検証します */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color);
}

/** 世界観入力のバリデーションを行います */
export function validateWorldInput(input: WorldCardInput): string | null {
  const trimmed = input.name.trim();
  if (trimmed.length === 0) {
    return "世界名を入力してください。";
  }
  if (trimmed.length > SETTING_LIMITS.NAME_MAX) {
    return `世界名は${SETTING_LIMITS.NAME_MAX}文字以内で入力してください。`;
  }
  if (input.summary.length > SETTING_LIMITS.SUMMARY_MAX) {
    return `概要は${SETTING_LIMITS.SUMMARY_MAX}文字以内で入力してください。`;
  }
  return null;
}

/** キャラクター入力のバリデーションを行います */
export function validateCharacterInput(input: CharacterCardInput): string | null {
  const trimmed = input.name.trim();
  if (trimmed.length === 0) {
    return "名前を入力してください。";
  }
  if (trimmed.length > SETTING_LIMITS.NAME_MAX) {
    return `名前は${SETTING_LIMITS.NAME_MAX}文字以内で入力してください。`;
  }
  if (input.nameKana.length > SETTING_LIMITS.NAME_KANA_MAX) {
    return `ふりがなは${SETTING_LIMITS.NAME_KANA_MAX}文字以内で入力してください。`;
  }
  if (input.birthday.length > SETTING_LIMITS.BIRTHDAY_MAX) {
    return `誕生日は${SETTING_LIMITS.BIRTHDAY_MAX}文字以内で入力してください。`;
  }
  if (input.age.length > SETTING_LIMITS.AGE_MAX) {
    return `年齢は${SETTING_LIMITS.AGE_MAX}文字以内で入力してください。`;
  }
  if (input.gender.length > SETTING_LIMITS.GENDER_MAX) {
    return `性別は${SETTING_LIMITS.GENDER_MAX}文字以内で入力してください。`;
  }
  if (input.motif.length > SETTING_LIMITS.MOTIF_MAX) {
    return `モチーフは${SETTING_LIMITS.MOTIF_MAX}文字以内で入力してください。`;
  }
  if (
    input.mainColors.length < SETTING_LIMITS.MAIN_COLORS_MIN ||
    input.mainColors.length > SETTING_LIMITS.MAIN_COLORS_MAX
  ) {
    return `メインカラーは${SETTING_LIMITS.MAIN_COLORS_MIN}〜${SETTING_LIMITS.MAIN_COLORS_MAX}色で指定してください。`;
  }
  if (input.subColors.length > SETTING_LIMITS.SUB_COLORS_MAX) {
    return `サブカラーは最大${SETTING_LIMITS.SUB_COLORS_MAX}色までです。`;
  }
  if (![...input.mainColors, ...input.subColors].every(isValidHexColor)) {
    return "カラーコードの形式が正しくありません。";
  }
  for (const field of input.customFields) {
    if (field.label.length > SETTING_LIMITS.FIELD_LABEL_MAX) {
      return `項目名は${SETTING_LIMITS.FIELD_LABEL_MAX}文字以内で入力してください。`;
    }
    if (field.value.length > SETTING_LIMITS.FIELD_VALUE_MAX) {
      return `設定内容は${SETTING_LIMITS.FIELD_VALUE_MAX}文字以内で入力してください。`;
    }
  }
  return null;
}

function sanitizeCustomFields(fields: CustomField[]): CustomField[] {
  return fields
    .map((f) => ({
      id: f.id,
      label: f.label.trim().slice(0, SETTING_LIMITS.FIELD_LABEL_MAX),
      value: f.value.trim().slice(0, SETTING_LIMITS.FIELD_VALUE_MAX),
    }))
    .filter((f) => f.label.length > 0 || f.value.length > 0)
    .slice(0, SETTING_LIMITS.CUSTOM_FIELDS_MAX);
}

/** ストレージ変更の購読（useSyncExternalStore 用） */
export function subscribeData(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handleStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === WORLDS_KEY || e.key === CHARACTERS_KEY) {
      onStoreChange();
    }
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(DATA_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(DATA_EVENT, onStoreChange);
  };
}

/** 世界観一覧を読み込みます */
export function loadWorlds(): WorldCard[] {
  if (typeof window === "undefined") return EMPTY_WORLDS;
  try {
    const raw = window.localStorage.getItem(WORLDS_KEY);
    if (!raw) {
      cachedWorldsRaw = null;
      cachedWorlds = EMPTY_WORLDS;
      return EMPTY_WORLDS;
    }
    if (raw === cachedWorldsRaw) return cachedWorlds;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_WORLDS;
    cachedWorldsRaw = raw;
    cachedWorlds = parsed as WorldCard[];
    return cachedWorlds;
  } catch {
    return EMPTY_WORLDS;
  }
}

export function getServerWorldsSnapshot(): WorldCard[] {
  return EMPTY_WORLDS;
}

function saveWorlds(worlds: WorldCard[]): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(worlds);
  window.localStorage.setItem(WORLDS_KEY, serialized);
  cachedWorldsRaw = serialized;
  cachedWorlds = worlds;
  window.dispatchEvent(new Event(DATA_EVENT));
}

export function createWorldCard(input: WorldCardInput): WorldCard {
  const now = new Date().toISOString();
  const card: WorldCard = {
    id: createId(),
    name: input.name.trim().slice(0, SETTING_LIMITS.NAME_MAX),
    summary: input.summary.trim().slice(0, SETTING_LIMITS.SUMMARY_MAX),
    createdAt: now,
    updatedAt: now,
  };
  saveWorlds([card, ...loadWorlds()]);
  return card;
}

export function updateWorldCard(id: string, input: WorldCardInput): void {
  const now = new Date().toISOString();
  const updated = loadWorlds().map((w) =>
    w.id === id
      ? {
          ...w,
          name: input.name.trim().slice(0, SETTING_LIMITS.NAME_MAX),
          summary: input.summary.trim().slice(0, SETTING_LIMITS.SUMMARY_MAX),
          updatedAt: now,
        }
      : w
  );
  saveWorlds(updated);
}

/** 世界観を削除します。deleteAssignedCharacters が true の場合は所属キャラクターも削除します */
export function deleteWorldCard(
  id: string,
  deleteAssignedCharacters = false
): void {
  saveWorlds(loadWorlds().filter((w) => w.id !== id));
  const currentChars = loadCharacters();
  const updatedChars = deleteAssignedCharacters
    ? currentChars.filter((c) => c.worldId !== id)
    : currentChars.map((c) => (c.worldId === id ? { ...c, worldId: null } : c));
  saveCharacters(updatedChars);
}

/** キャラクター一覧を読み込みます */
export function loadCharacters(): CharacterCard[] {
  if (typeof window === "undefined") return EMPTY_CHARACTERS;
  try {
    const raw = window.localStorage.getItem(CHARACTERS_KEY);
    if (!raw) {
      cachedCharactersRaw = null;
      cachedCharacters = EMPTY_CHARACTERS;
      return EMPTY_CHARACTERS;
    }
    if (raw === cachedCharactersRaw) return cachedCharacters;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_CHARACTERS;
    cachedCharactersRaw = raw;
    cachedCharacters = parsed as CharacterCard[];
    return cachedCharacters;
  } catch {
    return EMPTY_CHARACTERS;
  }
}

export function getServerCharactersSnapshot(): CharacterCard[] {
  return EMPTY_CHARACTERS;
}

function saveCharacters(characters: CharacterCard[]): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(characters);
  window.localStorage.setItem(CHARACTERS_KEY, serialized);
  cachedCharactersRaw = serialized;
  cachedCharacters = characters;
  window.dispatchEvent(new Event(DATA_EVENT));
}

export function createCharacterCard(input: CharacterCardInput): CharacterCard {
  const now = new Date().toISOString();
  const card: CharacterCard = {
    id: createId(),
    name: input.name.trim().slice(0, SETTING_LIMITS.NAME_MAX),
    nameKana: input.nameKana.trim().slice(0, SETTING_LIMITS.NAME_KANA_MAX),
    worldId: input.worldId,
    birthday: input.birthday.trim().slice(0, SETTING_LIMITS.BIRTHDAY_MAX),
    age: input.age.trim().slice(0, SETTING_LIMITS.AGE_MAX),
    gender: input.gender.trim().slice(0, SETTING_LIMITS.GENDER_MAX),
    motif: input.motif.trim().slice(0, SETTING_LIMITS.MOTIF_MAX),
    mainColors: input.mainColors.slice(0, SETTING_LIMITS.MAIN_COLORS_MAX),
    subColors: input.subColors.slice(0, SETTING_LIMITS.SUB_COLORS_MAX),
    customFields: sanitizeCustomFields(input.customFields),
    createdAt: now,
    updatedAt: now,
  };
  saveCharacters([card, ...loadCharacters()]);
  return card;
}

export function updateCharacterCard(id: string, input: CharacterCardInput): void {
  const now = new Date().toISOString();
  const updated = loadCharacters().map((c) =>
    c.id === id
      ? {
          ...c,
          name: input.name.trim().slice(0, SETTING_LIMITS.NAME_MAX),
          nameKana: input.nameKana.trim().slice(0, SETTING_LIMITS.NAME_KANA_MAX),
          worldId: input.worldId,
          birthday: input.birthday.trim().slice(0, SETTING_LIMITS.BIRTHDAY_MAX),
          age: input.age.trim().slice(0, SETTING_LIMITS.AGE_MAX),
          gender: input.gender.trim().slice(0, SETTING_LIMITS.GENDER_MAX),
          motif: input.motif.trim().slice(0, SETTING_LIMITS.MOTIF_MAX),
          mainColors: input.mainColors.slice(0, SETTING_LIMITS.MAIN_COLORS_MAX),
          subColors: input.subColors.slice(0, SETTING_LIMITS.SUB_COLORS_MAX),
          customFields: sanitizeCustomFields(input.customFields),
          updatedAt: now,
        }
      : c
  );
  saveCharacters(updated);
}

export function deleteCharacterCard(id: string): void {
  saveCharacters(loadCharacters().filter((c) => c.id !== id));
}
