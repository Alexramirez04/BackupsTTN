import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions, Alert } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Picker } from "@react-native-picker/picker";
import { getDevices } from "@/services/ttnApi";
import { SafeAreaView } from "react-native-safe-area-context";
import { compararStyles } from "@/styles/comparar.styles";
import { useTheme } from '@/context/ThemeContext';
import { BACKEND_URL } from '@/config/appConfig.new';
import { useApplication } from '@/context/ApplicationContext';
const chartWidth = Dimensions.get("window").width - 30;

export default function CompararScreen() {
  const [labels, setLabels] = useState<string[]>([]);
  const [historicos, setHistoricos] = useState<Record<string, any[]>>({});
  const [sensor1, setSensor1] = useState<string | null>(null);
  const [sensor2, setSensor2] = useState<string | null>(null);
  const { applicationId } = useApplication();
  const styles = compararStyles();
  const { colors } = useTheme();

  const chartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    labelColor: () => "#fff",
    propsForVerticalLabels: {
      rotation: 90,
      fontSize: 10
    },
    propsForBackgroundLines: {
      stroke: "#333"
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!applicationId) {
          console.error("No se ha proporcionado un ID de aplicación");
          Alert.alert('Error', 'No se proporcionó un ID de aplicación');
          return;
        }

        console.log(`Obteniendo dispositivos para la aplicación: ${applicationId}`);
        const dispositivos = await getDevices(console.log, applicationId);
        const ids = dispositivos.map((d) => d.ids.device_id);
        setLabels(ids);

        const historicoData: Record<string, any[]> = {};
        await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`${BACKEND_URL}/historico/${id}?applicationId=${applicationId}`);
            const data = await res.json();
            historicoData[id] = data;
          })
        );
        setHistoricos(historicoData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Alert.alert('Error', 'No se pudieron cargar los datos de los dispositivos');
      }
    };

    fetchData();
  }, [applicationId]);

  const getLabels = () => {
    const datos = historicos[sensor1!] || [];
    return datos.map((d) =>
      new Date(d.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <SafeAreaView style={[styles.container, { flex: 1 }]}>
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.title}>📊 Comparar dos sensores</Text>

        <Text style={styles.label}>Sensor 1:</Text>
        <Picker
          selectedValue={sensor1}
          onValueChange={(value) => setSensor1(value)}
          style={styles.picker}
          dropdownIconColor={colors.text}
        >
          <Picker.Item label="Selecciona un sensor" value={null} />
          {labels.map((id) => (
            <Picker.Item key={id} label={id} value={id} />
          ))}
        </Picker>

        <Text style={styles.label}>Sensor 2:</Text>
        <Picker
          selectedValue={sensor2}
          onValueChange={(value) => setSensor2(value)}
          style={styles.picker}
          dropdownIconColor={colors.text}
        >
          <Picker.Item label="Selecciona otro sensor" value={null} />
          {labels.map((id) => (
            <Picker.Item key={id} label={id} value={id} />
          ))}
        </Picker>

        {sensor1 && sensor2 && historicos[sensor1] && historicos[sensor2] && (
          <>
            <Text style={styles.chartTitle}>🌡 Temperatura</Text>
            <LineChart
              width={chartWidth}
              height={220}
              fromZero
              bezier
              chartConfig={chartConfig}
              data={{
                labels: getLabels(),
                datasets: [
                  { data: historicos[sensor1].map((d) => d.temperatura ?? 0), color: () => "#00ffff" },
                  { data: historicos[sensor2].map((d) => d.temperatura ?? 0), color: () => "#ff00ff" }
                ],
                legend: [sensor1, sensor2]
              }}
              style={styles.chart}
            />

            <Text style={styles.chartTitle}>💧 Humedad</Text>
            <LineChart
              width={chartWidth}
              height={220}
              fromZero
              bezier
              chartConfig={chartConfig}
              data={{
                labels: getLabels(),
                datasets: [
                  { data: historicos[sensor1].map((d) => d.humedad ?? 0), color: () => "#00ffff" },
                  { data: historicos[sensor2].map((d) => d.humedad ?? 0), color: () => "#ff00ff" }
                ],
                legend: [sensor1, sensor2]
              }}
              style={styles.chart}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
