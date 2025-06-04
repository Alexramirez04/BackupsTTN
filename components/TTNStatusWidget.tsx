import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getDevices } from '@/services/ttnApi';
import { useApplication } from '@/context/ApplicationContext';

export default function TTNStatusWidget() {
  const [online, setOnline] = useState<boolean | null>(null);
  const { applicationId } = useApplication();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Si no hay ID de aplicación, intentar verificar la conexión con la API directamente
        if (!applicationId) {
          try {
            // Verificar si la API está disponible haciendo una petición simple
            const response = await fetch("https://eu1.cloud.thethings.network/api/v3", {
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              }
            });
            setOnline(response.ok);
          } catch (err) {
            console.log("Error al verificar conexión con TTN:", err);  
            setOnline(false);
          }
          return;
        }

        // Si hay ID de aplicación, usar getDevices
        await getDevices(console.log, applicationId);
        setOnline(true);
      } catch (err) {
        console.log("Error al verificar dispositivos TTN:", err);
        setOnline(false);
      }
    };

    checkStatus();

    // Opcional: actualizar estado cada 60 segundos
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [applicationId]);

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
