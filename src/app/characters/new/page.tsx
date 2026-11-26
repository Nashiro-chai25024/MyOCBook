/**
 * キャラクター新規作成画面（キャラ編集モード）。
 */
import AppHeader from "@/components/AppHeader";
import CharacterEditor from "@/components/CharacterEditor";

export default function NewCharacterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        title="キャラ編集モード"
        backHref="/characters"
        backLabel="一覧へ"
      />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <CharacterEditor initialCharacter={null} />
      </main>
    </div>
  );
}
