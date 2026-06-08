import React from "react";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from "@/src/theme";
import { AuthTextInput } from "./AuthTextInput";

type PasswordInputProps = {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onChangeText: (value: string) => void;
};

export function PasswordInput({ label, value, placeholder, error, onChangeText }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <AuthTextInput
      label={label}
      icon="lock-closed-outline"
      value={value}
      placeholder={placeholder}
      error={error}
      onChangeText={onChangeText}
      secureTextEntry={!visible}
      autoCapitalize="none"
      right={
        <TouchableOpacity onPress={() => setVisible((current) => !current)} hitSlop={10}>
          <Icon name={visible ? "eye-off-outline" : "eye-outline"} size={21} color={COLORS.textMuted} />
        </TouchableOpacity>
      }
    />
  );
}
