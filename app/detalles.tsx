import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDeviceById, deleteDevice } from '@/services/ttnApi';
import { styles } from '../styles/detalles.styles';

export default function DetallesDispositivo() {
  const { deviceId } = useLocalSearchParams();
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (deviceId) fetchDevice();
  }, [deviceId]);

  const fetchDevice = async () => {
    try {
      const result = await getDeviceById(deviceId as string);
      setDevice(result);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el dispositivo');
    } finally {
      setLoading(false);
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
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    device.status === 'active' ? '#4CAF50' : '#EF4444',
                },
              ]}
            >
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
            <DetailRow
              icon={device.status === 'active' ? 'check-circle' : 'close-circle'}
              label="Estado"
              value={device.status === 'active' ? 'Activo' : 'Inactivo'}
            />
            <DetailRow icon="numeric" label="Dev EUI" value={device.ids.dev_eui} />
            <DetailRow icon="numeric" label="Join EUI" value={device.join_eui} />
            <DetailRow
              icon="calendar"
              label="Creado en"
              value={device.created_at?.split('T')[0]}
            />

            {/* ✅ Mostramos temperatura y humedad si existen */}
            {device.temperatura !== undefined && (
              <DetailRow icon="thermometer" label="Temperatura" value={`${device.temperatura} °C`} />
            )}

            {device.humedad !== undefined && (
              <DetailRow icon="water-percent" label="Humedad" value={`${device.humedad} %`} />
            )}

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
