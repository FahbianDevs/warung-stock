import { Alert } from "react-native";
import { daysUntil, InventoryItem } from "./inventory";
import { storage } from "./storage";

const LAST_ALERT_DAY_KEY = "alerts.last_day_v1";
const LAST_ALERT_DAY_KEY_LEGACY = "alerts:last_day_v1";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function maybeNotifyStockAlerts(items: InventoryItem[]) {
  const last =
    (await storage.getItem(LAST_ALERT_DAY_KEY)) ??
    (await storage.getItem(LAST_ALERT_DAY_KEY_LEGACY));
  const today = todayKey();
  if (last === today) return;

  const low = items.filter((item) => item.quantity <= item.minQuantity);
  const expiring = items.filter((item) => {
    if (!item.expiryDate) return false;
    const days = daysUntil(item.expiryDate);
    return days !== null && days >= 0 && days <= 7;
  });

  if (low.length === 0 && expiring.length === 0) return;

  const parts: string[] = [];
  if (low.length) parts.push(`${low.length} stok rendah`);
  if (expiring.length) parts.push(`${expiring.length} mendekati kedaluwarsa`);

  Alert.alert("WARUNG-STOCK", `Peringatan: ${parts.join(" • ")}.`);
  await storage.setItem(LAST_ALERT_DAY_KEY, today);
}
