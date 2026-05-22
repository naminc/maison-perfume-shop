import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DemoStore } from "@/lib/demo-store";

export interface DemoContextValue {
  isDemo: boolean;
  demoStore: DemoStore | null;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  resetDemoData: () => void;
  /** Increment after any store mutation to trigger re-renders */
  bumpVersion: () => void;
  version: number;
}

export const DemoContext = createContext<DemoContextValue | null>(null);

const DEMO_SESSION_KEY = "maison-demo-active";

function createInitialStore() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(DEMO_SESSION_KEY) === "true"
    ? new DemoStore()
    : null;
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<DemoStore | null>(() => createInitialStore());
  const [version, setVersion] = useState(0);

  const enterDemoMode = useCallback(() => {
    const s = new DemoStore();
    window.sessionStorage.setItem(DEMO_SESSION_KEY, "true");
    setStore(s);
    setVersion(0);
  }, []);

  const exitDemoMode = useCallback(() => {
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    setStore(null);
    setVersion(0);
  }, []);

  const resetDemoData = useCallback(() => {
    if (store) {
      store.reset();
      setVersion((v) => v + 1);
    }
  }, [store]);

  const bumpVersion = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!store) return;
    window.sessionStorage.setItem(DEMO_SESSION_KEY, "true");
  }, [store]);

  const value = useMemo<DemoContextValue>(
    () => ({
      isDemo: store !== null,
      demoStore: store,
      enterDemoMode,
      exitDemoMode,
      resetDemoData,
      bumpVersion,
      version,
    }),
    [store, enterDemoMode, exitDemoMode, resetDemoData, bumpVersion, version],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
