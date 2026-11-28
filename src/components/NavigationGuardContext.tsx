/**
 * 編集中に未保存の変更がある状態で別画面へ遷移しようとした際、
 * 「保存しますか？」の確認を挟むためのナビゲーションガード Context。
 */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type GuardHandler = (targetHref: string) => boolean;

interface NavigationGuardContextValue {
  /** 遷移前のガード関数を登録します（true を返すと遷移を保留します） */
  registerGuard: (handler: GuardHandler | null) => void;
  /** 指定先への遷移をリクエストします */
  requestNavigation: (href: string, onProceed?: () => void) => void;
}

const NavigationGuardContext = createContext<NavigationGuardContextValue>({
  registerGuard: () => {},
  requestNavigation: () => {},
});

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const guardRef = useRef<GuardHandler | null>(null);

  const registerGuard = useCallback((handler: GuardHandler | null) => {
    guardRef.current = handler;
  }, []);

  const requestNavigation = useCallback(
    (href: string, onProceed?: () => void) => {
      if (guardRef.current && guardRef.current(href)) {
        return;
      }
      onProceed?.();
      router.push(href);
    },
    [router]
  );

  return (
    <NavigationGuardContext.Provider
      value={{ registerGuard, requestNavigation }}
    >
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  return useContext(NavigationGuardContext);
}
