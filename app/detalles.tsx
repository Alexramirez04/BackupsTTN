import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDeviceById, deleteDevice, updateDevice } from '@/services/ttnApi';
import { styles } from '../styles/detalles.styles';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HistorialSensor from "@/components/HistorialSensor";
import DeviceStatusBadge from '@/components/DeviceStatusBadge';
import { useTheme } from '@/context/ThemeContext';
import AnimatedCard from '@/components/AnimatedCard';

export default function DetallesDispositivo() {
  const { deviceId, applicationId } = useLocalSearchParams<{ deviceId: string, applicationId: string }>();
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const router = useRouter();
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const { colors, isDark } = useTheme();

  // Definir los detalles del dispositivo para mostrar en la UI
  const details = device ? [
    {
      icon: 'chip',
      label: 'ID del dispositivo',
      value: device?.ids?.device_id || '—'
    },
    {
      icon: 'barcode',
      label: 'DevEUI',
      value: device?.ids?.dev_eui || '—'
    },
    {
      icon: 'barcode-scan',
      label: 'JoinEUI',
      value: device?.join_eui || '—'
    },
    {
      icon: 'key',
      label: 'AppKey',
      value: device?.root_keys?.app_key?.key || device?.app_key || '—'
    },
    {
      icon: 'radio-tower',
      label: 'Versión LoRaWAN',
      value: device?.lorawan_version || '—'
    },
    {
      icon: 'map-marker-path',
      label: 'Plan de frecuencia',
      value: device?.frequency_plan_id || '—'
    },
    {
      icon: 'cog',
      label: 'Versión parámetros regionales',
      value: device?.regional_parameters_version || '—'
    },
    // Parámetros de sensores
    {
      icon: 'water-percent',
      label: 'Humedad',
      value: device?.humedad !== undefined ? `${device.humedad} %` : '—'
    },
    {
      icon: 'thermometer',
      label: 'Temperatura',
      value: device?.temperatura !== undefined ? `${device.temperatura} °C` : '—'
    }
  ] : [];

  // Log para depuración
  useEffect(() => {
    console.log('Detalles - Params recibidos:', { deviceId, applicationId });
  }, [deviceId, applicationId]);

  useEffect(() => {
    if (deviceId) fetchDevice();
  }, [deviceId]);

  const fetchDevice = async () => {
    try {
      if (!applicationId) {
        console.error("No se ha proporcionado un ID de aplicación para obtener el dispositivo");
        Alert.alert('Error', 'No se proporcionó un ID de aplicación');
        return;
      }
      const result = await getDeviceById(deviceId as string, console.log, applicationId);
      setDevice(result);
      const notaGuardada = await AsyncStorage.getItem(`nota-${deviceId}`);
      if (notaGuardada) setNota(notaGuardada);
    } catch (error: any) {
      if (error?.message === 'No hay API Key guardada.') {
        setDevice(null);
        // No mostrar alerta, solo limpiar el estado
      } else {
        console.error("Error al cargar el dispositivo:", error);
        Alert.alert('Error', 'No se pudo cargar el dispositivo');
      }
    } finally {
      setLoading(false);
    }
  };

  const guardarNota = async () => {
    try {
      setGuardandoNota(true);
      await AsyncStorage.setItem(`nota-${deviceId}`, nota);
      Alert.alert('✅ Nota guardada correctamente');
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la nota');
    } finally {
      setGuardandoNota(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmación',
      `¿Estás seguro de que quieres eliminar el dispositivo ${device?.ids.device_id}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              if (!applicationId) {
                console.error("No se ha proporcionado un ID de aplicación para eliminar el dispositivo");
                Alert.alert('Error', 'No se proporcionó un ID de aplicación');
                return;
              }

              await deleteDevice(deviceId as string, console.log, applicationId);
              Alert.alert('Éxito', `Dispositivo ${device?.ids.device_id} eliminado`);
              // Volver a la página de dispositivos de la aplicación
              router.push(`/devices/${applicationId}/dispositivos`);
            } catch (error) {
              console.error("Error al eliminar el dispositivo:", error);
              Alert.alert('Error', 'No se pudo eliminar el dispositivo');
            }
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    if (!device) return;

    const exportData = {
      deviceId: device.ids.device_id,
      devEUI: device.ids.dev_eui,
      joinEUI: device.join_eui,
      appKey: device.app_key,
      lorawanVersion: device.lorawan_version,
      frequencyPlanId: device.frequency_plan_id,
      regionalParametersVersion: device.regional_parameters_version,
    };

    const fileUri = FileSystem.documentDirectory + `${device.ids.device_id}.json`;
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('No disponible', 'Compartir archivos no está disponible en este dispositivo');
      return;
    }

    await Sharing.shareAsync(fileUri);
  };

  const handleExportCSV = async () => {
    if (!device) return;

    const csvHeaders = [
      'deviceId',
      'devEUI',
      'joinEUI',
      'appKey',
      'lorawanVersion',
      'frequencyPlanId',
      'regionalParametersVersion'
    ];

    const csvValues = [
      device.ids.device_id,
      device.ids.dev_eui,
      device.join_eui,
      device.root_keys?.app_key?.key || device.app_key || 'N/A',
      device.lorawan_version,
      device.frequency_plan_id,
      device.regional_parameters_version
    ];

    const csvContent = `${csvHeaders.join(',')}\n${csvValues.join(',')}`;
    const fileUri = FileSystem.documentDirectory + `${device.ids.device_id}.csv`;

    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('No disponible', 'Compartir archivos no está disponible en este dispositivo');
      return;
    }

    await Sharing.shareAsync(fileUri);
  };

  return (
    <SafeAreaView style={[styles.safe, { flex: 1, backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 0,
          paddingBottom: 120, // Aumentado significativamente
          backgroundColor: colors.background
        }}
        showsVerticalScrollIndicator={true}
      >
        <ThemedText
          type="title"
          style={[
            styles.title,
            {
              marginTop: 20,
              color: isDark ? '#00ffff' : colors.primary
            }
          ]}
        >
          📋 Detalles del Dispositivo
        </ThemedText>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : device ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statusBadgeContainer}>
              <DeviceStatusBadge
                status={device.status}
                lastSeen={device.lastSeen}
                size="large"
              />
            </View>

            {details.map((detail, idx) => (
              <AnimatedCard delay={idx * 60} key={detail.label}>
                <DetailRow icon={detail.icon} label={detail.label} value={detail.value} />
              </AnimatedCard>
            ))}

            {/* Mostrar nota como dato visual */}
            {nota !== '' && (
              <AnimatedCard delay={details.length * 60 + 120}>
                <DetailRow icon="note" label="Nota del usuario" value={nota} />
              </AnimatedCard>
            )}

            {/* Campo para editar nota */}
            <View style={{ marginTop: 10 }}>
              <TextInput
                placeholder="Escribe aquí tu nota..."
                placeholderTextColor={colors.textSecondary}
                value={nota}
                onChangeText={setNota}
                multiline
                style={{
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  color: colors.text,
                  minHeight: 60,
                  marginBottom: 10
                }}
              />
              <TouchableOpacity
                onPress={guardarNota}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
                  💾 Guardar nota
                </ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setMostrarHistorial(!mostrarHistorial)}
              style={{
                backgroundColor: isDark ? '#444' : colors.inputBackground,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <ThemedText style={{ color: colors.primary, fontWeight: 'bold' }}>
                {mostrarHistorial ? 'Ocultar historial' : 'Mostrar historial'}
              </ThemedText>
            </TouchableOpacity>

            {mostrarHistorial && (
              <View style={{ marginTop: 20 }}>
                <HistorialSensor
                  deviceId={deviceId as string}
                  applicationId={applicationId as string}
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.exportButton, { borderColor: colors.border, backgroundColor: isDark ? '#333' : colors.inputBackground }]}
              onPress={handleExport}
            >
              <ThemedText style={[styles.exportButtonText, { color: colors.text }]}>📤 Exportar datos como JSON</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportButton, { borderColor: colors.border, backgroundColor: isDark ? '#333' : colors.inputBackground }]}
              onPress={handleExportCSV}
            >
              <ThemedText style={[styles.exportButtonText, { color: colors.text }]}>📤 Exportar datos como CSV</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.error }]}
              onPress={handleDelete}
            >
              <ThemedText style={styles.deleteButtonText}>Eliminar Dispositivo</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <ThemedText>No se encontraron datos.</ThemedText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <MaterialCommunityIcons name={icon} size={26} color={colors.textSecondary} />
      <View style={styles.textGroup}>
        <ThemedText type="defaultSemiBold" style={[styles.label, { color: colors.text }]}>
          {label}
        </ThemedText>
        <ThemedText style={[styles.value, { color: colors.textSecondary }]}>
          {value || '—'}
        </ThemedText>
      </View>
    </View>
  );
}

export const options = {
  title: 'Detalles del Dispositivo',
};
