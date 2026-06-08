import { resetInventoryData } from "@/src/services/inventory";
import { storage } from "@/src/services/storage";
import { COLORS } from "@/src/theme";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React from "react";
import { Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

type DrawerNavigation = DrawerNavigationProp<any>;

const STORE_NAME_KEY = "storeNameV1";

export default function SettingsScreen() {
  const navigation = useNavigation<DrawerNavigation>();
  const [storeName, setStoreName] = React.useState("Warung Saya");
  const [isSaving, setIsSaving] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      storage.getItem(STORE_NAME_KEY).then((value) => {
        if (value) setStoreName(value);
      });
      return () => {};
    }, []),
  );

  const saveStoreName = async () => {
    setIsSaving(true);
    try {
      await storage.setItem(STORE_NAME_KEY, storeName.trim() || "Warung Saya");
      alert("Nama warung berhasil disimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmReset = () => {
    Alert.alert(
      "Reset Data",
      "Semua bahan baku dan riwayat transaksi akan dihapus dari SQLite lokal.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetInventoryData();
              alert("Data stok berhasil direset.");
            } catch (e) {
              console.error(e);
              alert("Gagal reset data.");
            }
          },
        },
      ],
    );
  };

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
          <Text style={styles.sectionTitle}>Nama Warung</Text>
          <TextInput
            value={storeName}
            onChangeText={setStoreName}
            placeholder="Contoh: Warung Bu Sari"
            placeholderTextColor={COLORS.grayText}
            style={styles.input}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={saveStoreName} disabled={isSaving}>
            <Icon name="save-outline" size={18} color="#fff" />
            <Text style={styles.saveText}>{isSaving ? "Menyimpan..." : "Simpan Nama"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Data Lokal</Text>
          <Text style={styles.sub}>Aplikasi menyimpan bahan baku dan log transaksi di SQLite pada perangkat.</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={confirmReset}>
            <Icon name="trash-outline" size={18} color="#fff" />
            <Text style={styles.saveText}>Reset Data Stok</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>WARUNG-STOCK</Text>
          <Text style={styles.sub}>Smart Inventory Management untuk UMKM warung makan dan toko grosir kecil.</Text>
          <View style={styles.featureRow}>
            <Icon name="server-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.item}>SQLite offline</Text>
          </View>
          <View style={styles.featureRow}>
            <Icon name="alert-circle-outline" size={18} color={COLORS.warning} />
            <Text style={styles.item}>Indikator stok rendah dan kedaluwarsa</Text>
          </View>
          <View style={styles.featureRow}>
            <Icon name="swap-horizontal-outline" size={18} color={COLORS.primary} />
            <Text style={styles.item}>Riwayat barang masuk dan keluar</Text>
          </View>
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
  content: { padding: 16, gap: 12 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: "900", color: COLORS.textDark, marginBottom: 10 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textDark,
  },
  saveBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.danger,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontWeight: "900" },
  title: { fontSize: 18, fontWeight: "900", color: COLORS.textDark },
  sub: { marginTop: 4, marginBottom: 10, color: COLORS.textMuted, lineHeight: 20 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  item: { flex: 1, color: COLORS.textDark, fontWeight: "700" },
});
