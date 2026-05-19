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

export async function inventoryInit() {
  await initDb();
}

export async function listItems(params?: { search?: string; category?: string }) {
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

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await db.getAllAsync<InventoryItem>(
    `SELECT * FROM items ${whereSql} ORDER BY LOWER(name) ASC`,
    args,
  );
  return rows;
}

export async function getItemById(id: number) {
  await inventoryInit();
  const db = await getDb();
  const row = await db.getFirstAsync<InventoryItem>(
    "SELECT * FROM items WHERE id = ?",
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
}) {
  await inventoryInit();
  const db = await getDb();
  const now = new Date().toISOString();
  const res = await db.runAsync(
    `
    INSERT INTO items (name, quantity, unit, category, minQuantity, expiryDate, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.name.trim(),
      input.quantity,
      input.unit.trim(),
      input.category.trim(),
      input.minQuantity,
      input.expiryDate,
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
    >
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
  }
  if (patch.expiryDate !== undefined) {
    fields.push("expiryDate = ?");
    args.push(patch.expiryDate);
  }

  fields.push("updatedAt = ?");
  args.push(new Date().toISOString());
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
      `
      INSERT INTO movements (itemId, type, quantity, note, createdAt)
      VALUES (?, ?, ?, ?, ?)
      `,
      [params.itemId, params.type, params.quantity, params.note?.trim() ?? "", now],
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
    where.push("m.itemId = ?");
    args.push(params.itemId);
  }
  if (params?.type) {
    where.push("m.type = ?");
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
      m.*,
      i.name as itemName,
      i.unit as unit,
      i.category as category
    FROM movements m
    JOIN items i ON i.id = m.itemId
    ${whereSql}
    ORDER BY m.createdAt DESC
    LIMIT ?
    `,
    [...args, limit],
  );

  return rows;
}
