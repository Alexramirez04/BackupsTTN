import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function DeviceRedirectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    if (id) {
      // Redirigir a la pantalla de dispositivos
      console.log(`ID de aplicación recibido: ${id}`);

      // Usar setTimeout para asegurarnos de que la redirección ocurra después de que el componente se monte
      setTimeout(() => {
        // Usar la navegación con parámetros para asegurarnos de que se pase correctamente
        router.replace({
          pathname: "/devices/[applicationId]/dispositivos",
          params: { applicationId: id }
        });
      }, 100);
    } else {
      console.error("No se proporcionó un ID de aplicación");
      // Si no hay ID, redirigir a la pantalla de aplicaciones
      router.replace('/aplicaciones');
    }
  }, [id, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ marginTop: 20, color: colors.text }}>
        Redirigiendo...
      </Text>
    </View>
  );
}
