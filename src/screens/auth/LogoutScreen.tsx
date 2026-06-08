import { logout } from "@/src/services/auth/authApi";
import { getSession } from "@/src/services/auth/session";
import { storage } from "@/src/services/storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LogoutScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const session = await getSession();
        await logout(session?.token ?? null);
        await storage.removeItem("pinUnlockedV1");
        if (!cancelled) router.replace("/(auth)/login");
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Logout gagal.");
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#D71920" />
      <Text style={styles.text}>{error ? error : "Mengeluarkan akun..."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23050C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  text: {
    marginTop: 12,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
