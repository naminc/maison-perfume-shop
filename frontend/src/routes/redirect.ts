export function getSafeRedirectPath(redirect: string | null) {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) return null;
  if (redirect.startsWith("/auth/")) return null;
  return redirect;
}
