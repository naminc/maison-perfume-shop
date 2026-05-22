/**
 * Utility for converting `{ key: value }` objects into URL query strings,
 * compatible with the legacy TanStack `search` API used across the app.
 */
export function buildUrl(to: string, search?: Record<string, unknown> | null): string {
  if (!search) return to;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(search)) {
    if (v === undefined || v === null || v === "") continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${to}?${qs}` : to;
}
