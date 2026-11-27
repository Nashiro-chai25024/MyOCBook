/**
 * 誕生花・花個紋など諸説ある情報や詳細解説を、外部検索で安全に調べるためのURL生成ヘルパー。
 */

/**
 * 指定された月・日から誕生花を検索するURLを生成します。
 */
export function buildBirthFlowerSearchUrl(month: string, day: string): string {
  const m = month.trim();
  const d = day.trim();
  const datePart = [m ? `${m}月` : "", d ? `${d}日` : ""].join("");
  const query = datePart ? `${datePart} 誕生花 花言葉` : "誕生花 花言葉";
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * 指定された月・日から花個紋を検索するURLを生成します。
 */
export function buildHanakomonSearchUrl(month: string, day: string): string {
  const m = month.trim();
  const d = day.trim();
  const datePart = [m ? `${m}月` : "", d ? `${d}日` : ""].join("");
  const query = datePart ? `${datePart} 花個紋` : "花個紋";
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * 任意のキーワードとトピックで外部検索するURLを生成します。
 */
export function buildKeywordSearchUrl(keyword: string, topic = ""): string {
  const q = [keyword.trim(), topic.trim()].filter(Boolean).join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(q || "創作 モチーフ")}`;
}
