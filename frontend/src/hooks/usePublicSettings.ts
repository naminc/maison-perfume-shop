import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { settingApi } from "@/api/setting";
import { DEFAULT_PUBLIC_SETTINGS, resolvePublicSettings } from "@/constants/site-settings";
import { STALE_TIME } from "@/constants/query-config";
import { QUERY_KEYS } from "@/constants/query-keys";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { PublicSettings } from "@/types/setting";

type PublicSettingsCache = {
  data: PublicSettings;
  updatedAt: number;
};

function isPublicSettings(value: unknown): value is PublicSettings {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<PublicSettings>;

  return (
    typeof settings.store_name === "string" &&
    typeof settings.maintenance === "object" &&
    settings.maintenance !== null &&
    typeof settings.maintenance.enabled === "boolean" &&
    typeof settings.maintenance.message === "string"
  );
}

function readPublicSettingsCache(): PublicSettingsCache | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PUBLIC_SETTINGS);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PublicSettingsCache>;
    if (!isPublicSettings(parsed.data) || typeof parsed.updatedAt !== "number") return null;

    return parsed as PublicSettingsCache;
  } catch {
    return null;
  }
}

function writePublicSettingsCache(data: PublicSettings, updatedAt: number) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORAGE_KEYS.PUBLIC_SETTINGS,
      JSON.stringify({
        data,
        updatedAt,
      }),
    );
  } catch {
    // Cache write failures are non-critical.
  }
}

export function usePublicSettings() {
  const cached = readPublicSettingsCache();

  const query = useQuery({
    queryKey: QUERY_KEYS.settings.public,
    queryFn: settingApi.getPublic,
    staleTime: STALE_TIME.LONG,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.updatedAt,
  });

  useEffect(() => {
    if (query.data) {
      writePublicSettingsCache(resolvePublicSettings(query.data), query.dataUpdatedAt);
    }
  }, [query.data, query.dataUpdatedAt]);

  return {
    ...query,
    hasCachedSettings: Boolean(cached),
    settings: resolvePublicSettings(query.data ?? DEFAULT_PUBLIC_SETTINGS),
  };
}
