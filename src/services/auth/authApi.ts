import { clearSession, setSession, type AuthSession } from "@/src/services/auth/session";
import {
  mockEnsureDemoUser,
  mockLogin,
  mockLogout,
  mockMe,
  mockRegister,
  mockSaveBusinessProfile,
  mockSetPin,
  mockVerifyPin,
} from "@/src/services/auth/mockAuth";

type LoginInput = { identifier: string; password: string };
type RegisterInput = {
  identifier: string;
  password: string;
  name: string;
  role?: string;
  businessName?: string;
  phone?: string;
};

function baseUrlFromEnv() {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  return baseUrl ? baseUrl.replace(/\/+$/, "") : null;
}

function looksLikeNetworkError(message: string) {
  const msg = message.toLowerCase();
  return (
    msg.includes("network request failed") ||
    msg.includes("failed to fetch") ||
    msg.includes("aborted") ||
    msg.includes("timeout") ||
    msg.includes("econnrefused") ||
    msg.includes("enotfound")
  );
}

async function fetchJson(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<{ ok: boolean; status: number; data: any }> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 15000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const baseUrl = baseUrlFromEnv();

  if (baseUrl) {
    try {
      const { ok, status, data } = await fetchJson(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: input.identifier,
          email: input.identifier,
          username: input.identifier,
          password: input.password,
        }),
      });

      if (!ok) {
        const message =
          (data && (data.message || data.error)) || `Login gagal (HTTP ${status}).`;
        throw new Error(message);
      }

      const token = data?.token ?? data?.accessToken;
      if (!token) throw new Error("Login berhasil, tapi token tidak ditemukan di respons.");

      const user = data?.user ?? { email: input.identifier };
      const session: AuthSession = {
        token,
        user,
        issuedAt: new Date().toISOString(),
      };
      await setSession(session);
      return session;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      // If backend unreachable, fall back to mock backend (dev-friendly).
      if (!looksLikeNetworkError(message)) throw e;
    }
  }

  const mock = await mockLogin({ identifier: input.identifier, password: input.password });
  const session: AuthSession = {
    token: mock.token,
    user: mock.user,
    issuedAt: new Date().toISOString(),
  };
  await setSession(session);
  return session;
}

export async function register(input: RegisterInput) {
  const baseUrl = baseUrlFromEnv();

  if (baseUrl) {
    try {
      const { ok, status, data } = await fetchJson(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: input.identifier,
          email: input.identifier,
          username: input.identifier,
          name: input.name,
          role: input.role,
          businessName: input.businessName,
          phone: input.phone,
          password: input.password,
        }),
      });

      if (!ok) {
        const message =
          (data && (data.message || data.error)) || `Registrasi gagal (HTTP ${status}).`;
        throw new Error(message);
      }

      return data?.user ?? data;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (!looksLikeNetworkError(message)) throw e;
    }
  }

  return await mockRegister({
    identifier: input.identifier,
    password: input.password,
    name: input.name,
    role: input.role,
    businessName: input.businessName,
    phone: input.phone,
  });
}

export async function loginDemo(): Promise<AuthSession> {
  await mockEnsureDemoUser();
  return await login({ identifier: "demo@warungstock.local", password: "demo123" });
}

export async function me(token: string) {
  const baseUrl = baseUrlFromEnv();

  if (baseUrl && !token.startsWith("mock_")) {
    const { ok, status, data } = await fetchJson(`${baseUrl}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!ok) {
      // Some backends don't implement /auth/me; keep session and use cached user.
      if (status === 404 || status === 405) {
        return null;
      }
      const message =
        (data && (data.message || data.error)) || `Sesi tidak valid (HTTP ${status}).`;
      throw new Error(message);
    }

    return data?.user ?? data;
  }

  return await mockMe(token);
}

export async function logout(token?: string | null) {
  const baseUrl = baseUrlFromEnv();

  if (token && token.startsWith("mock_")) {
    await mockLogout(token).catch(() => null);
  } else if (baseUrl && token) {
    await fetchJson(`${baseUrl}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      timeoutMs: 8000,
    }).catch(() => null);
  }

  await clearSession();
}

export async function saveBusinessProfile(input: {
  userId: number | string;
  businessName: string;
  businessType: string;
  location?: string;
  defaultCurrency: string;
  defaultUnit: string;
}) {
  return await mockSaveBusinessProfile(input);
}

export async function setLocalPin(userId: number | string, pin: string) {
  return await mockSetPin(userId, pin);
}

export async function verifyLocalPin(userId: number | string, pin: string) {
  return await mockVerifyPin(userId, pin);
}
