import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "./ThemedText";

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity style={styles.button} onPress={toggleTheme}>
      <ThemedText style={styles.text}>
        {theme === "light" ? "Switch to Dark" : "Switch to Light"}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default ThemeToggleButton;

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 50,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "gray",
    alignItems: "center",
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
