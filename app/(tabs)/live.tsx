import React, { useEffect, useState, useCallback, useRef } from "react";
import { SafeAreaView, Text, ScrollView, View, Dimensions, Alert, Button, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getDevices } from "../../services/ttnApi";
import { BarChart, LineChart } from "react-native-chart-kit";
import Animated, { FadeInUp } from "react-native-reanimated";
import styles from "../../styles/live.styles";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import ResumenDiario from "@/components/ResumenDiario";

const BACKEND_URL = "https://52c3-85-50-83-166.ngrok-free.app";

export default function LiveDataScreen() {
  const [labels, setLabels] = useState<string[]>([]);
  const [humidities, setHumidities] = useState<number[]>([]);
  const [temperatures, setTemperatures] = useState<number[]>([]);
  const [historicos, setHistoricos] = useState<Record<string, any[]>>({});
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const exportRef = useRef(null);

  const fetchSensorData = async () => {
    try {
      const devices = await getDevices();
      const filtered = devices.filter(
        (d) => typeof d.humedad === "number" && typeof d.temperatura === "number"
      );

      const ids = filtered.map((d) => d.ids.device_id);
      setLabels(ids);
      setHumidities(filtered.map((d) => d.humedad ?? 0));
      setTemperatures(filtered.map((d) => d.temperatura ?? 0));

      const historicoData: Record<string, any[]> = {};
      await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`${BACKEND_URL}/historico/${id}`);
          const data = await res.json();
          historicoData[id] = data;
        })
      );

      setHistoricos(historicoData);
    } catch (error) {
      console.error("❌ Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 15000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setAnimationKey((prev) => prev + 1);
    }, [])
  );

  const chartWidth = Math.max(Dimensions.get("window").width, labels.length * 80);

  const barChartConfig = {
    backgroundColor: "#1c1c1e",
    backgroundGradientFrom: "#1c1c1e",
    backgroundGradientTo: "#1c1c1e",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
    labelColor: () => "#fff",
    style: { borderRadius: 16 },
    propsForLabels: {
      fontSize: 12,
      fontWeight: "bold"
    },
    propsForBackgroundLines: {
      stroke: "#333"
    }
  };

  const lineChartConfig = {
    ...barChartConfig,
    propsForVerticalLabels: {
      rotation: 90,
      fontSize: 10
    }
  };

  const exportarGraficos = async () => {
    try {
      const uri = await captureRef(exportRef, {
        format: "png",
        quality: 1
      });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Error", "No se pudo exportar la imagen");
      console.error(error);
    }
  };

  const exportarDatosCSV = async () => {
    try {
      const lines = [
        "Sensor,Timestamp,Humedad,Temperatura"
      ];
  
      labels.forEach((sensorId) => {
        const datos = historicos[sensorId] || [];
        datos.forEach((d) => {
          const ts = new Date(d.ts).toISOString();
          const humedad = typeof d.humedad === "number" ? d.humedad : "";
          const temperatura = typeof d.temperatura === "number" ? d.temperatura : "";
          lines.push(`${sensorId},${ts},${humedad},${temperatura}`);
        });
      });
  
      const csvContent = lines.join("\n");
      const fileUri = FileSystem.documentDirectory + "datos_sensores.csv";
  
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
  
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("No disponible", "Compartir archivos no está disponible en este dispositivo");
        return;
      }
  
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert("Error", "No se pudo exportar el CSV");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={exportRef} style={styles.inner} showsVerticalScrollIndicator={false}>
        <ResumenDiario
          total={labels.length}
          activos={labels.filter((_, i) => humidities[i] !== null && temperatures[i] !== null).length}
          inactivos={labels.filter((_, i) => humidities[i] === null || temperatures[i] === null).length}
          mediaTemp={
            labels.length
              ? (temperatures.reduce((a, b) => a + b, 0) / labels.length).toFixed(1)
              : "0"
          }
          mediaHumedad={
            labels.length
              ? (humidities.reduce((a, b) => a + b, 0) / labels.length).toFixed(1)
              : "0"
          }
          ultimaActualizacion={
            labels.length
              ? new Date(
                  Math.max(
                    ...labels.map((id) => {
                      const hist = historicos[id];
                      if (!hist?.length) return 0;
                      return new Date(hist[hist.length - 1].ts).getTime();
                    })
                  )
                )
              : null
          }
        />

        <Text style={styles.title}>💧 Humedad</Text>

        {labels.length > 0 ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Animated.View key={`humidity-${animationKey}`} entering={FadeInUp.duration(1000)}>
                <BarChart
                  data={{
                    labels: selectedSensor ? [selectedSensor] : labels,
                    datasets: [
                      { data: selectedSensor ? [humidities[labels.indexOf(selectedSensor)]] : humidities }
                    ]
                  }}
                  width={chartWidth}
                  height={250}
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix="%"
                  showValuesOnTopOfBars
                  segments={5}
                  withInnerLines
                  chartConfig={barChartConfig}
                  style={styles.chart}
                />
              </Animated.View>
            </ScrollView>

            <Text style={[styles.title, { marginTop: 20 }]}>🌡 Temperatura</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Animated.View key={`temperature-${animationKey}`} entering={FadeInUp.duration(1000)}>
                <BarChart
                  data={{
                    labels: selectedSensor ? [selectedSensor] : labels,
                    datasets: [
                      { data: selectedSensor ? [temperatures[labels.indexOf(selectedSensor)]] : temperatures }
                    ]
                  }}
                  width={chartWidth}
                  height={250}
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix="°C"
                  showValuesOnTopOfBars
                  segments={5}
                  withInnerLines
                  chartConfig={barChartConfig}
                  style={styles.chart}
                />
              </Animated.View>
            </ScrollView>

            <Text style={[styles.title, { marginTop: 20 }]}>🔍 Mostrar solo un sensor</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {labels.map((id) => (
                <View key={`btn-${id}`} style={{ marginRight: 12 }}>
                  <Text
                    onPress={() => setSelectedSensor(id === selectedSensor ? null : id)}
                    style={{
                      color: selectedSensor === id ? "#00ffff" : "#aaa",
                      fontWeight: "bold",
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderWidth: 1,
                      borderColor: selectedSensor === id ? "#00ffff" : "#555",
                      borderRadius: 12,
                      backgroundColor: "#222"
                    }}
                  >
                    {id}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <Text style={[styles.title, { marginTop: 30 }]}>📈 Histórico por sensor</Text>

            {(selectedSensor ? [selectedSensor] : labels).map((id) => {
              const datos = historicos[id] || [];

              const humedad = datos
                .map((d) => Number.isFinite(d.humedad) ? d.humedad : 0)
                .filter((v) => typeof v === "number");

              const temp = datos
                .map((d) => Number.isFinite(d.temperatura) ? d.temperatura : 0)
                .filter((v) => typeof v === "number");

              const timeLabels = datos.map((d) =>
                new Date(d.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              );

              if (humedad.length < 2 || temp.length < 2) return null;

              return (
                <View key={`historico-${id}`} style={{ marginBottom: 32 }}>
                  <Text style={styles.title}>{id} • 💧 Humedad</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                      data={{ labels: timeLabels, datasets: [{ data: humedad }] }}
                      width={chartWidth}
                      height={220}
                      chartConfig={lineChartConfig}
                      bezier
                      fromZero
                      style={styles.chart}
                      />
                  </ScrollView>

                  <Text style={[styles.title, { marginTop: 12 }]}>{id} • 🌡 Temperatura</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                      data={{ labels: timeLabels, datasets: [{ data: temp }] }}
                      width={chartWidth}
                      height={220}
                      chartConfig={lineChartConfig}
                      bezier
                      fromZero
                      style={styles.chart}
                      />
                  </ScrollView>
                </View>
              );
            })}

            {/* 📤 BOTÓN EXPORTAR */}
            <View style={{ paddingBottom: 40, marginTop: 20, alignItems: "center" }}>
              <TouchableOpacity
                onPress={exportarGraficos}
                style={{
                  borderColor: "#00ffff",
                  borderWidth: 2,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20
                }}
              >
                <Text style={{ color: "#00ffff", fontWeight: "bold", fontSize: 16 }}>
                  📤 Exportar gráficos a imagen
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={exportarDatosCSV}
                style={{
                  borderColor: "#00ff99",
                  borderWidth: 2,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 12
                }}
              >
                <Text style={{ color: "#00ff99", fontWeight: "bold", fontSize: 16 }}>
                  📄 Exportar datos a CSV
                </Text>
              </TouchableOpacity>

            </View>

          </>
        ) : (
          <Text style={styles.noDataText}>No hay datos disponibles</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
