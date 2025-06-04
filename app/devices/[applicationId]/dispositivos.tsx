import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { getDevices } from '@/services/ttnApi';
import MiniDashboard from '@/components/MiniDashboard';
import DeviceStatusBadge from '@/components/DeviceStatusBadge';
import { styles } from '../../../styles/dispositivos.styles';
import LottieView from 'lottie-react-native';
import { useTheme } from '@/context/ThemeContext';

type Device = {
  ids: {
    device_id: string;
  };
  status: string;
  lastSeen?: string | null;
};

export default function DispositivosScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [animationKey, setAnimationKey] = useState(0);
  const router = useRouter();
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();
  const { colors, isDark } = useTheme();

  // 🔁 Refresco automático
  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 15000);
    return () => clearInterval(interval);
  }, [applicationId]);

  useEffect(() => {
    filterDevices();
  }, [searchText]);

  useFocusEffect(
    useCallback(() => {
      setAnimationKey((prev) => prev + 1);
    }, [])
  );

  const loadDevices = async () => {
    try {
      setLoading(true);
      if (!applicationId) {
        Alert.alert('Error', 'No se proporcionó un ID de aplicación');
        return;
      }
      const result = await getDevices(console.log, applicationId);
      console.log('Dispositivos obtenidos:', result);
      const devicesWithStatus = result.map((device: Device) => ({
        ...device,
        status: device.status || 'inactive',
        lastSeen: device.lastSeen || null
      }));
      setDevices(devicesWithStatus);
      setFilteredDevices(devicesWithStatus);
    } catch (err: any) {
      console.error('Error al cargar dispositivos:', err);
      if (err?.message === 'No hay API Key guardada.') {
        setDevices([]);
        setFilteredDevices([]);
        // No mostrar alerta, solo limpiar la lista
      } else {
        Alert.alert('Error', 'No se pudieron obtener los dispositivos');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterDevices = () => {
    const filtered = devices.filter((device) =>
      device.ids.device_id.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredDevices(filtered);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText
        type="title"
        style={[
          styles.title,
          { color: isDark ? '#00ffff' : colors.primary }
        ]}
      >
        📡 Dispositivos Registrados
      </ThemedText>

      <MiniDashboard
        key={`dashboard-${animationKey}`}
        total={filteredDevices.length}
        activos={filteredDevices.filter((d) => d.status === 'active').length}
        inactivos={filteredDevices.filter((d) => d.status !== 'active').length}
      />

      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder,
            color: colors.text
          }
        ]}
        placeholder="Buscar dispositivo..."
        placeholderTextColor={colors.textSecondary}
        value={searchText}
        onChangeText={handleSearchChange}
      />

      {loading && (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
          <LottieView
            source={require('@/assets/Animation - 2.json')}
            autoPlay
            loop
            style={{ width: 80, height: 80 }}
          />
          <ThemedText style={{ marginTop: 4, fontWeight: '500', color: '#777', fontSize: 12 }}>
            Cargando dispositivos...
          </ThemedText>
        </View>
      )}

      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.ids.device_id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadDevices}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() =>
              router.push(`/detalles?deviceId=${item.ids.device_id}&applicationId=${applicationId}`)
            }
          >
            <Animated.View
              key={`${animationKey}-${item.ids.device_id}`}
              entering={SlideInRight.springify().delay(index * 80)}
              style={[
                styles.deviceCard,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.shadow,
                  borderColor: colors.border
                }
              ]}
            >
              <View style={styles.deviceRow}>
                {/* Badge de estado a la izquierda */}
                <View style={styles.statusBadgeWrapper}>
                  <DeviceStatusBadge
                    status={item.status}
                    lastSeen={item.lastSeen || null}
                    size="small"
                    compact={true}
                  />
                </View>

                {/* Nombre del dispositivo a la derecha */}
                <ThemedText type="defaultSemiBold" style={styles.deviceName}>
                  {item.ids.device_id}
                </ThemedText>
              </View>

              {/* Información de última señal en una línea separada */}
              <View style={styles.lastSeenContainer}>
                <Text style={[styles.lastSeenText, { color: colors.textSecondary }]}>
                  <Text style={[styles.lastSeenLabel, { color: colors.text }]}>Última señal: </Text>
                  {item.lastSeen
                    ? new Date(item.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "No disponible"}
                </Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <ThemedText style={styles.emptyText}>
              No se encontraron dispositivos.
            </ThemedText>
          ) : null
        }
      />

    </SafeAreaView>
  );
}
