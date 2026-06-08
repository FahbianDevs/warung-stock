import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "@/src/theme";

type ButtonProps = TouchableOpacityProps & {
  title: string;
  icon?: string;
  loading?: boolean;
};

export function PrimaryButton({ title, icon, loading, disabled, style, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.primary, (disabled || loading) && styles.disabled, style]}
      disabled={disabled || loading}
      activeOpacity={0.9}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" color="#fff" /> : icon ? <Icon name={icon} size={19} color="#fff" /> : null}
      <Text style={styles.primaryText}>{loading ? "Memproses..." : title}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ title, icon, style, ...props }: ButtonProps) {
  return (
    <TouchableOpacity style={[styles.secondary, style]} activeOpacity={0.85} {...props}>
      {icon ? <Icon name={icon} size={18} color={COLORS.primary} /> : null}
      <Text style={styles.secondaryText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function SocialDemoButton(props: Omit<ButtonProps, "icon">) {
  return <SecondaryButton icon="flash-outline" {...props} />;
}

const styles = StyleSheet.create({
  primary: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  disabled: { opacity: 0.65 },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "900" },
  secondary: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryText: { color: COLORS.primary, fontSize: 14, fontWeight: "900" },
});
