import { useAuth } from "@/src/hooks/useAuth";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const { authState, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Jika belum login, redirect ke (auth) group
    if (!authState?.isSignedIn) {
      router.replace("/(auth)/login");
    } else {
      // Jika sudah login, redirect ke (app) group
      router.replace("/(app)/dashboard");
    }
  }, [authState?.isSignedIn, isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#23050C",
        }}
      >
        <ActivityIndicator size="large" color="#D71920" />
      </View>
    );
  }

  return <Stack />;
}
