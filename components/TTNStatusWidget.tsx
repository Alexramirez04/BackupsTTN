import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getDevices } from '@/services/ttnApi';

export default function TTNStatusWidget() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await getDevices();
        setOnline(true);
      } catch (err) {
        setOnline(false);
      }
    };

    checkStatus();

    // Opcional: actualizar estado cada 60 segundos
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (online === null) {
    return (
      <View style={widgetStyles.card}>
        <ActivityIndicator size="small" color="#888" />
        <Text style={widgetStyles.text}>Comprobando conexión...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        widgetStyles.card,
        { backgroundColor: online ? '#D1FAE5' : '#FEE2E2' },
      ]}
    >
      <MaterialCommunityIcons
        name={online ? 'check-circle-outline' : 'close-circle-outline'}
        size={24}
        color={online ? '#10B981' : '#EF4444'}
      />
      <Text
        style={[
          widgetStyles.text,
          { color: online ? '#065F46' : '#991B1B' },
        ]}
      >
        {online ? 'Conectado a TTN' : 'Sin conexión con TTN'}
      </Text>
    </View>
  );
}

const widgetStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});
