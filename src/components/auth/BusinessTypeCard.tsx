import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "@/src/theme";

type BusinessTypeCardProps = {
  title: string;
  icon: string;
  active: boolean;
  onPress: () => void;
};

export function BusinessTypeCard({ title, icon, active, onPress }: BusinessTypeCardProps) {
  return (
    <TouchableOpacity style={[styles.card, active && styles.active]} onPress={onPress} activeOpacity={0.85}>
      <Icon name={icon} size={24} color={active ? COLORS.primary : COLORS.textMuted} />
      <Text style={[styles.title, active && styles.titleActive]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 88,
    borderRadius: 18,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    justifyContent: "center",
    gap: 8,
  },
  active: { backgroundColor: "#ECFDF5", borderColor: COLORS.primary },
  title: { color: COLORS.textDark, fontSize: 13, fontWeight: "800", lineHeight: 18 },
  titleActive: { color: COLORS.primary },
});
