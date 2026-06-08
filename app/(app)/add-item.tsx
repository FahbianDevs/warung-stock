import { createItem, getItemById, parseYyyyMmDd, updateItem } from "@/src/services/inventory";
import { COLORS } from "@/src/theme";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
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

function toNumber(value: string) {
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

export default function AddItemScreen() {
  const navigation = useNavigation<DrawerNavigation>();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const itemId = id ? Number(id) : null;
  const isEdit = Number.isFinite(itemId);
  const [name, setName] = React.useState("");
  const [quantity, setQuantity] = React.useState("0");
  const [unit, setUnit] = React.useState("pcs");
  const [category, setCategory] = React.useState("");
  const [minQuantity, setMinQuantity] = React.useState("0");
  const [expiryDate, setExpiryDate] = React.useState(""); // YYYY-MM-DD
  const [purchasePrice, setPurchasePrice] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleMenuOpen = () => navigation.openDrawer();

  React.useEffect(() => {
    if (!isEdit || !itemId) return;

    const loadItem = async () => {
      const item = await getItemById(itemId);
      if (!item) return alert("Barang tidak ditemukan.");
      setName(item.name);
      setQuantity(String(item.quantity));
      setUnit(item.unit);
      setCategory(item.category);
      setMinQuantity(String(item.minQuantity));
      setExpiryDate(item.expiryDate ?? "");
      setPurchasePrice(item.purchasePrice !== null ? String(item.purchasePrice) : "");
      setNotes(item.notes);
    };

    void loadItem();
  }, [isEdit, itemId]);

  const handleSave = async () => {
    const qty = toNumber(quantity);
    const minQty = toNumber(minQuantity);

    if (!name.trim()) return alert("Nama bahan wajib diisi.");
    if (!Number.isFinite(qty) || qty < 0) return alert("Jumlah harus angka >= 0.");
    if (!Number.isFinite(minQty) || minQty < 0) return alert("Batas minimum harus angka >= 0.");
    if (!unit.trim()) return alert("Satuan wajib diisi.");
    const price = purchasePrice.trim() ? toNumber(purchasePrice) : null;
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      return alert("Harga beli harus angka >= 0.");
    }

    let exp: string | null = null;
    if (expiryDate.trim()) {
      const parsed = parseYyyyMmDd(expiryDate);
      if (!parsed) return alert("Format tanggal kedaluwarsa harus YYYY-MM-DD.");
      exp = expiryDate.trim();
    }

    setIsSaving(true);
    try {
      if (isEdit && itemId) {
        await updateItem(itemId, {
          name,
          quantity: qty,
          unit,
          category,
          minQuantity: minQty,
          expiryDate: exp,
          purchasePrice: price,
          notes,
        });
        router.replace({ pathname: "/(app)/item/[id]" as any, params: { id: String(itemId) } } as any);
      } else {
        await createItem({
          name,
          quantity: qty,
          unit,
          category,
          minQuantity: minQty,
          expiryDate: exp,
          purchasePrice: price,
          notes,
        });
        router.replace("/(app)/dashboard");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan barang.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuOpen}>
          <Icon name="menu" size={28} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? "Edit Barang" : "Tambah Barang"}</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.label}>Nama Bahan</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Contoh: Beras"
              placeholderTextColor={COLORS.grayText}
              style={styles.input}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Jumlah</Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.grayText}
                  style={styles.input}
                />
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Satuan</Text>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="kg / liter / pcs"
                  placeholderTextColor={COLORS.grayText}
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.label}>Kategori</Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="Contoh: Sembako"
              placeholderTextColor={COLORS.grayText}
              style={styles.input}
            />

            <Text style={styles.label}>Batas Minimum (stok rendah)</Text>
            <TextInput
              value={minQuantity}
              onChangeText={setMinQuantity}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={COLORS.grayText}
              style={styles.input}
            />

            <Text style={styles.label}>Tanggal Kedaluwarsa (opsional)</Text>
            <TextInput
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.grayText}
              style={styles.input}
            />

            <Text style={styles.label}>Harga Beli per Satuan (opsional)</Text>
            <TextInput
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="decimal-pad"
              placeholder="Contoh: 14500"
              placeholderTextColor={COLORS.grayText}
              style={styles.input}
            />

            <Text style={styles.label}>Catatan (opsional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Contoh: supplier langganan / kualitas premium"
              placeholderTextColor={COLORS.grayText}
              style={[styles.input, styles.textArea]}
              multiline
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving} activeOpacity={0.9}>
              <Text style={styles.saveText}>{isSaving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: { fontSize: 12, fontWeight: "700", color: COLORS.textDark, marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: "#111",
  },
  textArea: { minHeight: 84, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  saveBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "800" },
});
