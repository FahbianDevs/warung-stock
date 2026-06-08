import { getInventoryStats } from "@/src/services/inventory";
import { COLORS } from "@/src/theme";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

type DrawerNavigation = DrawerNavigationProp<any>;

export default function StatisticsScreen() {
  const navigation = useNavigation<DrawerNavigation>();
  const [stats, setStats] = React.useState<Awaited<ReturnType<typeof getInventoryStats>> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      setStats(await getInventoryStats());
    } catch (e) {
      console.error(e);
      alert("Gagal memuat statistik.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      void load();
      return () => {};
    }, [load]),
  );

  const topOutgoing = stats?.topOutgoing ?? [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistik</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={topOutgoing}
        keyExtractor={(item) => item.itemName}
        refreshing={isLoading}
        onRefresh={() => void load()}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.grid}>
              <StatCard label="Masuk Minggu Ini" value={stats?.incomingThisWeek ?? 0} icon="download-outline" color={COLORS.secondary} />
              <StatCard label="Keluar Minggu Ini" value={stats?.outgoingThisWeek ?? 0} icon="arrow-up-outline" color={COLORS.danger} />
              <StatCard label="Nilai Stok" value={`Rp ${(stats?.stockValue ?? 0).toLocaleString("id-ID")}`} icon="cash-outline" color={COLORS.success} />
              <StatCard label="Kedaluwarsa" value={stats?.expiredCount ?? 0} icon="close-circle-outline" color={COLORS.warning} />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Ringkasan Mingguan</Text>
              <Bar label="Barang Masuk" value={stats?.incomingThisWeek ?? 0} max={Math.max(stats?.incomingThisWeek ?? 0, stats?.outgoingThisWeek ?? 0, 1)} color={COLORS.secondary} />
              <Bar label="Barang Keluar" value={stats?.outgoingThisWeek ?? 0} max={Math.max(stats?.incomingThisWeek ?? 0, stats?.outgoingThisWeek ?? 0, 1)} color={COLORS.danger} />
            </View>

            <Text style={styles.listTitle}>Bahan Paling Sering Keluar</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Icon name="analytics-outline" size={42} color={COLORS.textGray} />
            <Text style={styles.emptyTitle}>Belum ada transaksi keluar</Text>
            <Text style={styles.emptySubtitle}>Catat barang keluar untuk melihat statistik penggunaan.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.rankCard}>
            <View style={styles.rankNumber}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankTitle}>{item.itemName}</Text>
              <Text style={styles.rankSub}>
                Total keluar {item.total} {item.unit}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Icon name={icon} size={22} color={color} />
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <View style={styles.barWrap}>
      <View style={styles.barLabelRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{value}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.max(6, (value / max) * 100)}%`, backgroundColor: color }]} />
      </View>
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
  content: { padding: 16, paddingBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "48.5%",
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { marginTop: 10, fontSize: 18, fontWeight: "900", color: COLORS.textDark },
  statLabel: { marginTop: 3, fontSize: 12, color: COLORS.textMuted, fontWeight: "700" },
  chartCard: {
    marginTop: 12,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: "900", color: COLORS.textDark },
  barWrap: { marginTop: 14 },
  barLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  barLabel: { color: COLORS.textDark, fontWeight: "800" },
  barValue: { color: COLORS.textMuted, fontWeight: "800" },
  barTrack: { height: 10, backgroundColor: COLORS.inputBg, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999 },
  listTitle: { marginTop: 16, marginBottom: 8, fontSize: 16, fontWeight: "900", color: COLORS.textDark },
  rankCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  rankNumber: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { color: COLORS.primary, fontWeight: "900" },
  rankTitle: { fontSize: 15, fontWeight: "900", color: COLORS.textDark },
  rankSub: { marginTop: 4, fontSize: 12, color: COLORS.textMuted },
  emptyWrap: { paddingTop: 34, alignItems: "center" },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "900", color: COLORS.textDark },
  emptySubtitle: { marginTop: 8, fontSize: 12, color: COLORS.textMuted, textAlign: "center", paddingHorizontal: 30 },
});
