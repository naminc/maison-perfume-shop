import { STORAGE_KEYS } from "@/constants/storage-keys";
import { tokenStorage } from "@/lib/token";

const REFRESH_LOCK_TTL_MS = 10_000;
const REFRESH_WAIT_TIMEOUT_MS = 12_000;
export const REFRESH_WAIT_INTERVAL_MS = 120;

type RefreshLock = {
  owner: string;
  expiresAt: number;
};

export function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function createRefreshLockOwner() {
  const randomId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

  return `${Date.now()}:${randomId}`;
}

function readRefreshLock(): RefreshLock | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REFRESH_LOCK);
    if (!raw) return null;

    const lock = JSON.parse(raw) as Partial<RefreshLock>;
    if (!lock.owner || typeof lock.expiresAt !== "number") return null;

    return lock as RefreshLock;
  } catch {
    return null;
  }
}

export function acquireRefreshLock(owner: string) {
  const now = Date.now();
  const existing = readRefreshLock();

  if (existing && existing.expiresAt > now && existing.owner !== owner) {
    return false;
  }

  localStorage.setItem(STORAGE_KEYS.REFRESH_LOCK, JSON.stringify({
    owner,
    expiresAt: now + REFRESH_LOCK_TTL_MS,
  }));

  return readRefreshLock()?.owner === owner;
}

export function releaseRefreshLock(owner: string) {
  if (readRefreshLock()?.owner === owner) {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_LOCK);
  }
}

export async function waitForRefreshFromAnotherContext(previousRefreshToken: string) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < REFRESH_WAIT_TIMEOUT_MS) {
    const latestAccessToken = tokenStorage.getAccess();
    const latestRefreshToken = tokenStorage.getRefresh();

    if (latestAccessToken && latestRefreshToken && latestRefreshToken !== previousRefreshToken) {
      return latestAccessToken;
    }

    const lock = readRefreshLock();
    if (!lock || lock.expiresAt <= Date.now()) {
      return null;
    }

    await sleep(REFRESH_WAIT_INTERVAL_MS);
  }

  return null;
}
