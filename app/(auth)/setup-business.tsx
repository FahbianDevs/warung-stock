import {
  AuthCard,
  AuthHeader,
  AuthTextInput,
  BusinessTypeCard,
  PrimaryButton,
} from "@/src/components/auth";
import { saveBusinessProfile } from "@/src/services/auth/authApi";
import { getSession } from "@/src/services/auth/session";
import { storage } from "@/src/services/storage";
import { COLORS } from "@/src/theme";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const businessTypes = [
  { label: "Warung makan", icon: "restaurant-outline" },
  { label: "Toko grosir", icon: "cube-outline" },
  { label: "Kedai minuman", icon: "cafe-outline" },
  { label: "Sembako", icon: "basket-outline" },
  { label: "Lainnya", icon: "briefcase-outline" },
];

const units = ["kg", "liter", "pcs"];

export default function SetupBusinessScreen() {
  const router = useRouter();
  const [businessName, setBusinessName] = React.useState("");
  const [businessType, setBusinessType] = React.useState("Warung makan");
  const [location, setLocation] = React.useState("");
  const [defaultUnit, setDefaultUnit] = React.useState("pcs");
  const [error, setError] = React.useState<string | undefined>();
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    storage.getItem("pendingBusinessSetupV1").then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as { businessName?: string };
        if (parsed.businessName) setBusinessName(parsed.businessName);
      } catch {
        return;
      }
    });
  }, []);

  const handleSave = async () => {
    if (!businessName.trim()) {
      setError("Nama warung belum diisi.");
      return;
    }
    setIsSaving(true);
    try {
      const session = await getSession();
      const raw = await storage.getItem("pendingBusinessSetupV1");
      const pending = raw ? JSON.parse(raw) : null;
      const userId = session?.user?.id ?? pending?.user?.id;
      if (userId) {
        await saveBusinessProfile({
          userId,
          businessName: businessName.trim(),
          businessType,
          location,
          defaultCurrency: "IDR",
          defaultUnit,
        });
      }
      await storage.setItem("storeNameV1", businessName.trim());
      await storage.removeItem("pendingBusinessSetupV1");
      router.replace("/(auth)/pin-lock" as any);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gagal menyimpan profil warung.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AuthHeader
          title="Lengkapi Profil Warung"
          subtitle="Bantu kami menyesuaikan aplikasi dengan usahamu."
          compact
        />
        <AuthCard>
          <AuthTextInput
            label="Nama warung"
            icon="storefront-outline"
            placeholder="Contoh: Warung Bu Sari"
            value={businessName}
            error={error}
            onChangeText={(value) => {
              setBusinessName(value);
              setError(undefined);
            }}
          />

          <Text style={styles.sectionLabel}>Pilih jenis usaha</Text>
          <View style={styles.businessGrid}>
            {businessTypes.map((type) => (
              <BusinessTypeCard
                key={type.label}
                title={type.label}
                icon={type.icon}
                active={businessType === type.label}
                onPress={() => setBusinessType(type.label)}
              />
            ))}
          </View>

          <AuthTextInput
            label="Lokasi opsional"
            icon="location-outline"
            placeholder="Contoh: Samarinda"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.sectionLabel}>Mata uang default</Text>
          <View style={styles.staticPill}>
            <Text style={styles.staticPillText}>Rupiah (IDR)</Text>
          </View>

          <Text style={styles.sectionLabel}>Satuan default</Text>
          <View style={styles.unitRow}>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[styles.unitChip, defaultUnit === unit && styles.unitChipActive]}
                onPress={() => setDefaultUnit(unit)}
              >
                <Text style={[styles.unitText, defaultUnit === unit && styles.unitTextActive]}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <PrimaryButton title="Simpan & Mulai" icon="checkmark-circle-outline" loading={isSaving} onPress={handleSave} />
        </AuthCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1, padding: 20, paddingBottom: 28, justifyContent: "center" },
  sectionLabel: { color: COLORS.textDark, fontSize: 13, fontWeight: "900", marginBottom: 9, marginTop: 4 },
  businessGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  staticPill: {
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  staticPillText: { color: COLORS.textDark, fontWeight: "800" },
  unitRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  unitChip: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unitChipActive: { backgroundColor: "#ECFDF5", borderColor: COLORS.primary },
  unitText: { color: COLORS.textMuted, fontWeight: "900" },
  unitTextActive: { color: COLORS.primary },
});
