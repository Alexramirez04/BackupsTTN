import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { getDevices } from '@/services/ttnApi';
import MiniDashboard from '@/components/MiniDashboard';
import { styles } from '../../styles/dispositivos.styles';

type Device = {
  ids: {
    device_id: string;
  };
  status: string;
  lastSeen?: string | null; // ✅ esto es lo correcto
};

export default function DispositivosScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [animationKey, setAnimationKey] = useState(0);
  const router = useRouter();

  // 🔁 Refresco automático
  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 15000);
    return () => clearInterval(interval);
  }, []);

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
      const result = await getDevices();

      console.log("📡 Dispositivos actualizados:");
      result.forEach((d: any) => {
        console.log(`🔍 ${d.ids.device_id} | status: ${d.status} | lastSeen: ${d.lastSeen}`);
      });

      const devicesWithStatus = result.map((device: Device) => ({
        ...device,
        status: device.status || 'inactive',
        lastSeen: device.lastSeen || null // ✅ este campo es el que faltaba
      }));      

      setDevices(devicesWithStatus);
      setFilteredDevices(devicesWithStatus);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron obtener los dispositivos');
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
    <SafeAreaView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        📡 Dispositivos Registrados
      </ThemedText>

      <MiniDashboard
        key={`dashboard-${animationKey}`}
        total={filteredDevices.length}
        activos={filteredDevices.filter((d) => d.status === 'active').length}
        inactivos={filteredDevices.filter((d) => d.status !== 'active').length}
      />

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar dispositivo..."
        placeholderTextColor="#2d2d33"
        value={searchText}
        onChangeText={handleSearchChange}
      />

      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.ids.device_id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadDevices}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() =>
              router.push(`/detalles?deviceId=${item.ids.device_id}`)
            }
          >
            <Animated.View
              key={`${animationKey}-${item.ids.device_id}`}
              entering={SlideInRight.springify().delay(index * 80)}
              style={styles.deviceCard}
            >
              <View style={styles.deviceRow}>
                <MaterialCommunityIcons
                  name={item.status === 'active' ? 'check-circle' : 'circle'}
                  size={24}
                  color={item.status === 'active' ? '#4CAF50' : '#b81a1a'}
                />
                <ThemedText type="defaultSemiBold" style={styles.deviceName}>
                  {item.ids.device_id}
                </ThemedText>
              </View>

              {/* ✅ MOSTRAR ESTADO Y FECHA VISUAL */}
              <ThemedText style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                Estado real: {item.status} | Última señal:{" "}
                {item.lastSeen ? new Date(item.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "No disponible"}
              </ThemedText>
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

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
    </SafeAreaView>
  );
}
