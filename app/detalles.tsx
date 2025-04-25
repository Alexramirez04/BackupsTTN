import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDeviceById, deleteDevice } from '@/services/ttnApi';
import { styles } from '../styles/detalles.styles';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HistorialSensor from "@/components/HistorialSensor";

export default function DetallesDispositivo() {
  const { deviceId } = useLocalSearchParams();
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const router = useRouter();
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  useEffect(() => {
    if (deviceId) fetchDevice();
  }, [deviceId]);

  const fetchDevice = async () => {
    try {
      const result = await getDeviceById(deviceId as string);
      setDevice(result);
      const notaGuardada = await AsyncStorage.getItem(`nota-${deviceId}`);
      if (notaGuardada) setNota(notaGuardada);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el dispositivo');
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
              await deleteDevice(deviceId as string);
              Alert.alert('Éxito', `Dispositivo ${device?.ids.device_id} eliminado`);
              router.push('/dispositivos');
            } catch (error) {
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
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title" style={styles.title}>
          📋 Detalles del Dispositivo
        </ThemedText>

        {loading ? (
          <ActivityIndicator size="large" color="#0066cc" />
        ) : device ? (
          <View style={styles.card}>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: device.status === 'active' ? '#4CAF50' : '#EF4444',
              },
            ]}>
              <MaterialCommunityIcons
                name={device.status === 'active' ? 'check-circle' : 'close-circle'}
                size={18}
                color="#fff"
              />
              <ThemedText style={styles.statusBadgeText}>
                {device.status === 'active' ? 'Dispositivo activo' : 'Dispositivo inactivo'}
              </ThemedText>
            </View>

            <DetailRow icon="identifier" label="Device ID" value={device.ids.device_id} />
            <DetailRow icon="check-circle" label="Estado" value={device.status === 'active' ? 'Activo' : 'Inactivo'} />
            <DetailRow icon="numeric" label="Dev EUI" value={device.ids.dev_eui} />
            <DetailRow icon="numeric" label="Join EUI" value={device.join_eui} />
            <DetailRow icon="calendar" label="Creado en" value={device.created_at?.split('T')[0]} />

            {/* Datos de sensores */}
            {device.temperatura !== undefined && (
              <DetailRow icon="thermometer" label="Temperatura" value={`${device.temperatura} °C`} />
            )}
            {device.humedad !== undefined && (
              <DetailRow icon="water-percent" label="Humedad" value={`${device.humedad} %`} />
            )}

            {/* Mostrar nota como dato visual */}
            {nota !== '' && (
              <DetailRow icon="note" label="Nota del usuario" value={nota} />
            )}

            {/* Campo para editar nota */}
            <View style={{ marginTop: 10 }}>
              <TextInput
                placeholder="Escribe aquí tu nota..."
                placeholderTextColor="#9CA3AF"
                value={nota}
                onChangeText={setNota}
                multiline
                style={{
                  backgroundColor: '#fff',
                  borderColor: '#ccc',
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  color: '#111827',
                  minHeight: 60,
                  marginBottom: 10
                }}
              
              />
              <TouchableOpacity
                onPress={guardarNota}
                style={{
                  backgroundColor: '#3B82F6',
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
                backgroundColor: '#444',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <ThemedText style={{ color: '#00ffff', fontWeight: 'bold' }}>
                {mostrarHistorial ? 'Ocultar historial' : 'Mostrar historial'}
              </ThemedText>
            </TouchableOpacity>

            {mostrarHistorial && (
              <View style={{ marginTop: 20 }}>
                <HistorialSensor deviceId={deviceId as string} />
              </View>
            )}

            <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
              <ThemedText style={styles.exportButtonText}>📤 Exportar datos como JSON</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportButton} onPress={handleExportCSV}>
              <ThemedText style={styles.exportButtonText}>📤 Exportar datos como CSV</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
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
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name={icon} size={26} color="#4B5563" />
      <View style={styles.textGroup}>
        <ThemedText type="defaultSemiBold" style={styles.label}>
          {label}
        </ThemedText>
        <ThemedText style={styles.value}>{value || '—'}</ThemedText>
      </View>
    </View>
  );
}

export const options = {
  title: 'Detalles del Dispositivo',
};
