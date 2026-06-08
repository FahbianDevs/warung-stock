import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "@/src/theme";

type OnboardingSlideProps = {
  icon: string;
  title: string;
  body: string;
};

export function OnboardingSlide({ icon, title, body }: OnboardingSlideProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={62} color={COLORS.secondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 38,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { marginTop: 26, fontSize: 24, fontWeight: "900", color: COLORS.textDark, textAlign: "center", lineHeight: 31 },
  body: { marginTop: 12, color: COLORS.textMuted, fontSize: 15, textAlign: "center", lineHeight: 23 },
});
