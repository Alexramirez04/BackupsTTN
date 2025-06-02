import React, { useRef, useEffect } from "react";
import { ScrollView, Text, View, Button, StyleSheet } from "react-native";

type Props = {
  logs: string[];
  onClear: () => void;
};

export default function LiveConsole({ logs, onClear }: Props) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📡 Live Data (API)</Text>
      <ScrollView
        style={styles.console}
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        {logs.map((line, idx) => (
          <Text key={idx} style={styles.logLine}>{line}</Text>
        ))}
      </ScrollView>
      <Button title="Limpiar consola" onPress={onClear} color="#e53935" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#111" },
  title: { color: "white", fontSize: 20, marginBottom: 10 },
  console: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 6,
    borderColor: "#444",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  logLine: {
    fontSize: 12,
    color: "#00ff90",
    fontFamily: "Courier New",
    marginBottom: 4,
  },
});
