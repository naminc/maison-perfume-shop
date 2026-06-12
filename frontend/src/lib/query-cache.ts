interface StoredQueryData<T> {
  data: T;
  updatedAt: number;
}

export function readStoredQueryData<T>(
  key: string,
  isValid: (value: unknown) => value is T,
): StoredQueryData<T> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredQueryData<unknown>>;
    if (!isValid(parsed.data) || typeof parsed.updatedAt !== "number") return null;

    return parsed as StoredQueryData<T>;
  } catch {
    return null;
  }
}

export function writeStoredQueryData<T>(key: string, data: T, updatedAt: number) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        data,
        updatedAt,
      }),
    );
  } catch {
    // Cache write failures are non-critical.
  }
}
