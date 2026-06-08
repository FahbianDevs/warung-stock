import { getDb, initDb } from "./db";

export type MovementType = "IN" | "OUT";

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  minQuantity: number;
  expiryDate: string | null; // YYYY-MM-DD
  purchasePrice: number | null;
  notes: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Movement {
  id: number;
  itemId: number;
  type: MovementType;
  quantity: number;
  note: string;
  createdAt: string; // ISO
}

export type StockStatus = "AMAN" | "HAMPIR_HABIS" | "STOK_RENDAH";
export type ExpiryStatus = "AMAN" | "SEGERA_DIGUNAKAN" | "KEDALUWARSA";

const ITEM_SELECT = `
  SELECT
    id,
    name,
    quantity,
    unit,
    category,
    COALESCE(minimum_stock, minQuantity, 0) as minQuantity,
    COALESCE(expiry_date, expiryDate) as expiryDate,
    purchase_price as purchasePrice,
    COALESCE(notes, '') as notes,
    COALESCE(created_at, createdAt) as createdAt,
    COALESCE(updated_at, updatedAt) as updatedAt
  FROM items
`;

export function toYyyyMmDd(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseYyyyMmDd(dateStr: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return null;
  const y = m[1];
  const mo = m[2];
  const d = m[3];
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  if (Number.isNaN(dt.getTime())) return null;
  // Guard against JS date rollover (e.g. 2026-02-31)
  if (dt.getFullYear() !== Number(y)) return null;
  if (dt.getMonth() !== Number(mo) - 1) return null;
  if (dt.getDate() !== Number(d)) return null;
  return dt;
}

export function daysUntil(dateStr: string) {
  const dt = parseYyyyMmDd(dateStr);
  if (!dt) return null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const diffMs = startOfTarget.getTime() - startOfToday.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getStockStatus(item: Pick<InventoryItem, "quantity" | "minQuantity">): StockStatus {
  if (item.quantity <= item.minQuantity) return "STOK_RENDAH";
  if (item.minQuantity > 0 && item.quantity <= item.minQuantity * 1.5) {
    return "HAMPIR_HABIS";
  }
  return "AMAN";
}

export function getExpiryStatus(item: Pick<InventoryItem, "expiryDate">): ExpiryStatus {
  if (!item.expiryDate) return "AMAN";
  const days = daysUntil(item.expiryDate);
  if (days === null) return "AMAN";
  if (days < 0) return "KEDALUWARSA";
  if (days <= 7) return "SEGERA_DIGUNAKAN";
  return "AMAN";
}

export async function inventoryInit() {
  await initDb();
}

export async function listItems(params?: {
  search?: string;
  category?: string;
  stockStatus?: StockStatus | "ALL";
  expiryFilter?: "ALL" | "EXPIRING" | "EXPIRED";
}) {
  await inventoryInit();
  const db = await getDb();

  const where: string[] = [];
  const args: (string | number | null)[] = [];

  if (params?.search?.trim()) {
    where.push("LOWER(name) LIKE ?");
    args.push(`%${params.search.trim().toLowerCase()}%`);
  }
  if (params?.category?.trim()) {
    where.push("category = ?");
    args.push(params.category.trim());
  }
  if (params?.stockStatus && params.stockStatus !== "ALL") {
    if (params.stockStatus === "STOK_RENDAH") {
      where.push("quantity <= COALESCE(minimum_stock, minQuantity, 0)");
    } else if (params.stockStatus === "HAMPIR_HABIS") {
      where.push("quantity > COALESCE(minimum_stock, minQuantity, 0)");
      where.push("quantity <= COALESCE(minimum_stock, minQuantity, 0) * 1.5");
      where.push("COALESCE(minimum_stock, minQuantity, 0) > 0");
    } else {
      where.push("(COALESCE(minimum_stock, minQuantity, 0) = 0 OR quantity > COALESCE(minimum_stock, minQuantity, 0) * 1.5)");
    }
  }
  if (params?.expiryFilter === "EXPIRING") {
    where.push("COALESCE(expiry_date, expiryDate) IS NOT NULL");
    where.push("date(COALESCE(expiry_date, expiryDate)) BETWEEN date('now', 'localtime') AND date('now', 'localtime', '+7 days')");
  } else if (params?.expiryFilter === "EXPIRED") {
    where.push("COALESCE(expiry_date, expiryDate) IS NOT NULL");
    where.push("date(COALESCE(expiry_date, expiryDate)) < date('now', 'localtime')");
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await db.getAllAsync<InventoryItem>(
    `${ITEM_SELECT} ${whereSql} ORDER BY LOWER(name) ASC`,
    args,
  );
  return rows;
}

export async function listCategories() {
  await inventoryInit();
  const db = await getDb();
  const rows = await db.getAllAsync<{ category: string }>(
    "SELECT DISTINCT category FROM items WHERE TRIM(category) <> '' ORDER BY LOWER(category) ASC",
  );
  return rows.map((row) => row.category);
}

export async function getItemById(id: number) {
  await inventoryInit();
  const db = await getDb();
  const row = await db.getFirstAsync<InventoryItem>(
    `${ITEM_SELECT} WHERE id = ?`,
    [id],
  );
  return row ?? null;
}

export async function createItem(input: {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  minQuantity: number;
  expiryDate: string | null;
  purchasePrice?: number | null;
  notes?: string;
}) {
  await inventoryInit();
  const db = await getDb();
  const now = new Date().toISOString();
  const res = await db.runAsync(
    `
    INSERT INTO items (
      name, quantity, unit, category, minQuantity, expiryDate,
      minimum_stock, expiry_date, purchase_price, notes,
      createdAt, updatedAt, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.name.trim(),
      input.quantity,
      input.unit.trim(),
      input.category.trim(),
      input.minQuantity,
      input.expiryDate,
      input.minQuantity,
      input.expiryDate,
      input.purchasePrice ?? null,
      input.notes?.trim() ?? "",
      now,
      now,
      now,
      now,
    ],
  );
  return res.lastInsertRowId;
}

export async function updateItem(
  id: number,
  patch: Partial<
    Pick<
      InventoryItem,
      "name" | "unit" | "category" | "minQuantity" | "expiryDate"
    > & { purchasePrice: number | null; notes: string; quantity: number }
  >,
) {
  await inventoryInit();
  const db = await getDb();

  const fields: string[] = [];
  const args: (string | number | null)[] = [];

  if (patch.name !== undefined) {
    fields.push("name = ?");
    args.push(patch.name.trim());
  }
  if (patch.unit !== undefined) {
    fields.push("unit = ?");
    args.push(patch.unit.trim());
  }
  if (patch.category !== undefined) {
    fields.push("category = ?");
    args.push(patch.category.trim());
  }
  if (patch.minQuantity !== undefined) {
    fields.push("minQuantity = ?");
    args.push(patch.minQuantity);
    fields.push("minimum_stock = ?");
    args.push(patch.minQuantity);
  }
  if (patch.expiryDate !== undefined) {
    fields.push("expiryDate = ?");
    args.push(patch.expiryDate);
    fields.push("expiry_date = ?");
    args.push(patch.expiryDate);
  }
  if (patch.purchasePrice !== undefined) {
    fields.push("purchase_price = ?");
    args.push(patch.purchasePrice);
  }
  if (patch.notes !== undefined) {
    fields.push("notes = ?");
    args.push(patch.notes.trim());
  }
  if (patch.quantity !== undefined) {
    fields.push("quantity = ?");
    args.push(patch.quantity);
  }

  fields.push("updatedAt = ?");
  fields.push("updated_at = ?");
  const now = new Date().toISOString();
  args.push(now, now);
  args.push(id);

  await db.runAsync(`UPDATE items SET ${fields.join(", ")} WHERE id = ?`, args);
}

export async function deleteItem(id: number) {
  await inventoryInit();
  const db = await getDb();
  await db.runAsync("DELETE FROM items WHERE id = ?", [id]);
}

export async function addMovement(params: {
  itemId: number;
  type: MovementType;
  quantity: number;
  note?: string;
}) {
  await inventoryInit();
  const db = await getDb();
  const now = new Date().toISOString();

  if (params.quantity <= 0) {
    throw new Error("Quantity must be > 0");
  }

  await db.withTransactionAsync(async () => {
    const item = await db.getFirstAsync<{ quantity: number }>(
      "SELECT quantity FROM items WHERE id = ?",
      [params.itemId],
    );
    if (!item) throw new Error("Item not found");

    const nextQty =
      params.type === "IN"
        ? item.quantity + params.quantity
        : item.quantity - params.quantity;

    if (nextQty < 0) throw new Error("Stok tidak boleh minus");

    await db.runAsync(
      "UPDATE items SET quantity = ?, updatedAt = ? WHERE id = ?",
      [nextQty, now, params.itemId],
    );
    await db.runAsync(
      "UPDATE items SET updated_at = ? WHERE id = ?",
      [now, params.itemId],
    );

    await db.runAsync(
      `
      INSERT INTO movements (itemId, type, quantity, note, createdAt)
      VALUES (?, ?, ?, ?, ?)
      `,
      [params.itemId, params.type, params.quantity, params.note?.trim() ?? "", now],
    );
    await db.runAsync(
      `
      INSERT INTO stock_logs (item_id, type, quantity, description, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        params.itemId,
        params.type,
        params.quantity,
        params.note?.trim() ?? "",
        toYyyyMmDd(new Date()),
        now,
      ],
    );
  });
}

export async function listMovements(params?: {
  itemId?: number;
  type?: MovementType;
  search?: string;
  limit?: number;
}) {
  await inventoryInit();
  const db = await getDb();

  const where: string[] = [];
  const args: (string | number)[] = [];

  if (params?.itemId !== undefined) {
    where.push("l.item_id = ?");
    args.push(params.itemId);
  }
  if (params?.type) {
    where.push("l.type = ?");
    args.push(params.type);
  }
  if (params?.search?.trim()) {
    where.push("LOWER(i.name) LIKE ?");
    args.push(`%${params.search.trim().toLowerCase()}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limit = params?.limit ?? 200;

  const rows = await db.getAllAsync<
    Movement & {
      itemName: string;
      unit: string;
      category: string;
    }
  >(
    `
    SELECT
      l.id as id,
      l.item_id as itemId,
      l.type as type,
      l.quantity as quantity,
      l.description as note,
      l.created_at as createdAt,
      i.name as itemName,
      i.unit as unit,
      i.category as category
    FROM stock_logs l
    JOIN items i ON i.id = l.item_id
    ${whereSql}
    ORDER BY l.created_at DESC
    LIMIT ?
    `,
    [...args, limit],
  );

  return rows;
}

export async function getInventoryStats() {
  await inventoryInit();
  const db = await getDb();
  const today = toYyyyMmDd(new Date());

  const [items, incomingToday, outgoingToday, weeklyIn, weeklyOut, topOutgoing] =
    await Promise.all([
      listItems(),
      db.getFirstAsync<{ total: number }>(
        "SELECT COALESCE(SUM(quantity), 0) as total FROM stock_logs WHERE type = 'IN' AND date = ?",
        [today],
      ),
      db.getFirstAsync<{ total: number }>(
        "SELECT COALESCE(SUM(quantity), 0) as total FROM stock_logs WHERE type = 'OUT' AND date = ?",
        [today],
      ),
      db.getFirstAsync<{ total: number }>(
        "SELECT COALESCE(SUM(quantity), 0) as total FROM stock_logs WHERE type = 'IN' AND date >= date('now', 'localtime', '-6 days')",
      ),
      db.getFirstAsync<{ total: number }>(
        "SELECT COALESCE(SUM(quantity), 0) as total FROM stock_logs WHERE type = 'OUT' AND date >= date('now', 'localtime', '-6 days')",
      ),
      db.getAllAsync<{ itemName: string; unit: string; total: number }>(
        `
        SELECT i.name as itemName, i.unit as unit, COALESCE(SUM(l.quantity), 0) as total
        FROM stock_logs l
        JOIN items i ON i.id = l.item_id
        WHERE l.type = 'OUT'
        GROUP BY l.item_id
        ORDER BY total DESC
        LIMIT 5
        `,
      ),
    ]);

  const lowStockCount = items.filter((item) => getStockStatus(item) === "STOK_RENDAH").length;
  const expiringCount = items.filter((item) => getExpiryStatus(item) === "SEGERA_DIGUNAKAN").length;
  const expiredCount = items.filter((item) => getExpiryStatus(item) === "KEDALUWARSA").length;
  const stockValue = items.reduce(
    (sum, item) => sum + item.quantity * (item.purchasePrice ?? 0),
    0,
  );

  return {
    totalItems: items.length,
    lowStockCount,
    expiringCount,
    expiredCount,
    incomingToday: incomingToday?.total ?? 0,
    outgoingToday: outgoingToday?.total ?? 0,
    incomingThisWeek: weeklyIn?.total ?? 0,
    outgoingThisWeek: weeklyOut?.total ?? 0,
    stockValue,
    topOutgoing,
  };
}

export async function resetInventoryData() {
  await inventoryInit();
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM stock_logs");
    await db.runAsync("DELETE FROM movements");
    await db.runAsync("DELETE FROM items");
  });
}
