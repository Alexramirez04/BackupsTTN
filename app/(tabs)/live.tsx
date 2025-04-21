import React, { useState, useEffect } from "react";
import { View, SafeAreaView, Text, TouchableOpacity, ScrollView } from "react-native";
import LiveConsole from "../../components/LiveConsole";
import styles from "../../styles/live.styles";
import { getDevices, registerDevice, deleteDevice } from "../../services/ttnApi";

export default function LiveDataScreen() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const clearLogs = () => setLogs([]);

  const testGet = async () => {
    try {
      await getDevices(addLog);
    } catch (e) {}
  };

  const testRegister = async () => {
    const deviceId = "demo-device";
    try {
      await registerDevice(deviceId, addLog);
    } catch (e) {}
  };

  const testDelete = async () => {
    const deviceId = "demo-device";
    try {
      await deleteDevice(deviceId, addLog);
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>📡 Live Data</Text>

        <ScrollView
          horizontal
          contentContainerStyle={styles.buttonRow}
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.button} onPress={testGet}>
            <Text style={styles.buttonText}>📥 Obtener dispositivos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testRegister}>
            <Text style={styles.buttonText}>➕ Registrar demo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testDelete}>
            <Text style={styles.buttonText}>🗑️ Eliminar demo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={clearLogs}>
            <Text style={[styles.buttonText, { color: "#ff4f4f" }]}>🧹 Limpiar consola</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={{ flex: 1 }}>
            <LiveConsole logs={logs} onClear={clearLogs} />
            </View>
      </View>
    </SafeAreaView>
  );
}
