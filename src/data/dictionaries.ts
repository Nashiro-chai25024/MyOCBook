/**
 * アプリ内蔵の辞書データ定義（花・石・星・色・アイデア）。
 * 一般的な事実や単語レベルの知識のみを収録し、随時追加・更新しやすい構造にしています。
 */

export type CategoryKey =
  | "flower"
  | "stone"
  | "constellation"
  | "color"
  | "idea";

export interface DictionaryRow {
  col1: string;
  col2: string;
  col3: string;
  colorHex?: string;
}

export interface CategoryConfig {
  title: string;
  headers: [string, string, string];
  rows: DictionaryRow[];
}

export const DICTIONARY_CONFIG: Record<CategoryKey, CategoryConfig> = {
  flower: {
    title: "辞書 - 花",
    headers: ["花の名前", "色", "花言葉"],
    rows: [
      { col1: "スノードロップ", col2: "白", col3: "希望 / 慰め", colorHex: "#f5f5f5" },
      { col1: "スイセン", col2: "白・黄", col3: "自己愛 / 神秘 / 尊敬", colorHex: "#f4e87c" },
      { col1: "ウメ", col2: "紅・白", col3: "高潔 / 忍耐 / 忠実", colorHex: "#d94e67" },
      { col1: "スミレ", col2: "紫・白", col3: "謙虚 / 誠実 / 小さな幸せ", colorHex: "#7058a3" },
      { col1: "サクラ", col2: "淡紅", col3: "精神美 / 優美な女性", colorHex: "#f4c2c2" },
      { col1: "チューリップ", col2: "赤・黄・白", col3: "思いやり / 博愛", colorHex: "#e85a4f" },
      { col1: "ネモフィラ", col2: "青", col3: "可憐 / どこでも成功", colorHex: "#6ea8fe" },
      { col1: "スズラン", col2: "白", col3: "純粋 / 再び幸せが訪れる", colorHex: "#f7f7f7" },
      { col1: "フジ", col2: "紫・白", col3: "優しさ / 歓迎 / 決して離れない", colorHex: "#9b8bc2" },
      { col1: "バラ（赤）", col2: "赤", col3: "愛情 / 美 / 情熱", colorHex: "#c9171e" },
      { col1: "バラ（白）", col2: "白", col3: "純潔 / 深い尊敬", colorHex: "#fafafa" },
      { col1: "バラ（青）", col2: "青", col3: "夢かなう / 奇跡 / 神の祝福", colorHex: "#3a6ea5" },
      { col1: "アネモネ", col2: "赤・紫・白", col3: "はかない恋 / 期待", colorHex: "#c94a5a" },
      { col1: "アジサイ", col2: "青・紫・白", col3: "移り気 / 辛抱強い愛 / 家族団らん", colorHex: "#7d9ec0" },
      { col1: "ユリ（白）", col2: "白", col3: "純粋 / 無垢 / 威厳", colorHex: "#f8f9fa" },
      { col1: "ラベンダー", col2: "紫", col3: "沈黙 / 期待 / 清潔", colorHex: "#967bb6" },
      { col1: "ヒマワリ", col2: "黄", col3: "憧れ / 情熱 / あなただけを見つめる", colorHex: "#e6b422" },
      { col1: "アサガオ", col2: "青・紫・紅", col3: "愛情 / 結束 / はかない恋", colorHex: "#4d648d" },
      { col1: "キキョウ", col2: "青紫・白", col3: "永遠の愛 / 誠実 / 気品", colorHex: "#5654a2" },
      { col1: "コスモス", col2: "桃・白・赤", col3: "調和 / 謙虚 / 乙女の純潔", colorHex: "#e88ca5" },
      { col1: "ヒガンバナ", col2: "赤・白", col3: "情熱 / 独立 / 再会 / あきらめ", colorHex: "#c9171e" },
      { col1: "キンモクセイ", col2: "橙", col3: "謙虚 / 気高い人 / 真実", colorHex: "#eb7a34" },
      { col1: "ダリア", col2: "赤・白・黄", col3: "華麗 / 優雅 / 気品", colorHex: "#b7282e" },
      { col1: "ツバキ", col2: "赤・白", col3: "控えめな優しさ / 誇り", colorHex: "#b7282e" },
      { col1: "シクラメン", col2: "紅・白・桃", col3: "遠慮 / 気後れ / 内気", colorHex: "#d93b65" },
    ],
  },
  stone: {
    title: "辞書 - 石",
    headers: ["石の名前", "誕生月・分類", "石言葉・意味"],
    rows: [
      { col1: "ガーネット", col2: "1月", col3: "真実 / 友愛 / 忠実 / 情熱", colorHex: "#7b1c26" },
      { col1: "アメジスト", col2: "2月", col3: "誠実 / 心の平和 / 高貴", colorHex: "#7a4988" },
      { col1: "アクアマリン", col2: "3月", col3: "沈着 / 勇敢 / 聡明", colorHex: "#7ec8e3" },
      { col1: "サンゴ（コーラル）", col2: "3月", col3: "長寿 / 幸福 / 聡明", colorHex: "#e86f5c" },
      { col1: "ダイヤモンド", col2: "4月", col3: "清浄無垢 / 永遠の絆 / 不屈", colorHex: "#e8ecef" },
      { col1: "モルガナイト", col2: "4月", col3: "愛情 / 清純 / 優美", colorHex: "#f2c1c8" },
      { col1: "エメラルド", col2: "5月", col3: "幸運 / 幸福 / 希望", colorHex: "#2e8b57" },
      { col1: "ヒスイ（ジェイド）", col2: "5月", col3: "長寿 / 安定 / 知恵", colorHex: "#388e5a" },
      { col1: "パール（真珠）", col2: "6月", col3: "健康 / 純粋 / 長寿 / 富", colorHex: "#f0eee9" },
      { col1: "ムーンストーン", col2: "6月", col3: "健康 / 幸運 / 恋の予感", colorHex: "#dce2eb" },
      { col1: "ルビー", col2: "7月", col3: "情熱 / 仁愛 / 威厳", colorHex: "#9b111e" },
      { col1: "ペリドット", col2: "8月", col3: "夫婦の愛 / 平和 / 希望", colorHex: "#8db600" },
      { col1: "サファイア", col2: "9月", col3: "慈愛 / 誠実 / 徳望", colorHex: "#1d4e89" },
      { col1: "オパール", col2: "10月", col3: "希望 / 無邪気 / 潔白", colorHex: "#e6ebe8" },
      { col1: "トルマリン", col2: "10月", col3: "希望 / 潔白 / 寛大", colorHex: "#d65d7a" },
      { col1: "トパーズ", col2: "11月", col3: "友情 / 希望 / 潔白", colorHex: "#e5a93c" },
      { col1: "シトリン", col2: "11月", col3: "繁栄 / 希望 / 友愛", colorHex: "#e49b0f" },
      { col1: "ターコイズ", col2: "12月", col3: "成功 / 繁栄 / 旅の安全", colorHex: "#30a5a5" },
      { col1: "ラピスラズリ", col2: "12月", col3: "成功の保証 / 真実 / 健康", colorHex: "#26499d" },
      { col1: "タンザナイト", col2: "12月", col3: "高貴 / 冷静 / 誇り高い人", colorHex: "#4b55a2" },
      { col1: "オニキス", col2: "鉱物", col3: "厄除け / 成功 / 忍耐", colorHex: "#232323" },
      { col1: "フローライト", col2: "鉱物", col3: "知性 / 集中力 / 自由", colorHex: "#5d9b84" },
    ],
  },
  constellation: {
    title: "辞書 - 星",
    headers: ["星座・星", "時期・分類", "キーワード・特徴"],
    rows: [
      { col1: "おひつじ座", col2: "3/21 - 4/19", col3: "火 / 開拓 / 行動力 / 直感" },
      { col1: "おうし座", col2: "4/20 - 5/20", col3: "地 / 安定 / 感覚 / 忍耐" },
      { col1: "ふたご座", col2: "5/21 - 6/21", col3: "風 / 知性 / 二面性 / 好奇心" },
      { col1: "かに座", col2: "6/22 - 7/22", col3: "水 / 繊細 / 保護 / 感受性" },
      { col1: "しし座", col2: "7/23 - 8/22", col3: "火 / 誇り / 表現力 / 中心" },
      { col1: "おとめ座", col2: "8/23 - 9/22", col3: "地 / 分析 / 誠実 / 秩序" },
      { col1: "てんびん座", col2: "9/23 - 10/23", col3: "風 / 調和 / 均衡 / 美意識" },
      { col1: "さそり座", col2: "10/24 - 11/22", col3: "水 / 探求 / 情念 / 集中" },
      { col1: "いて座", col2: "11/23 - 12/21", col3: "火 / 自由 / 冒険 / 理想" },
      { col1: "やぎ座", col2: "12/22 - 1/19", col3: "地 / 堅実 / 責任 / 達成" },
      { col1: "みずがめ座", col2: "1/20 - 2/18", col3: "風 / 独創 / 革新 / 博愛" },
      { col1: "うお座", col2: "2/19 - 3/20", col3: "水 / 共感 / 幻想 / 包容" },
      { col1: "シリウス", col2: "恒星（冬）", col3: "おおいぬ座 / 全天で最も明るい恒星" },
      { col1: "ポラリス", col2: "恒星（北天）", col3: "こぐま座 / 北極星 / 道標" },
      { col1: "ベガ", col2: "恒星（夏）", col3: "こと座 / 織姫星 / 青白い輝き" },
      { col1: "アルタイル", col2: "恒星（夏）", col3: "わし座 / 彦星 / 飛翔" },
      { col1: "デネブ", col2: "恒星（夏）", col3: "はくちょう座 / 夏の大三角 / 尾" },
      { col1: "スピカ", col2: "恒星（春）", col3: "おとめ座 / 真珠星 / 麦の穂" },
      { col1: "アンタレス", col2: "恒星（夏）", col3: "さそり座 / 赤色超巨星 / 心臓" },
      { col1: "リゲル", col2: "恒星（冬）", col3: "オリオン座 / 青白く明るい星" },
      { col1: "ベテルギウス", col2: "恒星（冬）", col3: "オリオン座 / 赤い一等星" },
    ],
  },
  color: {
    title: "辞書 - 色",
    headers: ["色の名前", "コード", "イメージ・分類"],
    rows: [
      { col1: "茜色（あかねいろ）", col2: "#b7282e", col3: "和名 / 夕暮れのような深い赤", colorHex: "#b7282e" },
      { col1: "緋色（ひいろ）", col2: "#d3381c", col3: "和名 / 鮮やかで強い赤", colorHex: "#d3381c" },
      { col1: "桜色（さくらいろ）", col2: "#fef4f4", col3: "和名 / 淡くやさしい桃色", colorHex: "#fef4f4" },
      { col1: "珊瑚色（さんごいろ）", col2: "#f5b1aa", col3: "和名 / あたたかい淡紅", colorHex: "#f5b1aa" },
      { col1: "山吹色（やまぶきいろ）", col2: "#f8b500", col3: "和名 / 鮮やかな黄金寄りの黄", colorHex: "#f8b500" },
      { col1: "鬱金色（うこんいろ）", col2: "#fabf14", col3: "和名 / 明るく温かな黄色", colorHex: "#fabf14" },
      { col1: "若草色（わかくさいろ）", col2: "#c3d825", col3: "和名 / 新芽のような黄緑", colorHex: "#c3d825" },
      { col1: "翡翠色（ひすいいろ）", col2: "#38b48b", col3: "和名 / 澄んだ青緑", colorHex: "#38b48b" },
      { col1: "常盤色（ときわいろ）", col2: "#007b43", col3: "和名 / 深い常緑の緑", colorHex: "#007b43" },
      { col1: "浅葱色（あさぎいろ）", col2: "#00a3af", col3: "和名 / 澄んだ青緑・新選組", colorHex: "#00a3af" },
      { col1: "空色（そらいろ）", col2: "#a0d8ef", col3: "和名 / 晴天の明るい水色", colorHex: "#a0d8ef" },
      { col1: "瑠璃色（るりいろ）", col2: "#1e50a2", col3: "和名 / 紫みを帯びた深い青", colorHex: "#1e50a2" },
      { col1: "藍色（あいいろ）", col2: "#165e83", col3: "和名 / 落ち着いた深い青", colorHex: "#165e83" },
      { col1: "紺色（こんいろ）", col2: "#223a70", col3: "和名 / 最も濃い青", colorHex: "#223a70" },
      { col1: "藤色（ふじいろ）", col2: "#bbbcde", col3: "和名 / 淡く上品な青紫", colorHex: "#bbbcde" },
      { col1: "桔梗色（ききょういろ）", col2: "#5654a2", col3: "和名 / 凛とした青紫", colorHex: "#5654a2" },
      { col1: "菫色（すみれいろ）", col2: "#7058a3", col3: "和名 / 落ち着いた紫", colorHex: "#7058a3" },
      { col1: "生成り色（きなりいろ）", col2: "#fbfaf5", col3: "和名 / 自然なオフホワイト", colorHex: "#fbfaf5" },
      { col1: "胡桃色（くるみいろ）", col2: "#a86f4c", col3: "和名 / やわらかな茶色", colorHex: "#a86f4c" },
      { col1: "鈍色（にびいろ）", col2: "#727171", col3: "和名 / 落ち着いた濃い灰色", colorHex: "#727171" },
      { col1: "墨色（すみいろ）", col2: "#595857", col3: "和名 / 墨を淡くしたような黒灰", colorHex: "#595857" },
      { col1: "漆黒（しっこく）", col2: "#0d0015", col3: "和名 / 艶のある深い黒", colorHex: "#0d0015" },
      { col1: "Crimson / クリムゾン", col2: "#dc143c", col3: "英名 / 深紅・鮮血の赤", colorHex: "#dc143c" },
      { col1: "Vermilion / バーミリオン", col2: "#e34234", col3: "英名 / 朱色・鮮やかな赤橙", colorHex: "#e34234" },
      { col1: "Amber / アンバー", col2: "#ffbf00", col3: "英名 / 琥珀色・温かな黄金", colorHex: "#ffbf00" },
      { col1: "Emerald / エメラルド", col2: "#50c878", col3: "英名 / 澄んだ緑", colorHex: "#50c878" },
      { col1: "Cerulean / セルリアン", col2: "#007ba7", col3: "英名 / 深い空色", colorHex: "#007ba7" },
      { col1: "Cobalt / コバルト", col2: "#0047ab", col3: "英名 / 鮮やかで強い青", colorHex: "#0047ab" },
      { col1: "Indigo / インディゴ", col2: "#4b0082", col3: "英名 / 藍・深い青紫", colorHex: "#4b0082" },
      { col1: "Lavender / ラベンダー", col2: "#e6e6fa", col3: "英名 / 淡く優しい薄紫", colorHex: "#e6e6fa" },
      { col1: "Ivory / アイボリー", col2: "#fffff0", col3: "英名 / 象牙色・柔らかい白", colorHex: "#fffff0" },
      { col1: "Silver / シルバー", col2: "#c0c0c0", col3: "英名 / 銀色・金属的な灰", colorHex: "#c0c0c0" },
      { col1: "Charcoal / チャコール", col2: "#36454f", col3: "英名 / 木炭のような暗い灰", colorHex: "#36454f" },
    ],
  },
  idea: {
    title: "辞書 - アイデア",
    headers: ["分類", "数字・語", "読み・綴り"],
    rows: [
      { col1: "ラテン語（数）", col2: "1 〜 5", col3: "unus / duo / tres / quattuor / quinque" },
      { col1: "ラテン語（数）", col2: "6 〜 10", col3: "sex / septem / octo / novem / decem" },
      { col1: "ラテン語（数）", col2: "11 / 12", col3: "undecim / duodecim" },
      { col1: "ギリシャ語（接頭辞）", col2: "1 〜 5", col3: "mono / di / tri / tetra / penta" },
      { col1: "ギリシャ語（接頭辞）", col2: "6 〜 10", col3: "hexa / hepta / octa / ennea / deca" },
      { col1: "ドイツ語（数）", col2: "1 〜 5", col3: "eins / zwei / drei / vier / fünf" },
      { col1: "ドイツ語（数）", col2: "6 〜 10", col3: "sechs / sieben / acht / neun / zehn" },
      { col1: "ドイツ語（数）", col2: "11 / 12", col3: "elf / zwölf" },
      { col1: "フランス語（数）", col2: "1 〜 5", col3: "un / deux / trois / quatre / cinq" },
      { col1: "フランス語（数）", col2: "6 〜 10", col3: "six / sept / huit / neuf / dix" },
      { col1: "フランス語（数）", col2: "11 / 12", col3: "onze / douze" },
      { col1: "イタリア語（数）", col2: "1 〜 5", col3: "uno / due / tre / quattro / cinque" },
      { col1: "イタリア語（数）", col2: "6 〜 10", col3: "sei / sette / otto / nove / dieci" },
      { col1: "スペイン語（数）", col2: "1 〜 5", col3: "uno / dos / tres / cuatro / cinco" },
      { col1: "スペイン語（数）", col2: "6 〜 10", col3: "seis / siete / ocho / nueve / diez" },
      { col1: "古語（数）", col2: "1 〜 5", col3: "ひと / ふた / み / よ / いつ" },
      { col1: "古語（数）", col2: "6 〜 10", col3: "む / なな / や / ここの / とお" },
      { col1: "漢数字（大字）", col2: "1 〜 5", col3: "壱 / 弐 / 参 / 肆 / 伍" },
      { col1: "漢数字（大字）", col2: "6 〜 10", col3: "陸 / 漆 / 捌 / 玖 / 拾" },
    ],
  },
};

export function isCategoryKey(value: string): value is CategoryKey {
  return (
    value === "flower" ||
    value === "stone" ||
    value === "constellation" ||
    value === "color" ||
    value === "idea"
  );
}
