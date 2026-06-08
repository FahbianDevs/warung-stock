import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "@/src/theme";

type AuthTextInputProps = TextInputProps & {
  label: string;
  icon: string;
  error?: string;
  right?: React.ReactNode;
};

export function AuthTextInput({ label, icon, error, right, style, ...props }: AuthTextInputProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, !!error && styles.inputError]}>
        <Icon name={icon} size={20} color={error ? COLORS.danger : COLORS.textMuted} />
        <TextInput
          placeholderTextColor={COLORS.grayText}
          style={[styles.input, style]}
          {...props}
        />
        {right}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { color: COLORS.textDark, fontSize: 13, fontWeight: "800", marginBottom: 7 },
  inputWrap: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputError: { borderColor: COLORS.danger, backgroundColor: "#FEF2F2" },
  input: { flex: 1, color: COLORS.textDark, fontSize: 15, paddingVertical: 12 },
  error: { marginTop: 6, color: COLORS.danger, fontSize: 12, fontWeight: "700" },
});
