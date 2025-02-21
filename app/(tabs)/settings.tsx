import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import ThemeToggleButton from "@/components/ThemeToggleButton";

export default function Settings() {
  return (
    <ThemedView style={styles.container}>
      <ThemeToggleButton />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
  },
});
