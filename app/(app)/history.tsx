import { listMovements, MovementType } from "@/src/services/inventory";
import { COLORS } from "@/src/theme";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

type DrawerNavigation = DrawerNavigationProp<any>;

export default function HistoryScreen() {
  const navigation = useNavigation<DrawerNavigation>();
  const [rows, setRows] = React.useState<(Awaited<ReturnType<typeof listMovements>>)[number][]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState<MovementType | "ALL">("ALL");

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      setRows(await listMovements({
        search: search.trim() ? search : undefined,
        type: type === "ALL" ? undefined : type,
        limit: 300,
      }));
    } catch (e) {
      console.error(e);
      alert("Gagal memuat riwayat.");
    } finally {
      setIsLoading(false);
    }
  }, [search, type]);

  useFocusEffect(
    React.useCallback(() => {
      void load();
      return () => {};
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari nama bahan..."
            placeholderTextColor={COLORS.grayText}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => void load()}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Icon name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.typeRow}>
          {(["ALL", "IN", "OUT"] as const).map((movementType) => (
            <TouchableOpacity
              key={movementType}
              style={[styles.typeChip, type === movementType && styles.typeChipActive]}
              onPress={() => setType(movementType)}
              activeOpacity={0.85}
            >
              <Text style={[styles.typeText, type === movementType && styles.typeTextActive]}>
                {movementType === "ALL" ? "Semua" : movementType === "IN" ? "Masuk" : "Keluar"}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.refreshBtn} onPress={() => void load()} activeOpacity={0.85}>
            <Icon name="refresh" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        refreshing={isLoading}
        onRefresh={() => void load()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Icon name="time-outline" size={42} color={COLORS.textGray} />
            <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
            <Text style={styles.emptySubtitle}>Transaksi masuk/keluar akan tampil di sini.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isIn = item.type === "IN";
          const color = isIn ? COLORS.success : COLORS.danger;
          return (
            <View style={styles.rowCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.itemName}</Text>
                <Text style={styles.rowSub}>
                  {new Date(item.createdAt).toLocaleString()} • {item.category || "-"}
                </Text>
                {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
              </View>
              <View style={[styles.pill, { backgroundColor: color }]}>
                <Text style={styles.pillText}>
                  {isIn ? "+" : "-"}
                  {item.quantity} {item.unit}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.primary,
    paddingTop: 20,
  },
  menuButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textLight },
  filters: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  searchBox: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, marginLeft: 8, marginRight: 8, fontSize: 14, color: COLORS.textDark },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipActive: { borderColor: COLORS.primary, backgroundColor: "#ECFDF5" },
  typeText: { fontSize: 12, fontWeight: "800", color: COLORS.textMuted },
  typeTextActive: { color: COLORS.primary },
  refreshBtn: {
    marginLeft: "auto",
    width: 40,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  rowTitle: { fontSize: 15, fontWeight: "900", color: COLORS.textDark },
  rowSub: { marginTop: 4, fontSize: 12, color: COLORS.textMuted },
  note: { marginTop: 5, fontSize: 12, color: COLORS.textDark },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  emptyWrap: { paddingTop: 40, alignItems: "center" },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "900", color: COLORS.textDark },
  emptySubtitle: { marginTop: 8, fontSize: 12, color: COLORS.textMuted, textAlign: "center", paddingHorizontal: 40 },
});
