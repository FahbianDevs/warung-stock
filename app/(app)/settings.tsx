import { COLORS } from "@/src/theme";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

type DrawerNavigation = DrawerNavigationProp<any>;

export default function SettingsScreen() {
  const navigation = useNavigation<DrawerNavigation>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>WARUNG-STOCK</Text>
          <Text style={styles.sub}>Smart Inventory Management untuk UMKM</Text>
          <View style={styles.divider} />
          <Text style={styles.item}>• SQLite: penyimpanan lokal (offline)</Text>
          <Text style={styles.item}>• Indikator stok rendah & kedaluwarsa</Text>
          <Text style={styles.item}>• Riwayat barang masuk/keluar</Text>
        </View>
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
  content: { padding: 16 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: 18, fontWeight: "900", color: COLORS.textDark },
  sub: { marginTop: 4, color: COLORS.textMuted },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  item: { color: COLORS.textMuted, marginBottom: 6 },
});

