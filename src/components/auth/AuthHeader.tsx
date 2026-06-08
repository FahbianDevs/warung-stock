import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "@/src/theme";

type AuthHeaderProps = {
  title: string;
  subtitle: string;
  compact?: boolean;
};

export function AuthHeader({ title, subtitle, compact = false }: AuthHeaderProps) {
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={styles.logoMark}>
        <Icon name="cube-outline" size={30} color={COLORS.primary} />
      </View>
      <Text style={styles.brand}>WARUNG-STOCK</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingTop: 8, paddingBottom: 18 },
  compact: { paddingBottom: 10 },
  logoMark: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  brand: { marginTop: 12, color: COLORS.primary, fontSize: 20, fontWeight: "900" },
  title: { marginTop: 14, color: COLORS.textDark, fontSize: 24, fontWeight: "900", textAlign: "center" },
  subtitle: { marginTop: 8, color: COLORS.textMuted, fontSize: 14, textAlign: "center", lineHeight: 21 },
});
