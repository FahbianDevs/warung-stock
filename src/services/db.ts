import * as SQLite from "expo-sqlite";

const DB_NAME = "warungstock.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  const db = await dbPromise;
  await db.execAsync("PRAGMA foreign_keys = ON;");
  return db;
}

export async function initDb() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const db = await getDb();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT '',
        minQuantity REAL NOT NULL DEFAULT 0,
        expiryDate TEXT,
        minimum_stock REAL NOT NULL DEFAULT 0,
        expiry_date TEXT,
        purchase_price REAL,
        notes TEXT NOT NULL DEFAULT '',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
      CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
      CREATE INDEX IF NOT EXISTS idx_items_expiryDate ON items(expiryDate);

      CREATE TABLE IF NOT EXISTS movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        itemId INTEGER NOT NULL,
        type TEXT NOT NULL,
        quantity REAL NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        createdAt TEXT NOT NULL,
        FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_movements_itemId_createdAt ON movements(itemId, createdAt);

      CREATE TABLE IF NOT EXISTS stock_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('IN', 'OUT')),
        quantity REAL NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_stock_logs_item_id_created_at ON stock_logs(item_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_stock_logs_type_date ON stock_logs(type, date);

      CREATE TABLE IF NOT EXISTS auth_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        username TEXT UNIQUE,
        name TEXT NOT NULL DEFAULT '',
        role TEXT NOT NULL DEFAULT 'owner',
        businessName TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        pinHash TEXT,
        pinSalt TEXT,
        passwordSalt TEXT NOT NULL,
        passwordHash TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
      CREATE INDEX IF NOT EXISTS idx_auth_users_username ON auth_users(username);

      CREATE TABLE IF NOT EXISTS auth_sessions (
        token TEXT PRIMARY KEY,
        userId INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES auth_users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_auth_sessions_userId ON auth_sessions(userId);

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        business_name TEXT NOT NULL DEFAULT '',
        email TEXT UNIQUE,
        phone TEXT,
        password_hash TEXT NOT NULL,
        pin_code TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      CREATE TABLE IF NOT EXISTS business_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        business_name TEXT NOT NULL,
        business_type TEXT NOT NULL,
        location TEXT,
        default_currency TEXT NOT NULL DEFAULT 'IDR',
        default_unit TEXT NOT NULL DEFAULT 'pcs',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_business_profile_user_id ON business_profile(user_id);
    `);

    await migrateInventorySchema(db);
    await migrateAuthSchema(db);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_items_expiry_date ON items(expiry_date);
      CREATE INDEX IF NOT EXISTS idx_items_minimum_stock ON items(minimum_stock);
    `);
  })();

  return initPromise;
}

async function addColumnIfMissing(
  db: SQLite.SQLiteDatabase,
  tableName: string,
  columnName: string,
  definition: string,
) {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
  if (!columns.some((column) => column.name === columnName)) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
  }
}

async function migrateInventorySchema(db: SQLite.SQLiteDatabase) {
  await addColumnIfMissing(db, "items", "minimum_stock", "REAL NOT NULL DEFAULT 0");
  await addColumnIfMissing(db, "items", "expiry_date", "TEXT");
  await addColumnIfMissing(db, "items", "purchase_price", "REAL");
  await addColumnIfMissing(db, "items", "notes", "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing(db, "items", "created_at", "TEXT");
  await addColumnIfMissing(db, "items", "updated_at", "TEXT");

  await db.execAsync(`
    UPDATE items
    SET
      minimum_stock = CASE
        WHEN minimum_stock IS NULL OR minimum_stock = 0 THEN minQuantity
        ELSE minimum_stock
      END,
      expiry_date = COALESCE(expiry_date, expiryDate),
      created_at = COALESCE(created_at, createdAt),
      updated_at = COALESCE(updated_at, updatedAt);

    INSERT INTO stock_logs (item_id, type, quantity, description, date, created_at)
    SELECT itemId, type, quantity, note, substr(createdAt, 1, 10), createdAt
    FROM movements
    WHERE NOT EXISTS (
      SELECT 1
      FROM stock_logs
      WHERE stock_logs.item_id = movements.itemId
        AND stock_logs.type = movements.type
        AND stock_logs.quantity = movements.quantity
        AND stock_logs.created_at = movements.createdAt
    );
  `);
}

async function migrateAuthSchema(db: SQLite.SQLiteDatabase) {
  await addColumnIfMissing(db, "auth_users", "businessName", "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing(db, "auth_users", "phone", "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing(db, "auth_users", "pinHash", "TEXT");
  await addColumnIfMissing(db, "auth_users", "pinSalt", "TEXT");
  await addColumnIfMissing(db, "auth_users", "updatedAt", "TEXT");

  await db.execAsync(`
    INSERT INTO users (id, name, business_name, email, phone, password_hash, pin_code, created_at, updated_at)
    SELECT id, name, COALESCE(businessName, ''), email, COALESCE(phone, ''), passwordHash, pinHash, createdAt, COALESCE(updatedAt, createdAt)
    FROM auth_users
    WHERE email IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM users WHERE users.id = auth_users.id
      );
  `);
}
