/**
 * MyOCBook で扱う世界観・キャラクター・カスタム項目の型定義と入力制限定数。
 */

/** ユーザーが自由に追加できる設定項目（項目名：内容） */
export interface CustomField {
  id: string;
  label: string;
  value: string;
}

/** 世界観データ */
export interface WorldCard {
  id: string;
  name: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

/** 世界観の作成・編集入力 */
export interface WorldCardInput {
  name: string;
  summary: string;
}

/** キャラクター（OC）データ */
export interface CharacterCard {
  id: string;
  name: string;
  worldId: string | null;
  birthday: string;
  gender: string;
  motif: string;
  mainColors: string[];
  subColors: string[];
  customFields: CustomField[];
  createdAt: string;
  updatedAt: string;
}

/** キャラクターの作成・編集入力 */
export interface CharacterCardInput {
  name: string;
  worldId: string | null;
  birthday: string;
  gender: string;
  motif: string;
  mainColors: string[];
  subColors: string[];
  customFields: CustomField[];
}

/** 長文アプリ化を防ぐための文字数・色数・項目数の上限 */
export const SETTING_LIMITS = {
  NAME_MAX: 50,
  SUMMARY_MAX: 100,
  BIRTHDAY_MAX: 30,
  GENDER_MAX: 30,
  MOTIF_MAX: 100,
  FIELD_LABEL_MAX: 30,
  FIELD_VALUE_MAX: 500,
  MAIN_COLORS_MIN: 1,
  MAIN_COLORS_MAX: 2,
  SUB_COLORS_MAX: 2,
  CUSTOM_FIELDS_MAX: 20,
} as const;
