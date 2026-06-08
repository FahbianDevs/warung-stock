import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { COLORS } from "@/src/theme";

type PinInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
};

export function PinInput({ value, onChangeText, error }: PinInputProps) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={(next) => onChangeText(next.replace(/\D/g, "").slice(0, 4))}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        style={styles.hiddenInput}
        autoFocus
      />
      <View style={styles.digitRow}>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={[styles.digitBox, !!error && styles.digitError]}>
            <Text style={styles.digitText}>{value[index] ? "•" : ""}</Text>
          </View>
        ))}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  hiddenInput: { position: "absolute", width: 1, height: 1, opacity: 0 },
  digitRow: { flexDirection: "row", gap: 12 },
  digitBox: {
    width: 54,
    height: 58,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  digitError: { borderColor: COLORS.danger, backgroundColor: "#FEF2F2" },
  digitText: { color: COLORS.textDark, fontSize: 26, fontWeight: "900" },
  error: { marginTop: 10, color: COLORS.danger, fontSize: 12, fontWeight: "700" },
});
