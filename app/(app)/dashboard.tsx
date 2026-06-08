import {
  getExpiryStatus,
  getInventoryStats,
  getStockStatus,
  InventoryItem,
  inventoryInit,
  listCategories,
  listItems,
  StockStatus,
} from "@/src/services/inventory";
import { maybeNotifyStockAlerts } from "@/src/services/alerts";
import { COLORS } from "@/src/theme";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

type DrawerNavigation = DrawerNavigationProp<any>;

function stockMeta(item: InventoryItem) {
  const status = getStockStatus(item);
  if (status === "STOK_RENDAH") {
    return { label: "Stok Rendah", color: COLORS.danger, icon: "alert-circle-outline" };
  }
  if (status === "HAMPIR_HABIS") {
    return { label: "Hampir Habis", color: COLORS.warning, icon: "warning-outline" };
  }
  return { label: "Aman", color: COLORS.success, icon: "checkmark-circle-outline" };
}

export default function DashboardScreen() {
  const navigation = useNavigation<DrawerNavigation>();
  const router = useRouter();
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [stats, setStats] = React.useState<Awaited<ReturnType<typeof getInventoryStats>> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("ALL");
  const [stockStatus, setStockStatus] = React.useState<StockStatus | "ALL">("ALL");
  const [expiryFilter, setExpiryFilter] = React.useState<"ALL" | "EXPIRING" | "EXPIRED">("ALL");

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await inventoryInit();
      const [rows, nextCategories, nextStats] = await Promise.all([
        listItems({
          search,
          category: category === "ALL" ? undefined : category,
          stockStatus,
          expiryFilter,
        }),
        listCategories(),
        getInventoryStats(),
      ]);
      setItems(rows);
      setCategories(nextCategories);
      setStats(nextStats);
      void maybeNotifyStockAlerts(rows);
    } catch (e) {
      console.error(e);
      alert("Gagal memuat data stok.");
    } finally {
      setIsLoading(false);
    }
  }, [category, expiryFilter, search, stockStatus]);

  useFocusEffect(
    React.useCallback(() => {
      void load();
      return () => {};
    }, [load]),
  );

  const recommendations = React.useMemo(() => {
    if (!stats) return [];
    const output: { text: string; icon: string; color: string }[] = [];
    if (stats.lowStockCount > 0) {
      output.push({ text: `${stats.lowStockCount} bahan perlu dibeli ulang`, icon: "cart-outline", color: COLORS.danger });
    }
    if (stats.expiringCount > 0) {
      output.push({ text: `${stats.expiringCount} bahan mendekati kedaluwarsa`, icon: "calendar-outline", color: COLORS.warning });
    }
    const lowestItem = items.find((item) => getStockStatus(item) === "STOK_RENDAH");
    if (lowestItem) {
      output.push({ text: `Stok ${lowestItem.name} berada di bawah minimum`, icon: "alert-outline", color: COLORS.danger });
    }
    return output.length ? output : [{ text: "Semua stok utama aman hari ini", icon: "checkmark-done-outline", color: COLORS.success }];
  }, [items, stats]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color={COLORS.textLight} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Selamat datang</Text>
          <Text style={styles.headerTitle}>WARUNG-STOCK</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace("/(auth)/logout")}>
          <Icon name="log-out-outline" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari beras, telur, minyak..."
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
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshing={isLoading}
        onRefresh={() => void load()}
        ListHeaderComponent={
          <>
            <View style={styles.statsGrid}>
              <SummaryCard label="Total Item" value={stats?.totalItems ?? 0} icon="cube-outline" color={COLORS.primary} />
              <SummaryCard label="Stok Rendah" value={stats?.lowStockCount ?? 0} icon="alert-circle-outline" color={COLORS.danger} />
              <SummaryCard label="Hampir Exp" value={stats?.expiringCount ?? 0} icon="calendar-outline" color={COLORS.warning} />
              <SummaryCard label="Masuk Hari Ini" value={stats?.incomingToday ?? 0} icon="arrow-down-circle-outline" color={COLORS.secondary} />
              <SummaryCard label="Keluar Hari Ini" value={stats?.outgoingToday ?? 0} icon="arrow-up-circle-outline" color={COLORS.danger} />
              <SummaryCard label="Nilai Stok" value={`Rp ${(stats?.stockValue ?? 0).toLocaleString("id-ID")}`} icon="cash-outline" color={COLORS.success} />
            </View>

            <View style={styles.recommendationCard}>
              <Text style={styles.sectionTitle}>Rekomendasi Tindakan</Text>
              {recommendations.map((recommendation) => (
                <View key={recommendation.text} style={styles.recommendationRow}>
                  <Icon name={recommendation.icon} size={18} color={recommendation.color} />
                  <Text style={styles.recommendationText}>{recommendation.text}</Text>
                </View>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {["ALL", ...categories].map((value) => (
                <FilterChip
                  key={value}
                  label={value === "ALL" ? "Semua Kategori" : value}
                  active={category === value}
                  onPress={() => setCategory(value)}
                />
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {[
                ["ALL", "Semua Status"],
                ["AMAN", "Aman"],
                ["HAMPIR_HABIS", "Hampir Habis"],
                ["STOK_RENDAH", "Stok Rendah"],
              ].map(([value, label]) => (
                <FilterChip
                  key={value}
                  label={label}
                  active={stockStatus === value}
                  onPress={() => setStockStatus(value as StockStatus | "ALL")}
                />
              ))}
              <FilterChip label="Segera Digunakan" active={expiryFilter === "EXPIRING"} onPress={() => setExpiryFilter(expiryFilter === "EXPIRING" ? "ALL" : "EXPIRING")} />
              <FilterChip label="Kedaluwarsa" active={expiryFilter === "EXPIRED"} onPress={() => setExpiryFilter(expiryFilter === "EXPIRED" ? "ALL" : "EXPIRED")} />
            </ScrollView>

            <Text style={styles.listTitle}>Daftar Stok</Text>
          </>
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Icon name="file-tray-outline" size={42} color={COLORS.textGray} />
            <Text style={styles.emptyTitle}>Belum ada stok</Text>
            <Text style={styles.emptySubtitle}>Tekan tombol + untuk menambahkan bahan baku pertama.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = stockMeta(item);
          const expiryStatus = getExpiryStatus(item);
          return (
            <TouchableOpacity
              style={styles.itemCard}
              onPress={() => router.push({ pathname: "/(app)/item/[id]" as any, params: { id: String(item.id) } } as any)}
              activeOpacity={0.85}
            >
              <View style={styles.itemTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.category || "Tanpa kategori"} • {item.quantity} {item.unit}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: meta.color }]}>
                  <Icon name={meta.icon} size={13} color="#fff" />
                  <Text style={styles.badgeText}>{meta.label}</Text>
                </View>
              </View>
              {item.expiryDate ? (
                <Text style={[styles.expiryText, expiryStatus === "KEDALUWARSA" && { color: COLORS.danger }, expiryStatus === "SEGERA_DIGUNAKAN" && { color: COLORS.warning }]}>
                  Exp: {item.expiryDate} • {expiryStatus === "KEDALUWARSA" ? "Kedaluwarsa" : expiryStatus === "SEGERA_DIGUNAKAN" ? "Segera digunakan" : "Aman"}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/(app)/add-item" as any)} activeOpacity={0.9}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function SummaryCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}18` }]}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress} activeOpacity={0.85}>
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
    paddingTop: 22,
  },
  menuButton: { padding: 8 },
  logoutButton: { padding: 8 },
  greeting: { color: "rgba(255,255,255,0.82)", fontSize: 12, fontWeight: "700" },
  headerTitle: { fontSize: 21, fontWeight: "900", color: COLORS.textLight, marginTop: 2 },
  searchRow: { paddingHorizontal: 16, paddingTop: 14 },
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
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryCard: {
    width: "48.5%",
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  summaryValue: { marginTop: 10, fontSize: 18, fontWeight: "900", color: COLORS.textDark },
  summaryLabel: { marginTop: 2, fontSize: 12, fontWeight: "700", color: COLORS.textMuted },
  recommendationCard: {
    marginTop: 12,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: "900", color: COLORS.textDark, marginBottom: 8 },
  recommendationRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 7 },
  recommendationText: { flex: 1, color: COLORS.textDark, fontWeight: "700" },
  filterRow: { gap: 8, paddingTop: 12 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { borderColor: COLORS.primary, backgroundColor: "#ECFDF5" },
  filterText: { color: COLORS.textMuted, fontSize: 12, fontWeight: "800" },
  filterTextActive: { color: COLORS.primary },
  listTitle: { marginTop: 14, marginBottom: 8, fontSize: 16, fontWeight: "900", color: COLORS.textDark },
  itemCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  itemTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  itemName: { fontSize: 16, fontWeight: "900", color: COLORS.textDark },
  itemMeta: { marginTop: 5, color: COLORS.textMuted, fontSize: 12 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  expiryText: { marginTop: 10, color: COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  emptyWrap: { paddingTop: 34, alignItems: "center" },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "900", color: COLORS.textDark },
  emptySubtitle: { marginTop: 8, fontSize: 12, color: COLORS.textMuted, textAlign: "center", paddingHorizontal: 40 },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
