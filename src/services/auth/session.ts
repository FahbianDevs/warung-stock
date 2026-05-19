import { storage } from "@/src/services/storage";

export type AuthUser = {
  id: number | string;
  email?: string | null;
  username?: string | null;
  name?: string | null;
  role?: string | null;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
  issuedAt: string;
};

const SESSION_KEY = "authSessionV1";

let sessionCache: AuthSession | null | undefined = undefined;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function getSession(): Promise<AuthSession | null> {
  if (sessionCache !== undefined) return sessionCache;

  const raw = await storage.getItem(SESSION_KEY);
  if (!raw) {
    sessionCache = null;
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed?.user) {
      sessionCache = null;
      return null;
    }
    sessionCache = parsed;
    return parsed;
  } catch {
    sessionCache = null;
    return null;
  }
}

export async function setSession(session: AuthSession): Promise<void> {
  sessionCache = session;
  await storage.setItem(SESSION_KEY, JSON.stringify(session));
  emit();
}

export async function clearSession(): Promise<void> {
  sessionCache = null;
  await storage.removeItem(SESSION_KEY);
  // Backward-compat cleanup
  await storage.removeItem("userToken").catch(() => null);
  emit();
}

