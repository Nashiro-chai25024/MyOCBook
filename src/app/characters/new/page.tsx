/**
 * キャラクター新規作成画面（キャラ編集モード）。
 * クエリパラメータ worldId がある場合は所属世界の初期値として設定します。
 */
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import CharacterEditor from "@/components/CharacterEditor";

function NewCharacterContent() {
  const searchParams = useSearchParams();
  const worldId = searchParams.get("worldId") ?? "";

  return <CharacterEditor initialCharacter={null} defaultWorldId={worldId} />;
}

export default function NewCharacterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        title="キャラ編集モード"
        backHref="/characters"
        backLabel="一覧へ"
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <Suspense
          fallback={
            <p className="text-sm text-foreground-muted">読み込み中...</p>
          }
        >
          <NewCharacterContent />
        </Suspense>
      </main>
    </div>
  );
}
