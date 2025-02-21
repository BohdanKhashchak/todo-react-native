import { TextInput, type TextInputProps, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "rounded" | "underline";
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const backgroundColor = useThemeColor(
    { light: darkColor, dark: lightColor },
    "background"
  );
  const borderColor = useThemeColor({ light: "#ccc", dark: "#444" }, "tint");

  return (
    <TextInput
      style={[
        styles.base,
        { color, backgroundColor, borderColor },
        type === "rounded" ? styles.rounded : undefined,
        type === "underline" ? styles.underline : undefined,
        style,
      ]}
      placeholderTextColor={color}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 5,
  },
  rounded: {
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  underline: {
    borderBottomWidth: 2,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
  },
});
