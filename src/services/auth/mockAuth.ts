import { initDb, getDb } from "@/src/services/db";
import { sha256Hex } from "@/src/utils/sha256";

export type MockUser = {
  id: number;
  email: string | null;
  username: string | null;
  name: string;
  role: string;
  businessName?: string;
  phone?: string;
  hasPin?: boolean;
};

export type MockSession = {
  token: string;
  user: MockUser;
  expiresAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function randomHex(byteLen: number) {
  const bytes = new Uint8Array(byteLen);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function normalizeIdentifier(input: string) {
  return input.trim();
}

function isEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

function toPublicUser(row: any): MockUser {
  return {
    id: row.id,
    email: row.email ?? null,
    username: row.username ?? null,
    name: row.name ?? "",
    role: row.role ?? "owner",
    businessName: row.businessName ?? "",
    phone: row.phone ?? "",
    hasPin: !!row.pinHash,
  };
}

export async function mockRegister(params: {
  identifier: string; // email or username
  password: string;
  name?: string;
  role?: string;
  businessName?: string;
  phone?: string;
}): Promise<MockUser> {
  await initDb();
  const db = await getDb();

  const identifier = normalizeIdentifier(params.identifier);
  const name = (params.name ?? "").trim();
  const role = (params.role ?? "owner").trim() || "owner";
  const businessName = (params.businessName ?? "").trim();
  const phone = (params.phone ?? "").trim();

  if (!identifier) throw new Error("Email/username wajib diisi.");
  if (!params.password) throw new Error("Password wajib diisi.");
  if (!name) throw new Error("Nama wajib diisi.");

  const email = isEmail(identifier) ? identifier.toLowerCase() : null;
  const username = email ? null : identifier;

  const salt = randomHex(16);
  const hash = sha256Hex(`${salt}:${params.password}`);
  const createdAt = nowIso();

  try {
    const result = await db.runAsync(
      `INSERT INTO auth_users (email, username, name, role, businessName, phone, passwordSalt, passwordHash, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, username, name, role, businessName, phone, salt, hash, createdAt, createdAt],
    );

    const id = result.lastInsertRowId as number;
    await db.runAsync(
      `INSERT OR IGNORE INTO users (id, name, business_name, email, phone, password_hash, pin_code, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
      [id, name, businessName, email, phone, hash, createdAt, createdAt],
    );
    return { id, email, username, name, role, businessName, phone, hasPin: false };
  } catch (e: any) {
    const message = typeof e?.message === "string" ? e.message : "";
    if (message.toLowerCase().includes("unique")) {
      throw new Error("Email/username sudah terdaftar.");
    }
    throw new Error("Gagal membuat akun. Silakan coba lagi.");
  }
}

export async function mockEnsureDemoUser() {
  await initDb();
  const db = await getDb();
  const existing = await db.getFirstAsync<any>(
    "SELECT * FROM auth_users WHERE email = ? LIMIT 1",
    ["demo@warungstock.local"],
  );
  if (existing) return toPublicUser(existing);

  return await mockRegister({
    identifier: "demo@warungstock.local",
    password: "demo123",
    name: "Pemilik Demo",
    businessName: "Warung Demo",
    phone: "081234567890",
    role: "owner",
  });
}

export async function mockLogin(params: {
  identifier: string; // email or username
  password: string;
}): Promise<MockSession> {
  await initDb();
  const db = await getDb();

  const identifier = normalizeIdentifier(params.identifier);
  if (!identifier) throw new Error("Email/username wajib diisi.");
  if (!params.password) throw new Error("Password wajib diisi.");

  const email = isEmail(identifier) ? identifier.toLowerCase() : null;
  const username = email ? null : identifier;

  const row = await db.getFirstAsync<any>(
    `SELECT * FROM auth_users WHERE ${email ? "email = ?" : "username = ?"} LIMIT 1`,
    [email ?? username],
  );

  if (!row) throw new Error("Akun tidak ditemukan. Silakan daftar terlebih dahulu.");

  const expected = sha256Hex(`${row.passwordSalt}:${params.password}`);
  if (expected !== row.passwordHash) {
    throw new Error("Password salah.");
  }

  const token = `mock_${randomHex(24)}`;
  const tokenHash = sha256Hex(token);
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days

  await db.runAsync(
    `INSERT INTO auth_sessions (token, userId, createdAt, expiresAt) VALUES (?, ?, ?, ?)`,
    [tokenHash, row.id, createdAt, expiresAt],
  );

  return { token, user: toPublicUser(row), expiresAt };
}

export async function mockMe(token: string): Promise<MockUser> {
  await initDb();
  const db = await getDb();

  const tokenHash = sha256Hex(token);
  const session = await db.getFirstAsync<any>(
    `SELECT s.token, s.expiresAt, u.*
     FROM auth_sessions s
     JOIN auth_users u ON u.id = s.userId
     WHERE s.token = ?
     LIMIT 1`,
    [tokenHash],
  );

  if (!session) throw new Error("Sesi tidak valid. Silakan login ulang.");
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await db.runAsync(`DELETE FROM auth_sessions WHERE token = ?`, [token]);
    throw new Error("Sesi berakhir. Silakan login ulang.");
  }

  return toPublicUser(session);
}

export async function mockLogout(token: string): Promise<void> {
  await initDb();
  const db = await getDb();
  const tokenHash = sha256Hex(token);
  await db.runAsync(`DELETE FROM auth_sessions WHERE token = ?`, [tokenHash]);
}

export async function mockSaveBusinessProfile(params: {
  userId: number | string;
  businessName: string;
  businessType: string;
  location?: string;
  defaultCurrency: string;
  defaultUnit: string;
}) {
  await initDb();
  const db = await getDb();
  const now = nowIso();
  const userId = Number(params.userId);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "UPDATE auth_users SET businessName = ?, updatedAt = ? WHERE id = ?",
      [params.businessName.trim(), now, userId],
    );
    await db.runAsync(
      `INSERT INTO business_profile (user_id, business_name, business_type, location, default_currency, default_unit, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        params.businessName.trim(),
        params.businessType,
        params.location?.trim() ?? "",
        params.defaultCurrency,
        params.defaultUnit,
        now,
        now,
      ],
    );
  });
}

export async function mockSetPin(userId: number | string, pin: string) {
  await initDb();
  const db = await getDb();
  const salt = randomHex(8);
  const hash = sha256Hex(`${salt}:${pin}`);
  const now = nowIso();
  await db.runAsync(
    "UPDATE auth_users SET pinSalt = ?, pinHash = ?, updatedAt = ? WHERE id = ?",
    [salt, hash, now, Number(userId)],
  );
}

export async function mockVerifyPin(userId: number | string, pin: string) {
  await initDb();
  const db = await getDb();
  const row = await db.getFirstAsync<any>(
    "SELECT pinSalt, pinHash FROM auth_users WHERE id = ? LIMIT 1",
    [Number(userId)],
  );
  if (!row?.pinHash || !row?.pinSalt) return false;
  return sha256Hex(`${row.pinSalt}:${pin}`) === row.pinHash;
}
