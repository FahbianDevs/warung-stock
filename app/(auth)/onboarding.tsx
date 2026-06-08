import { OnboardingSlide, PrimaryButton, SecondaryButton } from "@/src/components/auth";
import { storage } from "@/src/services/storage";
import { COLORS } from "@/src/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const slides = [
  {
    icon: "albums-outline",
    title: "Pantau Stok Warung",
    body: "Catat semua bahan baku dan barang dagangan dalam satu aplikasi.",
  },
  {
    icon: "notifications-outline",
    title: "Peringatan Stok Menipis",
    body: "Dapatkan tanda otomatis saat bahan mulai habis.",
  },
  {
    icon: "calendar-outline",
    title: "Cegah Barang Kedaluwarsa",
    body: "Pantau tanggal kedaluwarsa agar stok lebih aman dan modal tidak terbuang.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = React.useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  const finish = async () => {
    await storage.setItem("onboardingCompleteV1", "true");
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#DCFCE7" />
      <View style={styles.logoWrap}>
        <View style={styles.logoMark}>
          <Icon name="cube-outline" size={30} color={COLORS.primary} />
        </View>
        <Text style={styles.logoText}>WARUNG-STOCK</Text>
        <Text style={styles.tagline}>Kelola stok warung lebih mudah</Text>
      </View>

      <OnboardingSlide icon={slide.icon} title={slide.title} body={slide.body} />

      <View style={styles.dots}>
        {slides.map((item, dotIndex) => (
          <View key={item.title} style={[styles.dot, dotIndex === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        <SecondaryButton title="Lewati" onPress={finish} style={styles.actionButton} />
        <PrimaryButton
          title={isLast ? "Mulai Sekarang" : "Lanjut"}
          icon={isLast ? "rocket-outline" : "arrow-forward-outline"}
          onPress={() => (isLast ? void finish() : setIndex((current) => current + 1))}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DCFCE7", padding: 22 },
  logoWrap: { marginTop: 32, marginBottom: 18, alignItems: "center" },
  logoMark: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  logoText: { marginTop: 10, color: COLORS.primary, fontSize: 22, fontWeight: "900" },
  tagline: { marginTop: 4, color: COLORS.textMuted, fontSize: 13, fontWeight: "700" },
  dots: { flexDirection: "row", alignSelf: "center", gap: 7, marginTop: 18, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#BBF7D0" },
  dotActive: { width: 26, backgroundColor: COLORS.primary },
  actions: { flexDirection: "row", gap: 12, paddingBottom: 12 },
  actionButton: { flex: 1 },
});
