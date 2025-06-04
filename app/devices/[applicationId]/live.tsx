import React, { useEffect, useState, useCallback, useRef } from "react";
import { Text, ScrollView, View, Dimensions, Alert, TouchableOpacity, StatusBar } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getDevices } from "../../../services/ttnApi";
import { BarChart, LineChart } from "react-native-chart-kit";
import Animated, { FadeInUp } from "react-native-reanimated";
import styles from "../../../styles/live.styles";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ResumenDiario from "@/components/ResumenDiario";
import { StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@/context/ThemeContext';
import { useApplication } from '@/context/ApplicationContext';
import { BACKEND_URL } from '@/config/appConfig.new';

export default function LiveDataScreen() {
  const [labels, setLabels] = useState<string[]>([]);
  const [humidities, setHumidities] = useState<number[]>([]);
  const [temperatures, setTemperatures] = useState<number[]>([]);
  const [historicos, setHistoricos] = useState<Record<string, any[]>>({});
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const exportRef = useRef(null);
  const { colors, isDark } = useTheme();

  // Obtener el ID de la aplicación del contexto
  const { applicationId: contextApplicationId } = useApplication();

  // Obtener el ID de la aplicación de los parámetros de la URL como respaldo
  const { applicationId: urlApplicationId } = useLocalSearchParams<{ applicationId: string }>();

  // Usar el ID del contexto si está disponible, de lo contrario usar el de la URL
  const applicationId = contextApplicationId || urlApplicationId;

  const fetchSensorData = async () => {
    try {
      if (!applicationId) {
        console.error("No se ha proporcionado un ID de aplicación");
        return;
      }

      console.log(`Obteniendo dispositivos para la aplicación: ${applicationId}`);

      // Obtener los dispositivos de la aplicación seleccionada
      const devicesData = await getDevices(console.log, applicationId);

      console.log(`📱 Live Data: Dispositivos obtenidos de TTN: ${devicesData.length}`);
      console.log('📱 Live Data: IDs de dispositivos:', devicesData.map(d => d.ids.device_id).join(', '));

      // Guardar los dispositivos en el estado
      setDevices(devicesData);

      // Obtener la lista completa de IDs de dispositivos (activos e inactivos)
      const allDeviceIds = devicesData.map((d) => d.ids.device_id);

      // Guardar la lista de dispositivos para uso futuro, incluyendo el ID de la aplicación
      await AsyncStorage.setItem(`saved_device_ids_${applicationId}`, JSON.stringify(allDeviceIds));

      // Cargar datos históricos guardados previamente
      const savedHistoricos = await loadSavedHistoricos(allDeviceIds);

      // Identificar dispositivos activos e inactivos para la visualización
      const activeDevices = devicesData.filter(
        (d) => typeof d.humedad === "number" && typeof d.temperatura === "number"
      );

      console.log(`Dispositivos activos: ${activeDevices.length}/${devicesData.length}`);
      console.log('Todos los dispositivos:', devicesData.map(d => d.ids.device_id).join(', '));

      // Mostrar todos los dispositivos, pero con valores nulos para los inactivos
      setLabels(devicesData.map(d => d.ids.device_id));
      setHumidities(devicesData.map((d) => d.humedad ?? 0));
      setTemperatures(devicesData.map((d) => d.temperatura ?? 0));

      // Combinar datos históricos guardados con nuevos datos
      const historicoData: Record<string, any[]> = { ...savedHistoricos };

      // Obtener nuevos datos históricos para todos los dispositivos
      await Promise.all(
        allDeviceIds.map(async (id) => {
          try {
            // Incluir el ID de la aplicación como parámetro de consulta
            const res = await fetch(`${BACKEND_URL}/historico/${id}?applicationId=${applicationId}`);
            const data = await res.json();

            if (data && data.length > 0) {
              historicoData[id] = data;

              // Guardar los datos históricos en AsyncStorage con el ID de la aplicación
              await AsyncStorage.setItem(`historico_${applicationId}_${id}`, JSON.stringify(data));
            }
          } catch (error) {
            console.log(`No se pudieron obtener datos nuevos para ${id}, usando datos guardados`);
            // Si hay un error, mantenemos los datos guardados previamente
          }
        })
      );

      setHistoricos(historicoData);
    } catch (error) {
      console.error("❌ Error al obtener datos:", error);

      // En caso de error, intentar cargar datos guardados
      try {
        if (applicationId) {
          const savedLabels = await AsyncStorage.getItem(`saved_device_ids_${applicationId}`);
          if (savedLabels) {
            const deviceIds = JSON.parse(savedLabels);
            const savedHistoricos = await loadSavedHistoricos(deviceIds);
            setHistoricos(savedHistoricos);
            setLabels(deviceIds);
          }
        }
      } catch (storageError) {
        console.error("Error al cargar datos guardados:", storageError);
      }
    }
  };

  // Función para cargar datos históricos guardados
  const loadSavedHistoricos = async (deviceIds: string[]) => {
    const historicoData: Record<string, any[]> = {};

    if (!applicationId) {
      return historicoData;
    }

    await Promise.all(
      deviceIds.map(async (id) => {
        try {
          // Cargar datos históricos con el ID de la aplicación
          const savedData = await AsyncStorage.getItem(`historico_${applicationId}_${id}`);
          if (savedData) {
            historicoData[id] = JSON.parse(savedData);
          }
        } catch (error) {
          console.error(`Error al cargar datos guardados para ${id} en aplicación ${applicationId}:`, error);
        }
      })
    );

    return historicoData;
  };

  useEffect(() => {
    console.log(`📱 Live Data useEffect: applicationId=${applicationId}, contextApplicationId=${contextApplicationId}, urlApplicationId=${urlApplicationId}`);

    if (applicationId) {
      console.log(`📱 Live Data: Iniciando con applicationId: ${applicationId}`);
      fetchSensorData();
      const interval = setInterval(fetchSensorData, 15000);
      return () => clearInterval(interval);
    } else {
      console.log('📱 Live Data: No hay applicationId');
    }
  }, [applicationId, contextApplicationId, urlApplicationId]);

  useFocusEffect(
    useCallback(() => {
      setAnimationKey((prev) => prev + 1);
    }, [])
  );

  const chartWidth = Math.max(Dimensions.get("window").width, labels.length * 80);

  const barChartConfig = {
    backgroundColor: isDark ? "#1c1c1e" : colors.card,
    backgroundGradientFrom: isDark ? "#1c1c1e" : colors.card,
    backgroundGradientTo: isDark ? "#1c1c1e" : colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`,
    labelColor: () => colors.text,
    style: { borderRadius: 16 },
    propsForLabels: {
      fontSize: 12,
      fontWeight: "bold"
    },
    propsForBackgroundLines: {
      stroke: isDark ? "#333" : "#e0e0e0"
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

  const exportarDatosJSON = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + "datos_sensores.json";
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(historicos, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("No disponible", "Compartir archivos no está disponible en este dispositivo");
        return;
      }

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert("Error", "No se pudo exportar el JSON");
      console.error(error);
    }
  };

  // Log para depuración
  console.log(`📱 Live Data Render: contextApplicationId=${contextApplicationId}, urlApplicationId=${urlApplicationId}, applicationId=${applicationId}, devices=${devices?.length}, labels=${labels?.length}`);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#1c1c1e' : colors.card }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? '#1c1c1e' : colors.card} />
      <ScrollView
        ref={exportRef}
        style={[styles.inner, { backgroundColor: isDark ? '#1c1c1e' : colors.card }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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

        <TouchableOpacity
          onPress={() => router.push("/comparar")}
          style={[styles.compareButton, { backgroundColor: isDark ? "#333" : colors.card }]}
        >
          <Text style={[styles.compareButtonText, { color: colors.text }]}>📊 Comparar sensores</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={fetchSensorData}
          style={[styles.compareButton, { backgroundColor: isDark ? "#333" : colors.card, marginTop: 10 }]}
        >
          <Text style={[styles.compareButtonText, { color: colors.text }]}>🔄 Actualizar datos</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: isDark ? '#00ffff' : colors.primary }]}>💧 Humedad</Text>

        {devices && devices.length > 0 ? (
          labels.length > 0 ? (
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

            <Text style={[styles.title, { marginTop: 20, color: isDark ? '#00ffff' : colors.primary }]}>🌡 Temperatura</Text>

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

            <Text style={[styles.title, { marginTop: 20, color: isDark ? '#00ffff' : colors.primary }]}>🔍 Mostrar solo un sensor</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {labels.map((id) => (
                <View key={`btn-${id}`} style={{ marginRight: 12 }}>
                  <Text
                    onPress={() => setSelectedSensor(id === selectedSensor ? null : id)}
                    style={{
                      color: selectedSensor === id ? "#00ffff" : isDark ? "#aaa" : colors.textSecondary,
                      fontWeight: "bold",
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderWidth: 1,
                      borderColor: selectedSensor === id ? "#00ffff" : isDark ? "#555" : colors.border,
                      borderRadius: 12,
                      backgroundColor: isDark ? "#222" : colors.card
                    }}
                  >
                    {id}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <Text style={[styles.title, { marginTop: 30, color: isDark ? '#00ffff' : colors.primary }]}>📈 Histórico por sensor</Text>

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

              // No mostrar sensores sin datos
              if (humedad.length === 0 && temp.length === 0) return null;

              // Solo mostrar datos reales, sin simulación para sensores inactivos
              const humedadData = humedad;
              const tempData = temp;
              const timeLabelsData = timeLabels;

              return (
                <View key={`historico-${id}`} style={{ marginBottom: 32 }}>
                  <Text style={[styles.title, { color: isDark ? '#00ffff' : colors.primary }]}>{id} • 💧 Humedad</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                      {humedadData.length >= 2 ? (
                        <LineChart
                          data={{ labels: timeLabelsData, datasets: [{ data: humedadData }] }}
                          width={chartWidth}
                          height={220}
                          chartConfig={lineChartConfig}
                          bezier
                          fromZero
                          style={StyleSheet.flatten([styles.chart, styles.chartLine])}
                        />
                      ) : (
                        <View style={[styles.chart, styles.chartLine, styles.noDataChart]}>
                          <Text style={styles.noDataChartText}>No hay suficientes datos para mostrar la gráfica</Text>
                        </View>
                      )}

                      {/* Ya no mostramos indicador de dispositivo desconectado porque solo mostramos activos */}
                    </View>
                  </ScrollView>

                  <Text style={[styles.title, { marginTop: 12, color: isDark ? '#00ffff' : colors.primary }]}>{id} • 🌡 Temperatura</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                      {tempData.length >= 2 ? (
                        <LineChart
                          data={{ labels: timeLabelsData, datasets: [{ data: tempData }] }}
                          width={chartWidth}
                          height={220}
                          chartConfig={lineChartConfig}
                          bezier
                          fromZero
                          style={StyleSheet.flatten([styles.chart, styles.chartLine])}
                        />
                      ) : (
                        <View style={[styles.chart, styles.chartLine, styles.noDataChart]}>
                          <Text style={styles.noDataChartText}>No hay suficientes datos para mostrar la gráfica</Text>
                        </View>
                      )}

                      {/* Ya no mostramos indicador de dispositivo desconectado porque solo mostramos activos */}
                    </View>
                  </ScrollView>
                </View>
              );
            })}

            {/* 📤 BOTONES DE EXPORTACIÓN */}
            <View style={styles.exportButtonsContainer}>
              <TouchableOpacity
                onPress={exportarGraficos}
                style={[styles.exportButton, { borderColor: "#00ffff" }]}
              >
                <Text style={[styles.exportButtonText, { color: "#00ffff" }]}>
                  📤 Exportar gráficos a imagen
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={exportarDatosCSV}
                style={[styles.exportButton, { borderColor: "#00ff99" }]}
              >
                <Text style={[styles.exportButtonText, { color: "#00ff99" }]}>
                  📄 Exportar datos a CSV
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={exportarDatosJSON}
                style={[styles.exportButton, { borderColor: "#ffcc00" }]}
              >
                <Text style={[styles.exportButtonText, { color: "#ffcc00" }]}>
                  📁 Exportar datos como JSON
                </Text>
              </TouchableOpacity>
            </View>

          </>
          ) : (
            <Text style={[styles.noDataText, { color: colors.textSecondary }]}>No hay datos disponibles para los sensores</Text>
          )
        ) : (
          <Text style={[styles.noDataText, { color: colors.textSecondary }]}>No hay dispositivos registrados en esta aplicación</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
