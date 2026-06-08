import { useAuth } from "@/src/hooks/useAuth";
import { storage } from "@/src/services/storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const { authState, isLoading } = useAuth();
  const router = useRouter();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    storage
      .getItem("onboardingCompleteV1")
      .then((value) => setHasSeenOnboarding(value === "true"))
      .catch(() => setHasSeenOnboarding(true));
  }, []);

  useEffect(() => {
    if (isLoading || hasSeenOnboarding === null) return;

    if (!hasSeenOnboarding) {
      storage.getItem("onboardingCompleteV1").then((value) => {
        if (value === "true") setHasSeenOnboarding(true);
      });
      router.replace("/(auth)/onboarding" as any);
      return;
    }

    if (!authState?.isSignedIn) {
      router.replace("/(auth)/login");
    } else {
      storage.getItem("pinEnabledV1").then(async (enabled) => {
        const pendingSetup = await storage.getItem("pendingBusinessSetupV1");
        if (pendingSetup) {
          router.replace("/(auth)/setup-business" as any);
          return;
        }
        const unlocked = await storage.getItem("pinUnlockedV1");
        if (enabled === "true" && unlocked !== "true") {
          router.replace({ pathname: "/(auth)/pin-lock" as any, params: { mode: "unlock" } } as any);
        } else {
          router.replace("/(app)/dashboard");
        }
      });
    }
  }, [authState?.isSignedIn, hasSeenOnboarding, isLoading, router]);

  if (isLoading || hasSeenOnboarding === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#DCFCE7",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 28,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Icon name="cube-outline" size={42} color="#22C55E" />
        </View>
        <Text style={{ color: "#1E293B", fontSize: 24, fontWeight: "900" }}>
          WARUNG-STOCK
        </Text>
        <Text style={{ color: "#64748B", fontSize: 14, fontWeight: "700", marginTop: 6, marginBottom: 18 }}>
          Kelola stok warung lebih mudah
        </Text>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack />
    </SafeAreaProvider>
  );
}
