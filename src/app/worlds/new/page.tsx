/**
 * 世界観新規作成ページ（世界編集モード）。
 */
import AppHeader from "@/components/AppHeader";
import WorldEditor from "@/components/WorldEditor";

export default function NewWorldPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        title="世界編集モード"
        backHref="/worlds"
        backLabel="一覧へ"
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <WorldEditor initialWorld={null} />
      </main>
    </div>
  );
}
