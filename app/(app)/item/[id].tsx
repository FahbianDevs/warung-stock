import { addMovement, daysUntil, deleteItem, getItemById, listMovements, MovementType } from "@/src/services/inventory";
import { COLORS } from "@/src/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

function toNumber(value: string) {
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = Number(id);

  const [item, setItem] = React.useState<Awaited<ReturnType<typeof getItemById>>>(null);
  const [rows, setRows] = React.useState<(Awaited<ReturnType<typeof listMovements>>)[number][]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [type, setType] = React.useState<MovementType>("OUT");
  const [qty, setQty] = React.useState("1");
  const [note, setNote] = React.useState("");

  const load = React.useCallback(async () => {
    if (!Number.isFinite(itemId)) return;
    setIsLoading(true);
    try {
      const it = await getItemById(itemId);
      setItem(it);
      const mv = await listMovements({ itemId, limit: 100 });
      setRows(mv);
    } catch (e) {
      console.error(e);
      alert("Gagal memuat detail barang.");
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleBack = () => router.back();

  const handleDelete = async () => {
    if (!item) return;
    Alert.alert(
      "Hapus Barang",
      `Hapus "${item.name}"? Riwayat terkait juga akan terhapus.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteItem(item.id);
              router.replace("/(app)/dashboard");
            } catch (e) {
              console.error(e);
              alert("Gagal menghapus barang.");
            }
          },
        },
      ],
    );
  };

  const handleSubmitMovement = async () => {
    if (!item) return;
    const n = toNumber(qty);
    if (!Number.isFinite(n) || n <= 0) return alert("Jumlah harus angka > 0.");
    try {
      await addMovement({ itemId: item.id, type, quantity: n, note });
      setQty("1");
      setNote("");
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Gagal mencatat transaksi.");
    }
  };

  const lowStock = item ? item.quantity < item.minQuantity : false;
  const expD = item?.expiryDate ? daysUntil(item.expiryDate) : null;
  const isExpiring = expD !== null && expD <= 3;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
          <Icon name="chevron-back" size={26} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Detail Barang
        </Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
          <Icon name="trash" size={22} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {!item ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>{isLoading ? "Memuat..." : "Barang tidak ditemukan"}</Text>
        </View>
      ) : (
        <>
          <View style={styles.topCard}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.category ? `${item.category} • ` : ""}
              {item.quantity} {item.unit}
            </Text>

            <View style={styles.alertRow}>
              {lowStock ? (
                <View style={[styles.alertPill, { backgroundColor: "#C60000" }]}>
                  <Text style={styles.alertText}>Stok di bawah minimum</Text>
                </View>
              ) : null}
              {item.expiryDate ? (
                <View style={[styles.alertPill, { backgroundColor: isExpiring ? "#D97706" : "#6B7280" }]}>
                  <Text style={styles.alertText}>
                    Exp: {item.expiryDate}
                    {expD !== null ? ` (${expD} hari)` : ""}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Catat Barang Masuk/Keluar</Text>

            <View style={styles.typeRow}>
              {(["IN", "OUT"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                    {t === "IN" ? "Masuk" : "Keluar"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Jumlah</Text>
                <TextInput
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor={COLORS.grayText}
                  style={styles.input}
                />
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Catatan (opsional)</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Contoh: pemakaian harian"
                  placeholderTextColor={COLORS.grayText}
                  style={styles.input}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitMovement} activeOpacity={0.9}>
              <Text style={styles.submitText}>Simpan Transaksi</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Riwayat Terbaru</Text>
          </View>

          <FlatList
            data={rows}
            keyExtractor={(it) => String(it.id)}
            refreshing={isLoading}
            onRefresh={() => void load()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item: mv }) => {
              const isIn = mv.type === "IN";
              const color = isIn ? "#16A34A" : "#C60000";
              return (
                <View style={styles.mvRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mvTitle}>
                      {isIn ? "Masuk" : "Keluar"} • {mv.quantity} {mv.unit}
                    </Text>
                    <Text style={styles.mvSub}>
                      {new Date(mv.createdAt).toLocaleString()}
                      {mv.note ? ` • ${mv.note}` : ""}
                    </Text>
                  </View>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                </View>
              );
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: COLORS.primary,
    paddingTop: 20,
  },
  iconBtn: { padding: 8 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "bold", color: COLORS.textLight },
  topCard: {
    margin: 16,
    marginBottom: 10,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  name: { fontSize: 18, fontWeight: "900", color: COLORS.textDark },
  meta: { marginTop: 6, color: COLORS.textMuted },
  alertRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  alertPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  alertText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: COLORS.textDark },
  typeRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  typeChipActive: { borderColor: COLORS.primary, backgroundColor: "#f7eef0" },
  typeText: { fontSize: 12, fontWeight: "800", color: COLORS.textMuted },
  typeTextActive: { color: COLORS.primary },
  row: { flexDirection: "row", marginTop: 10 },
  label: { fontSize: 12, fontWeight: "700", color: COLORS.textDark, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: "#111",
  },
  submitBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "900" },
  listHeader: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  mvRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  mvTitle: { fontSize: 13, fontWeight: "900", color: COLORS.textDark },
  mvSub: { marginTop: 4, fontSize: 12, color: COLORS.textMuted },
  dot: { width: 12, height: 12, borderRadius: 6 },
  emptyWrap: { paddingTop: 40, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: COLORS.textDark },
});
