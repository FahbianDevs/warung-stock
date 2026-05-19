import { inventoryInit, listItems, daysUntil, InventoryItem } from "@/src/services/inventory";
import { maybeNotifyStockAlerts } from "@/src/services/alerts";
import { COLORS } from "@/src/theme";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

type DrawerNavigation = DrawerNavigationProp<any>;

type ItemStatus = "LOW_STOCK" | "EXPIRING" | "OK";

function getItemStatus(item: InventoryItem): { status: ItemStatus; label: string; color: string } {
  if (item.quantity < item.minQuantity) {
    return { status: "LOW_STOCK", label: "Stok Rendah", color: "#C60000" };
  }

  if (item.expiryDate) {
    const d = daysUntil(item.expiryDate);
    if (d !== null && d <= 3) {
      return { status: "EXPIRING", label: "Mendekati Exp", color: "#D97706" };
    }
  }

  return { status: "OK", label: "Aman", color: "#16A34A" };
}

export default function DashboardScreen() {
  const navigation = useNavigation<DrawerNavigation>();
  const router = useRouter();
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const load = React.useCallback(async (q?: string) => {
    setIsLoading(true);
    try {
      await inventoryInit();
      const rows = await listItems({ search: q ?? search });
      setItems(rows);
      // Notifikasi 1x per hari (jika ada stok rendah / mendekati kedaluwarsa)
      void maybeNotifyStockAlerts(rows);
    } catch (e) {
      console.error(e);
      alert("Gagal memuat data stok.");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useFocusEffect(
    React.useCallback(() => {
      void load();
      return () => {};
    }, [load]),
  );

  const handleLogout = async () => {
    try {
      router.replace("/(auth)/logout");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const handleMenuOpen = () => {
    navigation.openDrawer();
  };

  const handleAdd = () => {
    router.push("/(app)/add-item" as any);
  };

  const handleOpenItem = (id: number) => {
    router.push(
      { pathname: "/(app)/item/[id]" as any, params: { id: String(id) } } as any,
    );
  };

  const lowCount = items.filter((i) => i.quantity < i.minQuantity).length;
  const expiringCount = items.filter((i) => {
    if (!i.expiryDate) return false;
    const d = daysUntil(i.expiryDate);
    return d !== null && d <= 3;
  }).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuOpen}>
          <Icon name="menu" size={28} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WARUNG-STOCK</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari bahan baku..."
            placeholderTextColor={COLORS.grayText}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => void load(search)}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => { setSearch(""); void load(""); }}>
              <Icon name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statChipValue}>{items.length}</Text>
          <Text style={styles.statChipLabel}>Total</Text>
        </View>
        <View style={[styles.statChip, { borderColor: "#C60000" }]}>
          <Text style={[styles.statChipValue, { color: "#C60000" }]}>{lowCount}</Text>
          <Text style={styles.statChipLabel}>Stok rendah</Text>
        </View>
        <View style={[styles.statChip, { borderColor: "#D97706" }]}>
          <Text style={[styles.statChipValue, { color: "#D97706" }]}>{expiringCount}</Text>
          <Text style={styles.statChipLabel}>Mendekati exp</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        refreshing={isLoading}
        onRefresh={() => void load()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Belum ada stok</Text>
            <Text style={styles.emptySubtitle}>
              Tekan tombol + untuk menambahkan bahan baku pertama.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = getItemStatus(item);
          return (
            <TouchableOpacity
              style={styles.itemCard}
              onPress={() => handleOpenItem(item.id)}
              activeOpacity={0.85}
            >
              <View style={styles.itemTopRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={[styles.badge, { backgroundColor: meta.color }]}>
                  <Text style={styles.badgeText}>{meta.label}</Text>
                </View>
              </View>

              <Text style={styles.itemMeta}>
                {item.category ? `${item.category} • ` : ""}
                {item.quantity} {item.unit}
                {item.expiryDate ? ` • Exp: ${item.expiryDate}` : ""}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.9}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.primary,
    paddingTop: 20,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textLight,
  },
  logoutButton: {
    padding: 8,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
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
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
    color: "#111",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  statChip: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statChipValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },
  statChipLabel: {
    fontSize: 11,
    marginTop: 2,
    color: COLORS.textMuted,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110,
  },
  itemCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  itemMeta: {
    marginTop: 6,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  emptyWrap: {
    paddingTop: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 40,
  },
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
